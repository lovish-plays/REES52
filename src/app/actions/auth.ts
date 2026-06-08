'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { getDB, saveDB, User, generateUUID } from '@/lib/db';
import { createClient } from '@/lib/supabaseServer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Helper to get Supabase Admin client
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

  const db = getDB();
  const existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (existingUser) {
    return { error: 'A user with this email already exists.' };
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  // Default role is strictly Student for all new signups
  const role = 'Student';

  const newUser: User = {
    id: 'usr-' + generateUUID(),
    name,
    email: cleanEmail,
    password_hash,
    role,
    enrolled_videos: [],
    purchased_ebooks: []
  };

  db.users.push(newUser);
  saveDB(db);

  // Create JWT Token
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role },
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

  const { password_hash: _, ...userWithoutPassword } = newUser;
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

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  // Match password
  let isMatch = false;
  try {
    isMatch = bcrypt.compareSync(password, user.password_hash);
  } catch (err) {
    console.error("Bcrypt compare error:", err);
  }

  // Fallback for seed admin user password 'admin123' if hash comparison fails
  if (!isMatch && user.email === 'admin@rees52.com' && password === 'admin123') {
    isMatch = true;
    const salt = bcrypt.genSaltSync(10);
    user.password_hash = bcrypt.hashSync('admin123', salt);
    saveDB(db);
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
    maxAge: 60 * 60 * 24 * 7,
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
    // 1. Try Supabase session first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (user) {
      // Fetch role explicitly from public.profiles where id = auth.uid()
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, role, enrolled_videos, purchased_ebooks')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch failed:', profileError.message);
      }

      const role = profile?.role?.toLowerCase() === 'admin' ? 'Admin' : 'Student';
      const name =
        profile?.name?.trim() ||
        (user.user_metadata?.name as string | undefined) ||
        user.email?.split('@')[0] ||
        'User';

      return {
        id: user.id,
        name,
        email: user.email ?? '',
        role: role as 'Admin' | 'Student',
        enrolled_videos: profile?.enrolled_videos ?? [],
        purchased_ebooks: profile?.purchased_ebooks ?? [],
      };
    }

    // 2. Fallback to local session cookie if Supabase auth doesn't have a session
    const cookieStore = await cookies();
    const localToken = cookieStore.get('session')?.value;
    if (localToken) {
      try {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'rees52-cyber-vault-key-987654';
        const decoded = jwt.verify(localToken, JWT_SECRET) as any;
        if (decoded && decoded.userId) {
          const db = getDB();
          const localUser = db.users.find(u => u.id === decoded.userId || u.email.toLowerCase() === decoded.email?.toLowerCase());
          if (localUser) {
            return {
              id: localUser.id,
              name: localUser.name,
              email: localUser.email,
              role: localUser.role as 'Admin' | 'Student',
              enrolled_videos: localUser.enrolled_videos ?? [],
              purchased_ebooks: localUser.purchased_ebooks ?? [],
            };
          }
        }
      } catch (jwtErr: any) {
        console.warn("Local JWT verification failed or expired:", jwtErr.message);
      }
    }

    return null;
  } catch (error) {
    console.error('getCurrentUser failed:', error);
    return null;
  }
}

// Student Action: Enroll in Video Lecture
export async function enrollInVideoAction(videoId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Unauthenticated. Please sign in.' };
  }

  const db = getDB();
  const user = db.users.find(u => u.id === currentUser.id);

  if (!user) {
    return { error: 'User not found' };
  }

  if (!user.enrolled_videos.includes(videoId)) {
    user.enrolled_videos.push(videoId);
    saveDB(db);
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

  const db = getDB();
  const user = db.users.find(u => u.id === currentUser.id);

  if (!user) {
    return { error: 'User not found' };
  }

  if (!user.purchased_ebooks.includes(ebookId)) {
    user.purchased_ebooks.push(ebookId);
    saveDB(db);
  }

  const { password_hash: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export async function createLocalSessionForSupabaseUser(id: string, email: string, name: string, role: string = 'Student') {
  const db = getDB();
  const emailResult = validateAndNormalizeEmail(email);
  const cleanEmail = emailResult.email || email.trim().toLowerCase();
  
  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail || u.id === id);
  
  if (!user) {
    user = {
      id: id,
      name,
      email: cleanEmail,
      password_hash: '', // oauth/supabase users don't need a local password hash
      role: (role.toLowerCase() === 'admin' ? 'Admin' : 'Student'),
      enrolled_videos: [],
      purchased_ebooks: []
    };
    db.users.push(user);
    saveDB(db);
  } else {
    let changed = false;
    if (user.id !== id) {
      user.id = id;
      changed = true;
    }
    const finalRole = (role.toLowerCase() === 'admin' ? 'Admin' : 'Student');
    if (user.role !== finalRole) {
      user.role = finalRole;
      changed = true;
    }
    if (name && user.name !== name) {
      user.name = name;
      changed = true;
    }
    if (user.email !== cleanEmail) {
      user.email = cleanEmail;
      changed = true;
    }
    if (changed) {
      saveDB(db);
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
  return { success: true, user: userWithoutPassword };
}

export async function syncUserByEmailFromSupabase(email: string) {
  const emailResult = validateAndNormalizeEmail(email);
  if (emailResult.error) return false;
  const cleanEmail = emailResult.email!;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    let profile: any = null;

    if (supabaseAdmin) {
      // 1. Try to fetch profile using admin client (bypasses RLS)
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, name, role, enrolled_videos, purchased_ebooks')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (!error && data) {
        profile = data;
      }

      // 2. If profile is not found or profile query failed, check auth.users directly via getUserByEmail
      if (!profile) {
        const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(cleanEmail);
        if (!getUserError && userData?.user) {
          const authUser = userData.user;
          // Found in auth.users! Let's insert a profile row for them so the database is in sync
          const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
          const { data: newProfile, error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: authUser.id,
              name,
              email: cleanEmail,
              role: 'Student',
              enrolled_videos: [],
              purchased_ebooks: []
            })
            .select('id, name, role, enrolled_videos, purchased_ebooks')
            .maybeSingle();

          if (!insertError && newProfile) {
            profile = newProfile;
          } else {
            // Even if profile insert fails (e.g. database schema mismatch or connection issues),
            // we mock a profile object to ensure the user is synced to the local DB for password reset.
            profile = {
              id: authUser.id,
              name,
              email: cleanEmail,
              role: 'Student',
              enrolled_videos: [],
              purchased_ebooks: []
            };
          }
        }
      }
    } else {
      // Fallback to anon client if no admin client is available
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, enrolled_videos, purchased_ebooks')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (!error && data) {
        profile = data;
      }
    }

    if (profile) {
      const db = getDB();
      let user = db.users.find(u => u.email.toLowerCase() === cleanEmail || u.id === profile.id);
      if (!user) {
        user = {
          id: profile.id,
          name: profile.name || 'User',
          email: cleanEmail,
          password_hash: '',
          role: (profile.role?.toLowerCase() === 'admin' ? 'Admin' : 'Student'),
          enrolled_videos: profile.enrolled_videos ?? [],
          purchased_ebooks: profile.purchased_ebooks ?? []
        };
        db.users.push(user);
        saveDB(db);
      } else {
        let changed = false;
        if (user.id !== profile.id) { user.id = profile.id; changed = true; }
        if (user.name !== profile.name) { user.name = profile.name; changed = true; }
        const finalRole = (profile.role?.toLowerCase() === 'admin' ? 'Admin' : 'Student');
        if (user.role !== finalRole) { user.role = finalRole; changed = true; }
        if (changed) saveDB(db);
      }
      return true;
    }
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

  // Try to sync user from Supabase profiles first
  await syncUserByEmailFromSupabase(cleanEmail);

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

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
      return { error: `SMTP server error: ${mailError.message}. Falling back to developer mode.`, mockOtp: otp };
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

  // OTP verified! Update password
  await syncUserByEmailFromSupabase(cleanEmail);
  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { error: "User account not found." };
  }

  // Check if it's a Supabase user (its ID doesn't start with 'usr-')
  const isSupabaseUser = !user.id.startsWith('usr-');
  if (isSupabaseUser) {
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );
      if (adminError) {
        console.error("Supabase Admin password update failed:", adminError.message);
        return { error: `Supabase password reset failed: ${adminError.message}` };
      }
    } else {
      console.warn("Supabase Service Role Key missing. Password updated locally only.");
    }
  }

  // Hash new password using bcrypt
  const salt = bcrypt.genSaltSync(10);
  user.password_hash = bcrypt.hashSync(newPassword, salt);
  saveDB(db);

  // Clear OTP
  otpStore.delete(cleanEmail);

  console.log(`[RESET PASSWORD] Successfully updated password for ${cleanEmail}`);
  
  return { success: true, message: "Password updated successfully." };
}


