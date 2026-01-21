import { supabaseRestPatch } from '@/lib/supabaseAdminFetch';

function toStr(v) {
  return typeof v === 'string' ? v.trim() : '';
}

export async function PATCH(req) {
  try {
    const body = await req.json().catch(() => null);
    const id = toStr(body?.id);
    const status = toStr(body?.status);
    const kycStatus = toStr(body?.kycStatus);

    if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
    if (!status && !kycStatus && !body?.name && !body?.owner && !body?.contactNumber && !body?.email && !body?.state && !body?.city && !body?.category) {
      return Response.json({ error: 'At least one field to update is required' }, { status: 400 });
    }

    const patch = {};
    if (status) patch.status = status;
    if (kycStatus) patch.kyc_status = kycStatus;
    if (body?.name !== undefined) patch.name = toStr(body.name);
    if (body?.owner !== undefined) patch.owner = toStr(body.owner);
    if (body?.owner_name !== undefined) patch.owner_name = toStr(body.owner_name);
    if (body?.contactNumber !== undefined) patch.contact_number = toStr(body.contactNumber);
    if (body?.contact_number !== undefined) patch.contact_number = toStr(body.contact_number);
    if (body?.email !== undefined) patch.email = toStr(body.email) || null;
    if (body?.state !== undefined) patch.state = toStr(body.state) || null;
    if (body?.city !== undefined) patch.city = toStr(body.city) || null;
    if (body?.town !== undefined) patch.town = toStr(body.town) || null;
    if (body?.tehsil !== undefined) patch.tehsil = toStr(body.tehsil) || null;
    if (body?.subTehsil !== undefined) patch.sub_tehsil = toStr(body.subTehsil) || null;
    if (body?.sub_tehsil !== undefined) patch.sub_tehsil = toStr(body.sub_tehsil) || null;
    if (body?.category !== undefined) patch.category = toStr(body.category) || null;
    if (body?.circle !== undefined) patch.circle = toStr(body.circle) || null;

    const updated = await supabaseRestPatch(`/rest/v1/vendors?id=eq.${encodeURIComponent(id)}`, patch);
    return Response.json({ vendor: Array.isArray(updated) ? updated[0] : updated }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e?.message || 'Failed to update vendor' }, { status: 500 });
  }
}

