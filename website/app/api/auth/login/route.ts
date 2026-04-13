import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { phone, email } = body;

        if (!phone && !email) {
            return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
        }

        let filter = '';
        if (phone) {
            let cleaned = phone.replace(/\D/g, '');
            // Handle common prefixes/formats (like +91 or 0)
            if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
            if (cleaned.length === 12 && cleaned.startsWith('91')) {
                cleaned = cleaned.substring(2);
            }
            // Match both versions just in case the database has the prefix or not
            filter = `phone=in.(${encodeURIComponent(cleaned)},91${encodeURIComponent(cleaned)})`;
        } else if (email) {
            filter = `email=eq.${encodeURIComponent(email.trim().toLowerCase())}`;
        }

        const rows = await supabaseRestGet(`/rest/v1/users?${filter}&select=*&limit=1`);

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'No account found. Please register first.' }, { status: 404 });
        }

        const user = rows[0];

        if (user.status === 'Blocked') {
            return NextResponse.json({ error: 'Your account has been blocked. Contact support.' }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                state: user.state || '',
                city: user.city || '',
                status: user.status || 'Active',
                role: 'user',
                createdAt: user.created_at,
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Login error:', error);
        if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND')) {
            return NextResponse.json({ error: 'Database unreachable. Please try again later.' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
    }
}
