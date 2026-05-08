import { supabaseRestGet, supabaseRestPatch } from '@/lib/supabaseAdminFetch';
import bcrypt from 'bcryptjs';

function toStr(v) {
  return typeof v === 'string' ? v.trim() : '';
}

// Simple password hashing (in production, use bcrypt or similar)
// For now, we'll store plain text passwords (NOT RECOMMENDED FOR PRODUCTION)
// TODO: Implement proper password hashing with bcrypt

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return Response.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { method, email, phone, password, otp } = body;

    // Validate method
    if (method !== 'email' && method !== 'sms') {
      return Response.json({ error: 'Method must be "email" or "sms"' }, { status: 400 });
    }

    // Email login
    if (method === 'email') {
      if (!email || !password) {
        return Response.json({ error: 'Email and password are required' }, { status: 400 });
      }

      // Find user by email
      const query = new URLSearchParams();
      query.set('select', '*');
      query.set('email', `eq.${email.toLowerCase()}`);
      query.set('limit', '1');

      const users = await supabaseRestGet(`/rest/v1/users?${query.toString()}`);
      
      if (!Array.isArray(users) || users.length === 0) {
        return Response.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const user = users[0];

      // Check if user has password set
      if (!user.password) {
        return Response.json({ error: 'Password not set. Please register first.' }, { status: 401 });
      }

      // Simple password comparison (in production, use bcrypt.compare)
      const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      const isPlainTextMatch = user.password === password;

      if (!isMatch && !isPlainTextMatch) {
        return Response.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Check user status
      if (user.status === 'Blocked') {
        return Response.json({ error: 'Account is blocked. Please contact support.' }, { status: 403 });
      }

      // Update last_active_at
      try {
        await supabaseRestPatch(
          `/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`,
          { last_active_at: new Date().toISOString() }
        );
      } catch (e) {
        console.error('Error updating last_active_at:', e);
      }

      // Return user data (without password)
      const { password: _, otp: __, otp_expires_at: ___, ...userData } = user;
      return Response.json({
        success: true,
        user: {
          id: userData.id,
          name: userData.full_name || userData.name,
          email: userData.email,
          phone: userData.phone,
          state: userData.state,
          city: userData.city,
          status: userData.status,
        },
      }, { status: 200 });
    }

    // SMS/Mobile login
    if (method === 'sms') {
      if (!phone) {
        return Response.json({ error: 'Phone number is required' }, { status: 400 });
      }

      // Normalize phone number (remove +91, spaces, etc.)
      const normalizedPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');

      // Find user by phone
      const query = new URLSearchParams();
      query.set('select', '*');
      query.set('phone', `eq.${normalizedPhone}`);
      query.set('limit', '1');

      const users = await supabaseRestGet(`/rest/v1/users?${query.toString()}`);
      
      if (!Array.isArray(users) || users.length === 0) {
        return Response.json({ error: 'Phone number not registered' }, { status: 404 });
      }

      const user = users[0];

      // Check user status
      if (user.status === 'Blocked') {
        return Response.json({ error: 'Account is blocked. Please contact support.' }, { status: 403 });
      }

      // 1. Check if login with PASSWORD is provided (Preferred)
      if (password) {
        if (!user.password) {
          return Response.json({ error: 'Password not set. Please use OTP to login first and set a password.' }, { status: 401 });
        }
        const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
        const isPlainTextMatch = user.password === password;

        if (!isMatch && !isPlainTextMatch) {
          return Response.json({ error: 'Invalid password' }, { status: 401 });
        }

        // Success - Return user data
        const { password: _, otp: __, otp_expires_at: ___, ...userData } = user;
        return Response.json({
          success: true,
          user: {
            id: userData.id,
            name: userData.full_name || userData.name,
            email: userData.email,
            phone: userData.phone,
            state: userData.state,
            city: userData.city,
            status: userData.status,
          },
        }, { status: 200 });
      }

      // 2. If OTP is provided, verify it (Backup method)
      if (otp) {
        if (!user.otp || user.otp !== otp) {
          return Response.json({ error: 'Invalid OTP' }, { status: 401 });
        }

        if (user.otp_expires_at && new Date(user.otp_expires_at) < new Date()) {
          return Response.json({ error: 'OTP has expired' }, { status: 401 });
        }

        // Clear OTP after successful verification
        try {
          await supabaseRestPatch(
            `/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`,
            { otp: null, otp_expires_at: null, last_active_at: new Date().toISOString() }
          );
        } catch (e) {
          console.error('Error clearing OTP:', e);
        }

        const { password: _, otp: __, otp_expires_at: ___, ...userData } = user;
        return Response.json({
          success: true,
          user: userData,
        }, { status: 200 });
      } else {
        // No Password and No OTP provided - Tell user to enter password
        return Response.json({ error: 'Password is required' }, { status: 400 });
      }
    }
  } catch (e) {
    console.error('Login error:', e);
    return Response.json({ error: e?.message || 'Login failed' }, { status: 500 });
  }
}
