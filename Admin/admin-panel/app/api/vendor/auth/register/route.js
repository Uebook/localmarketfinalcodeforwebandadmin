import { supabaseRestGet, supabaseRestInsert } from '@/lib/supabaseAdminFetch';
import bcrypt from 'bcryptjs';

// POST /api/vendor/auth/register
export async function POST(req) {
    try {
        const body = await req.json().catch(() => null);
        if (!body) {
            return Response.json({ error: 'Request body is required' }, { status: 400 });
        }

        const { 
            businessName, ownerName, category, subCategory, mobile, email, 
            address, city, state, area, town, circle, pincode, 
            idProofUrl, businessPhotoUrl, shopDocumentUrl,
            latitude, longitude, password
        } = body;

        // Required fields
        if (!password || password.length < 6) {
            return Response.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }
        if (!businessName?.trim()) return Response.json({ error: 'Business name is required' }, { status: 400 });
        if (!ownerName?.trim()) return Response.json({ error: 'Owner name is required' }, { status: 400 });
        if (!category) return Response.json({ error: 'Category is required' }, { status: 400 });
        
        const cleanPhone = (mobile || '').replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return Response.json({ error: 'Valid 10-digit mobile number is required' }, { status: 400 });
        }

        let standardizedPhone = cleanPhone;
        if (standardizedPhone.length === 12 && standardizedPhone.startsWith('91')) {
            standardizedPhone = standardizedPhone.substring(2);
        }

        // Check for duplicate phone
        const existing = await supabaseRestGet(
            `/rest/v1/vendors?contact_number=in.(${encodeURIComponent(standardizedPhone)},91${encodeURIComponent(standardizedPhone)})&select=id,name&limit=1`
        );

        if (Array.isArray(existing) && existing.length > 0) {
            return Response.json({
                error: 'A vendor account already exists with this mobile number. Please login instead.'
            }, { status: 409 });
        }

        // Check duplicate email if provided
        if (email?.trim()) {
            const emailCheck = await supabaseRestGet(
                `/rest/v1/vendors?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&select=id&limit=1`
            );
            if (Array.isArray(emailCheck) && emailCheck.length > 0) {
                return Response.json({ error: 'A vendor account already exists with this email.' }, { status: 409 });
            }
        }

        const generateDisplayId = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let result = '';
            for (let i = 0; i < 5; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        const displayId = generateDisplayId();
        const finalCategory = category === 'Services' && subCategory ? subCategory : category;
        const hashedPassword = await bcrypt.hash(password, 10);

        const vendor = {
            name: businessName.trim(),
            owner_name: ownerName.trim(),
            owner: ownerName.trim(),
            category: finalCategory,
            contact_number: standardizedPhone,
            password: hashedPassword,

            email: email?.trim().toLowerCase() || null,
            address: address?.trim() || null,
            city: city?.trim() || null,
            pincode: pincode?.trim() || null,
            status: 'Pending',
            kyc_status: 'Pending',
            product_count: 0,
            id_proof_url: idProofUrl || null,
            shop_front_photo_url: businessPhotoUrl || null,
            image_url: businessPhotoUrl || null,
            shop_proof_url: shopDocumentUrl || null, 
            display_id: displayId, 
            state: state || null,
            town: area || town || null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            circle: circle || null,
        };

        const result = await supabaseRestInsert('/rest/v1/vendors', [vendor]);
        const saved = Array.isArray(result) ? result[0] : result;

        const vendorSession = {
            id: saved?.id,
            vendorId: saved?.id,
            name: saved?.name ?? businessName.trim(),
            ownerName: saved?.owner_name ?? ownerName.trim(),
            email: saved?.email ?? (email?.trim() || ''),
            phone: saved?.contact_number ?? standardizedPhone,
            contactNumber: saved?.contact_number ?? standardizedPhone,
            category: saved?.category ?? finalCategory,
            address: saved?.address ?? '',
            city: saved?.city ?? '',
            circle: saved?.circle ?? (circle || ''),
            status: 'Pending',
            kycStatus: 'Pending',
            role: 'vendor',
            rating: 0,
            reviewCount: 0,
            latitude: saved?.latitude || latitude,
            longitude: saved?.longitude || longitude,
        };

        return Response.json({ 
            success: true, 
            vendor: vendorSession, 
            user: vendorSession 
        }, { status: 201 });

    } catch (error) {
        console.error('Vendor register error:', error);
        return Response.json({ error: error.message || 'Registration failed' }, { status: 500 });
    }
}
