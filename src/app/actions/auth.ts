'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User, generateUUID, getDB, saveDB } from '@/lib/db';
import { createClient } from '@/lib/supabaseServer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '@/lib/repositories/userRepository';

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

const JWT_SECRET = process.env.JWT_SECRET || 'rees52-cyber-vault-key-987654';

// Helper to get cookies safely
async function getCookieStore() {
  return await cookies();
}

export async function registerUser(formData: any) {
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
    JWT_SECRET,
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
  const { email, password } = formData;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) {
    return { error: emailResult.error };
  }
  const cleanEmail = emailResult.email!;

  // Dynamic admin seed seeding if missing on remote DB
  if (cleanEmail === 'admin@rees52.com') {
    const adminExists = await UserRepository.getUserByEmail('admin@rees52.com');
    if (!adminExists) {
      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync('admin123', salt);
      await UserRepository.createUser({
        id: 'usr-admin',
        name: 'REES52 Admin',
        email: 'admin@rees52.com',
        password_hash,
        role: 'Admin',
        enrolled_videos: [],
        purchased_ebooks: []
      });
    }
  }

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

  // Fallback for seed admin user password 'admin123' if hash comparison fails
  if (!isMatch && user.email === 'admin@rees52.com' && password === 'admin123') {
    isMatch = true;
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync('admin123', salt);
    await UserRepository.updateUser(user.id, { password_hash: newHash });
  }

  if (!isMatch) {
    return { error: 'Invalid email or password.' };
  }

  // Create JWT Token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
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
    const cookieStore = await cookies();
    const localToken = cookieStore.get('session')?.value;
    
    if (localToken) {
      const decoded: any = jwt.verify(localToken, JWT_SECRET);
      const user = await UserRepository.getUserById(decoded.userId);
      if (user) {
        const { password_hash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    
    // Fallback: Dynamic auth checks for Supabase user
    try {
      const supabase = await createClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const user = await UserRepository.getUserById(supabaseUser.id);
        if (user) {
          const { password_hash: _, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
      }
    } catch {}
  } catch (err) {
    console.error("getCurrentUser error:", err);
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

export async function createLocalSessionForSupabaseUser(
  id: string,
  email: string,
  name: string,
  role: string = 'Student',
  avatarUrl?: string,
  provider?: string
) {
  console.log("[authServerAction] createLocalSessionForSupabaseUser started. id:", id, "email:", email);
  try {
    const emailResult = validateAndNormalizeEmail(email);
    const cleanEmail = emailResult.email || email.trim().toLowerCase();
    
    let user = await UserRepository.getUserByEmail(cleanEmail);
    if (!user) {
      user = await UserRepository.getUserById(id);
    }
    
    const finalRole = (role.toLowerCase() === 'admin' ? 'Admin' as const : 'Student' as const);

    if (!user) {
      console.log("[authServerAction] User not found. Creating user record...");
      user = {
        id: id,
        name: name || 'Maker',
        email: cleanEmail,
        password_hash: '',
        role: finalRole,
        enrolled_videos: [],
        purchased_ebooks: [],
        avatar_url: avatarUrl,
        provider: provider || 'google',
        progress: {},
        badges: [],
        streak: undefined,
        recently_viewed: [],
        certificates: []
      };
      await UserRepository.createUser(user);
    } else {
      console.log("[authServerAction] User found. Checking for changes...");
      let changed = false;
      const updates: Partial<User> = {};

      if (user.id !== id) { updates.id = id; user.id = id; changed = true; }
      if (user.role !== finalRole) { updates.role = finalRole; user.role = finalRole; changed = true; }
      if (name && user.name !== name) { updates.name = name; user.name = name; changed = true; }
      if (user.email !== cleanEmail) { updates.email = cleanEmail; user.email = cleanEmail; changed = true; }
      if (avatarUrl && user.avatar_url !== avatarUrl) { updates.avatar_url = avatarUrl; user.avatar_url = avatarUrl; changed = true; }
      if (provider && user.provider !== provider) { updates.provider = provider; user.provider = provider; changed = true; }
      
      if (changed) {
        await UserRepository.updateUser(user.id, updates);
      }
    }

    // Create JWT Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieStore = await getCookieStore();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    const { password_hash: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword, token };
  } catch (err) {
    console.error("createLocalSessionForSupabaseUser error:", err);
    return { error: "Failed to establish active workspace session." };
  }
}

export async function syncUserByEmailFromSupabase(email: string) {
  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) return false;
  const cleanEmail = emailResult.email!;

  try {
    const user = await UserRepository.getUserByEmail(cleanEmail, true);
    return !!user;
  } catch (err) {
    console.error("syncUserByEmailFromSupabase error:", err);
  }
  return false;
}

// In-memory store for reset password OTPs
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function sendPasswordResetOtpAction(email: string) {
  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) return { error: emailResult.error };
  const cleanEmail = emailResult.email!;

  const user = await UserRepository.getUserByEmail(cleanEmail);
  if (!user) {
    return { error: "No account found with this email." };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  otpStore.set(cleanEmail, { otp, expires });

  console.log(`[RESET PASSWORD] Generated OTP ${otp} for ${cleanEmail}. Will expire in 10 minutes.`);

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
            <h3 style="color: #1e293b; text-align: center; text-transform: uppercase; font-size: 14px; margin-top: 0; letter-spacing: 1px;">LEARNING HUB</h3>
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
      return { success: true, message: `OTP code sent successfully to ${cleanEmail}!` };
    } catch (mailError: any) {
      console.error("[NODEMAILER ERROR]", mailError);
      return { 
        success: true, 
        message: `SMTP error: ${mailError.message}. Fell back to developer mode.`, 
        mockOtp: otp 
      };
    }
  }

  return { 
    success: true, 
    message: `OTP code simulated. Add SMTP_USER and SMTP_PASS in .env for actual delivery.`, 
    mockOtp: otp 
  };
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

  if (cached.otp !== otp.trim()) {
    return { error: "Invalid OTP code. Please check and try again." };
  }

  return { success: true, message: "OTP code verified successfully!" };
}

export async function resetPasswordWithOtpAction(email: string, otp: string, newPassword: string) {
  if (!email || !otp || !newPassword) {
    return { error: "Please fill in all fields." };
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

  if (cached.otp !== otp.trim()) {
    return { error: "Invalid OTP code. Please check and try again." };
  }

  const user = await UserRepository.getUserByEmail(cleanEmail);
  if (!user) {
    return { error: "User account not found." };
  }

  // Check if it's a Supabase user
  const isTestUser = cleanEmail.endsWith('@rees52.com') && (cleanEmail.startsWith('student-') || cleanEmail.startsWith('temp-reset-'));
  const isLocalAdmin = cleanEmail.toLowerCase() === 'admin@rees52.com';
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  const isSupabaseUser = !isLocalAdmin && !isTestUser && hasSupabaseUrl;
  if (isSupabaseUser) {
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
            user.id = authUser.id;
            await UserRepository.updateUser(user.id, { id: authUser.id });
          } else {
            return { error: "No matching authentication record found in Supabase Auth." };
          }
        } catch (err: any) {
          console.error("Failed to lookup Supabase user by email during reset:", err.message);
          return { error: `Supabase lookup failed: ${err.message}` };
        }
      }

      const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
        supabaseUserId,
        { password: newPassword }
      );
      if (adminError) {
        console.error("Supabase Admin password update failed:", adminError.message);
        return { error: `Supabase password reset failed: ${adminError.message}` };
      }
    } else {
      console.error("Supabase Service Role Key missing. Cannot update password in Supabase Auth.");
      return { error: "Configuration error: The server is missing the Supabase Service Role Key." };
    }
  }

  // Hash new password using bcrypt
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(newPassword, salt);
  await UserRepository.updateUser(user.id, { password_hash });

  // Clear OTP
  otpStore.delete(cleanEmail);

  console.log(`[RESET PASSWORD] Successfully updated password for ${cleanEmail}`);
  
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
    id: 'cert-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
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

export async function trackAnalyticsEventAction(eventType: string, eventData: any) {
  const currentUser = await getCurrentUser();
  const db = getDB();

  if (!(db as any).analytics_events) {
    (db as any).analytics_events = [];
  }

  (db as any).analytics_events.push({
    id: generateUUID(),
    userId: currentUser?.id || 'anonymous',
    eventType,
    eventData,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  return { success: true };
}

export async function getAnalyticsSummaryAction() {
  const db = getDB();
  const events = (db as any).analytics_events || [];

  const totalViews = events.filter((e: any) => e.eventType === 'project_view').length;
  const totalStarts = events.filter((e: any) => e.eventType === 'course_start').length;
  const totalCompletions = events.filter((e: any) => e.eventType === 'course_complete').length;
  const totalSearches = events.filter((e: any) => e.eventType === 'search').length;
  const totalBuyClicks = events.filter((e: any) => e.eventType === 'buy_kit_click').length;

  const searchQueries: string[] = events
    .filter((e: any) => e.eventType === 'search')
    .map((e: any) => e.eventData?.query || '')
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
