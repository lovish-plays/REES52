'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { User, generateUUID, getDB, saveDB } from '@/lib/db';
import { createClient } from '@/lib/supabaseServer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '@/lib/repositories/userRepository';
import { hasSupabaseEnv } from '@/lib/supabaseConfig';
import { isTeacherRole } from '@/lib/auth/roles';

// Helper to get Supabase Admin client for sensitive queries
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return null;
}

// Helper for email validation and normalization
function validateAndNormalizeEmail(email: string): { email?: string; error?: string } {
  if (!email) {
    return { error: 'Email address is required.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { error: 'Please enter a valid email address.' };
  }
  return { email: cleanEmail };
}

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 5000, // 5 seconds
  greetingTimeout: 5000,   // 5 seconds
  socketTimeout: 5000,     // 5 seconds
});

type AuthRuntimeState = typeof globalThis & {
  __rees52LocalJwtSecret?: string;
  __rees52OtpSecret?: string;
  __rees52OtpStore?: Map<string, OtpRecord>;
};

type OtpRecord = {
  digest: string;
  expires: number;
  attempts: number;
  lastSentAt: number;
};

const authRuntime = globalThis as AuthRuntimeState;

function isLocalAuthEnabled() {
  return process.env.NODE_ENV !== 'production' && !hasSupabaseEnv;
}

function getLocalJwtSecret() {
  if (!isLocalAuthEnabled()) {
    throw new Error('Local authentication is disabled.');
  }

  const configuredSecret = process.env.JWT_SECRET?.trim();
  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  authRuntime.__rees52LocalJwtSecret ??= randomBytes(32).toString('hex');
  return authRuntime.__rees52LocalJwtSecret;
}

function getOtpSecret() {
  const configuredSecret = process.env.OTP_SECRET?.trim() || process.env.JWT_SECRET?.trim();
  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('OTP_SECRET must be configured in production.');
  }

  authRuntime.__rees52OtpSecret ??= randomBytes(32).toString('hex');
  return authRuntime.__rees52OtpSecret;
}

function digestOtp(email: string, otp: string) {
  return createHash('sha256')
    .update(`${email}:${otp}:${getOtpSecret()}`)
    .digest('hex');
}

function otpMatches(record: OtpRecord, email: string, otp: string) {
  const expected = Buffer.from(record.digest, 'hex');
  const actual = Buffer.from(digestOtp(email, otp), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// Helper to get cookies safely
async function getCookieStore() {
  return await cookies();
}

export async function registerUser(formData: any) {
  if (!isLocalAuthEnabled()) {
    return { error: 'Local account registration is disabled.' };
  }

  const { name, email, password } = formData;

  if (!name || !email || !password) {
    return { error: 'Please fill in all fields.' };
  }

  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) {
    return { error: emailResult.error };
  }
  const cleanEmail = emailResult.email!;

  const existingUser = await UserRepository.getUserByEmail(cleanEmail);
  if (existingUser) {
    return { error: 'A user with this email already exists.' };
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  // Default role is strictly Student for all new signups
  const role = 'Student';

  const newUser: Partial<User> = {
    id: 'usr-' + generateUUID(),
    name,
    email: cleanEmail,
    password_hash,
    role,
    enrolled_videos: [],
    purchased_ebooks: [],
    progress: {},
    badges: [],
    streak: { current: 0, longest: 0, lastActivityDate: '' },
    certificates: [],
    recently_viewed: []
  };

  const createRes = await UserRepository.createUser(newUser);
  if (!createRes.success || !createRes.user) {
    return { error: createRes.error || 'Failed to register user.' };
  }

  // Create JWT Token
  const token = jwt.sign(
    { userId: createRes.user.id, email: createRes.user.email, role: createRes.user.role },
    getLocalJwtSecret(),
    { expiresIn: '7d' }
  );

  const cookieStore = await getCookieStore();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });

  const { password_hash: _, ...userWithoutPassword } = createRes.user;
  return { success: true, user: userWithoutPassword };
}

export async function loginUser(formData: any) {
  if (!isLocalAuthEnabled()) {
    return { error: 'Use the configured identity provider to sign in.' };
  }

  const { email, password } = formData;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) {
    return { error: emailResult.error };
  }
  const cleanEmail = emailResult.email!;

  const user = await UserRepository.getUserByEmail(cleanEmail);
  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  // Intercept Google-only users attempting password login
  if (!user.password_hash && user.provider === 'google') {
    return { error: 'This account uses Google sign-in. Please click "Continue with Google" to log in.' };
  }

  // Match password
  let isMatch = false;
  if (user.password_hash) {
    try {
      isMatch = bcrypt.compareSync(password, user.password_hash);
    } catch (err) {
      console.error("Bcrypt compare error:", err);
    }
  }

  if (!isMatch) {
    return { error: 'Invalid email or password.' };
  }

  // Create JWT Token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    getLocalJwtSecret(),
    { expiresIn: '7d' }
  );

  const cookieStore = await getCookieStore();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });

  const { password_hash: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export async function logoutUser() {
  const cookieStore = await getCookieStore();
  cookieStore.delete('session');
  return { success: true };
}

export async function getCurrentUser() {
  try {
    if (hasSupabaseEnv) {
      const supabase = await createClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const user = await UserRepository.getUserById(supabaseUser.id);
        if (user) {
          const { password_hash: _, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
      }
      return null;
    }

    if (!isLocalAuthEnabled()) return null;

    const cookieStore = await cookies();
    const localToken = cookieStore.get('session')?.value;
    if (!localToken) return null;

    const decoded = jwt.verify(localToken, getLocalJwtSecret()) as { userId?: string };
    if (!decoded.userId) return null;

    const user = await UserRepository.getUserById(decoded.userId);
    if (user) {
      const { password_hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Unable to resolve the current user:', err);
    }
  }
  return null;
}

// Student Action: Enroll in Video Lecture
export async function enrollInVideoAction(videoId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Unauthenticated. Please sign in.' };
  }

  const user = await UserRepository.getUserById(currentUser.id);
  if (!user) {
    return { error: 'User not found' };
  }

  if (!user.enrolled_videos.includes(videoId)) {
    const nextList = [...user.enrolled_videos, videoId];
    await UserRepository.updateUser(user.id, { enrolled_videos: nextList });
    user.enrolled_videos = nextList;
  }

  const { password_hash: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

// Student Action: Enroll in an LMS course.
export async function enrollInCourseAction(courseSlug: string) {
  const cleanSlug = courseSlug?.trim().toLowerCase();
  if (!cleanSlug) return { error: 'A course is required.' };

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Unauthenticated. Please sign in.' };
  }

  const user = await UserRepository.getUserById(currentUser.id);
  if (!user) return { error: 'User not found.' };

  if (hasSupabaseEnv) {
    try {
      const supabase = await createClient();
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id,is_published,is_free')
        .eq('slug', cleanSlug)
        .maybeSingle();

      if (courseError || !course?.id || course.is_published === false) {
        return { error: 'This course is not available for enrollment yet.' };
      }
      if (course.is_free === false) {
        return { error: 'Paid checkout must be completed before enrolling in this course.' };
      }

      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .upsert(
          { user_id: user.id, course_id: course.id, progress_percentage: 0 },
          { onConflict: 'user_id,course_id', ignoreDuplicates: true },
        );
      if (enrollmentError) return { error: enrollmentError.message };
      return { success: true };
    } catch {
      return { error: 'Unable to enroll right now. Please try again.' };
    }
  }

  const enrolledCourses = user.enrolled_courses || [];
  if (!enrolledCourses.includes(cleanSlug)) {
    const nextCourses = [...enrolledCourses, cleanSlug];
    const updated = await UserRepository.updateUser(user.id, { enrolled_courses: nextCourses });
    if (!updated) return { error: 'Unable to save enrollment.' };
  }

  return { success: true };
}

// Student Action: Unlock/Purchase Ebook
export async function purchaseEbookAction(ebookId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Unauthenticated. Please sign in.' };
  }

  const user = await UserRepository.getUserById(currentUser.id);
  if (!user) {
    return { error: 'User not found' };
  }

  if (!user.purchased_ebooks.includes(ebookId)) {
    const nextList = [...user.purchased_ebooks, ebookId];
    await UserRepository.updateUser(user.id, { purchased_ebooks: nextList });
    user.purchased_ebooks = nextList;
  }

  const { password_hash: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export async function createLocalSessionForSupabaseUser() {
  try {
    if (!hasSupabaseEnv) {
      return { error: 'Supabase authentication is not configured.' };
    }

    const supabase = await createClient();
    const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authenticatedUser?.id || !authenticatedUser.email) {
      return { error: 'An authenticated Supabase session is required.' };
    }

    const cleanEmail = authenticatedUser.email.trim().toLowerCase();
    const name =
      (typeof authenticatedUser.user_metadata?.full_name === 'string' && authenticatedUser.user_metadata.full_name.trim()) ||
      (typeof authenticatedUser.user_metadata?.name === 'string' && authenticatedUser.user_metadata.name.trim()) ||
      cleanEmail.split('@')[0] ||
      'Maker';
    const provider =
      typeof authenticatedUser.app_metadata?.provider === 'string'
        ? authenticatedUser.app_metadata.provider
        : 'email';

    let user = await UserRepository.getUserById(authenticatedUser.id);
    if (!user) {
      const createResult = await UserRepository.createUser({
        id: authenticatedUser.id,
        name,
        email: cleanEmail,
        role: 'Student',
        enrolled_courses: [],
        enrolled_videos: [],
        purchased_ebooks: [],
        provider,
        progress: {},
        badges: [],
        streak: { current: 0, longest: 0, lastActivityDate: '' },
        recently_viewed: [],
        certificates: []
      });

      if (!createResult.success || !createResult.user) {
        return { error: createResult.error || 'Unable to create the authenticated profile.' };
      }
      user = createResult.user;
    } else {
      const updates: Partial<User> = {};
      if (user.name !== name) updates.name = name;
      if (user.email !== cleanEmail) updates.email = cleanEmail;
      if (user.provider !== provider) updates.provider = provider;

      if (Object.keys(updates).length > 0) {
        await UserRepository.updateUser(user.id, updates);
        user = { ...user, ...updates };
      }
    }

    // Supabase is the production identity authority. Remove any stale local cookie
    // instead of minting a second browser-supplied identity token.
    const cookieStore = await getCookieStore();
    cookieStore.delete('session');

    const { password_hash: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Unable to synchronize the authenticated profile:', err);
    }
    return { error: 'Failed to establish the authenticated workspace session.' };
  }
}

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_DELAY_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const otpStore = authRuntime.__rees52OtpStore ??= new Map<string, OtpRecord>();

function resetRequestMessage() {
  return 'If an account exists for that email, a verification code has been sent.';
}

export async function sendPasswordResetOtpAction(email: string) {
  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) return { error: emailResult.error };
  const cleanEmail = emailResult.email!;

  const user = await UserRepository.getUserByEmail(cleanEmail, true);
  if (!user) {
    return { success: true, message: resetRequestMessage() };
  }

  const now = Date.now();
  const existingRequest = otpStore.get(cleanEmail);
  if (existingRequest && now - existingRequest.lastSentAt < OTP_RESEND_DELAY_MS) {
    return { success: true, message: resetRequestMessage() };
  }

  const otp = randomInt(100000, 1000000).toString();
  const expires = now + OTP_TTL_MS;

  otpStore.set(cleanEmail, {
    digest: digestOtp(cleanEmail, otp),
    expires,
    attempts: 0,
    lastSentAt: now,
  });

  const otpSubject = process.env.SMTP_OTP_SUBJECT || "Password Reset Verification Code - REES52";
  const otpGreeting = process.env.SMTP_OTP_GREETING || "Hello Maker,";
  const otpBody = process.env.SMTP_OTP_BODY || "You requested to reset your password. Use the following 6-digit verification code to complete your reset request:";
  const otpFooter = process.env.SMTP_OTP_FOOTER || "This verification code is valid for 10 minutes. If you did not request this code, you can safely ignore this message.";

  if (SMTP_USER && SMTP_PASS) {
    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'REES52 Learning'}" <${SMTP_USER}>`,
        to: cleanEmail,
        subject: otpSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #F7F4EB;">
            <h2 style="color: #0891B2; text-align: center; text-transform: uppercase; margin-bottom: 5px;">REES52</h2>
            <h3 style="color: #1e293b; text-align: center; text-transform: uppercase; font-size: 14px; margin-top: 0; letter-spacing: 1px;">REES52 ACADEMY</h3>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">${otpGreeting}</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">${otpBody}</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; background-color: rgba(255, 255, 255, 0.75); padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.25); display: inline-block;">
                ${otp}
              </span>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">${otpFooter}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="text-align: center; font-size: 11px; color: #94a3b8; text-transform: uppercase; tracking-widest;">REES52 Electronics & Robotics Education Services</p>
          </div>
        `,
      });
      return { success: true, message: resetRequestMessage() };
    } catch (mailError: any) {
      otpStore.delete(cleanEmail);
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unable to send the password reset email:', mailError);
      }
      return { error: 'Unable to send a verification code right now. Please try again later.' };
    }
  }

  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEV_OTP === 'true') {
    return {
      success: true,
      message: 'Development verification code generated.',
      mockOtp: otp,
    };
  }

  otpStore.delete(cleanEmail);
  return { error: 'Password recovery email is not configured.' };
}

export async function verifyOtpAction(email: string, otp: string) {
  if (!email || !otp) {
    return { error: "Please enter the OTP code." };
  }

  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) return { error: emailResult.error };
  const cleanEmail = emailResult.email!;

  const cached = otpStore.get(cleanEmail);
  if (!cached) {
    return { error: "No OTP request found for this email." };
  }

  if (cached.expires < Date.now()) {
    otpStore.delete(cleanEmail);
    return { error: "OTP code has expired. Please request a new one." };
  }

  if (cached.attempts >= OTP_MAX_ATTEMPTS) {
    otpStore.delete(cleanEmail);
    return { error: 'Too many incorrect attempts. Request a new verification code.' };
  }

  if (!otpMatches(cached, cleanEmail, otp.trim())) {
    cached.attempts += 1;
    otpStore.set(cleanEmail, cached);
    return { error: "Invalid OTP code. Please check and try again." };
  }

  return { success: true, message: "OTP code verified successfully!" };
}

export async function resetPasswordWithOtpAction(email: string, otp: string, newPassword: string) {
  if (!email || !otp || !newPassword) {
    return { error: "Please fill in all fields." };
  }

  if (newPassword.length < 8) {
    return { error: 'Password must contain at least 8 characters.' };
  }

  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) return { error: emailResult.error };
  const cleanEmail = emailResult.email!;

  const cached = otpStore.get(cleanEmail);
  if (!cached) {
    return { error: "No OTP request found for this email." };
  }

  if (cached.expires < Date.now()) {
    otpStore.delete(cleanEmail);
    return { error: "OTP code has expired. Please request a new one." };
  }

  if (cached.attempts >= OTP_MAX_ATTEMPTS) {
    otpStore.delete(cleanEmail);
    return { error: 'Too many incorrect attempts. Request a new verification code.' };
  }

  if (!otpMatches(cached, cleanEmail, otp.trim())) {
    cached.attempts += 1;
    otpStore.set(cleanEmail, cached);
    return { error: "Invalid OTP code. Please check and try again." };
  }

  const user = await UserRepository.getUserByEmail(cleanEmail, true);
  if (!user) {
    return { error: "User account not found." };
  }

  if (hasSupabaseEnv) {
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      let supabaseUserId = user.id;
      if (supabaseUserId.startsWith('usr-')) {
        try {
          let page = 1;
          const perPage = 100;
          let authUser: any = null;
          while (true) {
            const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
              page,
              perPage
            });
            if (listError || !listData?.users || listData.users.length === 0) {
              break;
            }
            const found = listData.users.find((u: any) => u.email?.toLowerCase() === cleanEmail);
            if (found) {
              authUser = found;
              break;
            }
            if (listData.users.length < perPage) {
              break;
            }
            page++;
          }
          if (authUser) {
            supabaseUserId = authUser.id;
          } else {
            return { error: 'Unable to locate the authentication record.' };
          }
        } catch (err: any) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Unable to locate the Supabase authentication record:', err);
          }
          return { error: 'Unable to locate the authentication record.' };
        }
      }

      const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
        supabaseUserId,
        { password: newPassword }
      );
      if (adminError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Supabase password update failed:', adminError);
        }
        return { error: 'Unable to update the password right now.' };
      }
    } else {
      return { error: 'Password recovery is not configured.' };
    }
  } else if (isLocalAuthEnabled()) {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(newPassword, salt);
    const updated = await UserRepository.updateUser(user.id, { password_hash });
    if (!updated) {
      return { error: 'Unable to update the password right now.' };
    }
  } else {
    return { error: 'Password recovery is unavailable.' };
  }

  // Clear OTP
  otpStore.delete(cleanEmail);

  return { success: true, message: "Password updated successfully." };
}

export async function saveProgressAction(courseId: string, percentage: number, lastViewedLesson?: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthenticated." };

  const user = await UserRepository.getUserById(currentUser.id);
  if (!user) return { error: "User not found." };

  if (!user.progress) user.progress = {};

  const existing = user.progress[courseId] || { percentage: 0, updated_at: new Date().toISOString() };
  const newPercentage = Math.max(existing.percentage, percentage);

  user.progress[courseId] = {
    percentage: newPercentage,
    lastViewedLesson: lastViewedLesson || existing.lastViewedLesson || "Introduction",
    updated_at: new Date().toISOString(),
    completed_at: newPercentage === 100 ? (existing.completed_at || new Date().toISOString()) : existing.completed_at
  };

  // Check achievements logic
  if (!user.badges) user.badges = [];
  
  // 1. Check "First Project" badge (first completion)
  const completedCount = Object.values(user.progress).filter(p => p.percentage === 100).length;
  const hasFirstProject = user.badges.some(b => b.badgeId === 'first-project');
  if (completedCount >= 1 && !hasFirstProject) {
    user.badges.push({
      id: 'badge-' + generateUUID(),
      badgeId: 'first-project',
      name: 'First Project',
      description: 'Completed your first learning module on REES52!',
      awardedAt: new Date().toISOString()
    });
  }

  // Helper function to count completions by category
  const countCompletionsByCategory = (catSlug: string) => {
    let count = 0;
    for (const [cId, prog] of Object.entries(user.progress || {})) {
      if (prog.percentage !== 100) continue;
      if (catSlug === 'arduino-microcontrollers' && (cId.includes('1') || cId.includes('33333333-3333-3333-3333-333333333331') || cId.includes('44444444-4444-4444-4444-444444444441'))) count++;
      if (catSlug === 'robotics-smart-cars' && (cId.includes('2') || cId.includes('33333333-3333-3333-3333-333333333332') || cId.includes('44444444-4444-4444-4444-444444444442'))) count++;
      if (catSlug === 'iot-sensors' && (cId.includes('3') || cId.includes('33333333-3333-3333-3333-333333333333') || cId.includes('44444444-4444-4444-4444-444444444443'))) count++;
    }
    return count;
  };

  // 2. Arduino Beginner
  const hasArduinoBeginner = user.badges.some(b => b.badgeId === 'arduino-beginner');
  if (countCompletionsByCategory('arduino-microcontrollers') >= 1 && !hasArduinoBeginner) {
    user.badges.push({
      id: 'badge-' + generateUUID(),
      badgeId: 'arduino-beginner',
      name: 'Arduino Beginner',
      description: 'Completed your first Arduino microcontroller project!',
      awardedAt: new Date().toISOString()
    });
  }

  // 3. IoT Explorer
  const hasIotExplorer = user.badges.some(b => b.badgeId === 'iot-explorer');
  if (countCompletionsByCategory('iot-sensors') >= 1 && !hasIotExplorer) {
    user.badges.push({
      id: 'badge-' + generateUUID(),
      badgeId: 'iot-explorer',
      name: 'IoT Explorer',
      description: 'Completed your first IoT and sensor telemetry project!',
      awardedAt: new Date().toISOString()
    });
  }

  // 4. Robotics Builder
  const hasRoboticsBuilder = user.badges.some(b => b.badgeId === 'robotics-builder');
  if (countCompletionsByCategory('robotics-smart-cars') >= 1 && !hasRoboticsBuilder) {
    user.badges.push({
      id: 'badge-' + generateUUID(),
      badgeId: 'robotics-builder',
      name: 'Robotics Builder',
      description: 'Completed your first Robotics mechanical assembly project!',
      awardedAt: new Date().toISOString()
    });
  }

  await UserRepository.updateUser(user.id, {
    progress: user.progress,
    badges: user.badges
  });

  return { success: true, progress: user.progress[courseId], badges: user.badges };
}

export async function claimCertificateAction(courseId: string, courseName: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthenticated." };

  const user = await UserRepository.getUserById(currentUser.id);
  if (!user) return { error: "User not found." };

  // Verify course progress is 100%
  const prog = user.progress?.[courseId];
  if (!prog || prog.percentage !== 100) {
    return { error: "Course progress must be 100% to claim a certificate." };
  }

  if (!user.certificates) user.certificates = [];

  // Check if certificate already exists
  const existingCert = user.certificates.find(c => c.courseId === courseId);
  if (existingCert) {
    return { success: true, certificate: existingCert };
  }

  const newCert = {
    id: 'cert-' + generateUUID().replace(/-/g, '').substring(0, 8).toUpperCase(),
    courseId,
    courseName,
    completionDate: prog.completed_at || new Date().toISOString(),
    userName: user.name
  };

  user.certificates.push(newCert);

  await UserRepository.updateUser(user.id, {
    certificates: user.certificates
  });

  return { success: true, certificate: newCert };
}

export async function updateStreakAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthenticated." };

  const user = await UserRepository.getUserById(currentUser.id);
  if (!user) return { error: "User not found." };

  const todayStr = new Date().toISOString().split('T')[0];
  const lastActive = user.streak?.lastActivityDate;

  let current = 1;
  let longest = user.streak?.longest || 1;

  if (lastActive) {
    const lastActiveDate = new Date(lastActive);
    const todayDate = new Date(todayStr);
    const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      current = (user.streak?.current || 0) + 1;
      longest = Math.max(longest, current);
    } else if (diffDays === 0) {
      // Same day, no update to count, just preserve
      current = user.streak?.current || 1;
    } else {
      // Broken streak
      current = 1;
    }
  }

  const newStreak = {
    current,
    longest,
    lastActivityDate: todayStr
  };

  await UserRepository.updateUser(user.id, {
    streak: newStreak
  });

  return { success: true, streak: newStreak };
}

export async function addRecentlyViewedAction(courseId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthenticated." };

  const user = await UserRepository.getUserById(currentUser.id);
  if (!user) return { error: "User not found." };

  if (!user.recently_viewed) user.recently_viewed = [];

  // Remove existing to push to front
  let nextList = user.recently_viewed.filter(id => id !== courseId);
  nextList.unshift(courseId);
  // Cap at 4
  const finalRecentlyViewed = nextList.slice(0, 4);

  await UserRepository.updateUser(user.id, {
    recently_viewed: finalRecentlyViewed
  });

  return { success: true, recently_viewed: finalRecentlyViewed };
}

export async function trackAnalyticsEventAction(eventType: string, eventData: unknown) {
  if (typeof eventType !== 'string') {
    return { error: 'An event type is required.' };
  }

  const normalizedEventType = eventType.trim().slice(0, 64);
  if (!normalizedEventType) {
    return { error: 'An event type is required.' };
  }

  const normalizedEventData =
    eventData && typeof eventData === 'object' && !Array.isArray(eventData)
      ? eventData as Record<string, unknown>
      : {};

  try {
    if (JSON.stringify(normalizedEventData).length > 4096) {
      return { error: 'Analytics payload is too large.' };
    }
  } catch {
    return { error: 'Analytics payload is invalid.' };
  }

  const currentUser = await getCurrentUser();
  const db = getDB();

  const analyticsEvents = db.analytics_events ?? [];
  analyticsEvents.push({
    id: generateUUID(),
    userId: currentUser?.id || 'anonymous',
    eventType: normalizedEventType,
    eventData: normalizedEventData,
    timestamp: new Date().toISOString()
  });
  db.analytics_events = analyticsEvents.slice(-1000);
  saveDB(db);
  return { success: true };
}

export async function getAnalyticsSummaryAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !isTeacherRole(currentUser.role)) {
    return { error: 'Teacher access is required.' };
  }

  const db = getDB();
  const events = db.analytics_events ?? [];

  const totalViews = events.filter((event) => event.eventType === 'project_view').length;
  const totalStarts = events.filter((event) => event.eventType === 'course_start').length;
  const totalCompletions = events.filter((event) => event.eventType === 'course_complete').length;
  const totalSearches = events.filter((event) => event.eventType === 'search').length;
  const totalBuyClicks = events.filter((event) => event.eventType === 'buy_kit_click').length;

  const searchQueries: string[] = events
    .filter((event) => event.eventType === 'search')
    .map((event) => typeof event.eventData.query === 'string' ? event.eventData.query : '')
    .filter(Boolean);

  const queryCounts: Record<string, number> = {};
  searchQueries.forEach(q => {
    queryCounts[q] = (queryCounts[q] || 0) + 1;
  });

  const topSearches = Object.entries(queryCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalViews,
    totalStarts,
    totalCompletions,
    totalSearches,
    totalBuyClicks,
    topSearches,
    totalEvents: events.length
  };
}
