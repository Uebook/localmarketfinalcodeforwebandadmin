import { supabaseRestGet, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const email = body.email.toLowerCase();

    // 1. Check if user exists in the 'users' table
    const userQuery = new URLSearchParams();
    userQuery.set('select', '*');
    userQuery.set('email', `eq.${email}`);
    userQuery.set('limit', '1');

    const users = await supabaseRestGet(`/rest/v1/users?${userQuery.toString()}`);
    
    // 2. Also check if user exists in the 'vendors' table (as Partners use email too)
    const vendorQuery = new URLSearchParams();
    vendorQuery.set('select', '*');
    vendorQuery.set('email', `eq.${email}`);
    vendorQuery.set('limit', '1');

    const vendors = await supabaseRestGet(`/rest/v1/vendors?${vendorQuery.toString()}`);

    const user = (Array.isArray(users) && users.length > 0) ? users[0] : null;
    const vendor = (Array.isArray(vendors) && vendors.length > 0) ? vendors[0] : null;

    if (!user && !vendor) {
      return Response.json({ error: 'No account found with this email' }, { status: 404 });
    }

    // Determine target table and ID
    const targetTable = user ? 'users' : 'vendors';
    const targetId = user ? user.id : vendor.id;

    // 3. Generate OTP (mocked to 1234 for dev)
    const generatedOtp = '1234';
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 mins

    // 4. Save OTP to DB
    await supabaseRestPatch(
      `/rest/v1/${targetTable}?id=eq.${encodeURIComponent(targetId)}`,
      { 
        otp: generatedOtp,
        otp_expires_at: expiresAt.toISOString()
      }
    );

    // In production, send email here
    console.log(`[Forgot Password] OTP for ${email}: ${generatedOtp}`);

    return Response.json({ 
      success: true, 
      message: 'OTP sent to your email',
      otp: generatedOtp // Including in response for dev testing
    });

  } catch (error) {
    console.error('Forgot password POST error:', error);
    return Response.json({ error: error.message || 'Failed to request reset' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.email || !body.otp || !body.newPassword) {
      return Response.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    const { email, otp, newPassword } = body;
    const lowerEmail = email.toLowerCase();

    // 1. Find user/vendor
    const users = await supabaseRestGet(`/rest/v1/users?email=eq.${lowerEmail}&limit=1`);
    const vendors = await supabaseRestGet(`/rest/v1/vendors?email=eq.${lowerEmail}&limit=1`);

    const user = (Array.isArray(users) && users.length > 0) ? users[0] : null;
    const vendor = (Array.isArray(vendors) && vendors.length > 0) ? vendors[0] : null;

    if (!user && !vendor) {
      return Response.json({ error: 'Account not found' }, { status: 404 });
    }

    const data = user || vendor;
    const targetTable = user ? 'users' : 'vendors';

    // 2. Verify OTP
    if (!data.otp || data.otp !== otp) {
      return Response.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    if (data.otp_expires_at && new Date(data.otp_expires_at) < new Date()) {
      return Response.json({ error: 'OTP has expired' }, { status: 401 });
    }

    // 3. Update Password and clear OTP
    // Note: Storing plain text password for parity with existing login logic
    await supabaseRestPatch(
      `/rest/v1/${targetTable}?id=eq.${encodeURIComponent(data.id)}`,
      { 
        password: newPassword,
        otp: null,
        otp_expires_at: null
      }
    );

    return Response.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Forgot password PATCH error:', error);
    return Response.json({ error: error.message || 'Failed to reset password' }, { status: 500 });
  }
}
