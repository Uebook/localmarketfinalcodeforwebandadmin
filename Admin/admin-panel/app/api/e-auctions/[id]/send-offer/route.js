import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestInsert, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

// POST /api/e-auctions/[id]/send-offer - Send offer notification to circle users
export async function POST(request, { params }) {
    try {
        const { id } = params;

        // Get auction details
        const auctions = await supabaseRestGet(`/rest/v1/e_auctions?id=eq.${id}&select=*`);
        if (!auctions || !auctions[0]) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        const auction = auctions[0];

        // Get users in the circle from search logs (users don't have circle column)
        // Find unique user_ids who have searched in this circle
        const searchLogs = await supabaseRestGet(
            `/rest/v1/search_logs?location_circle=eq.${encodeURIComponent(auction.circle)}&select=user_id&user_id=not.is.null`
        );

        // Get unique user IDs
        const uniqueUserIds = [...new Set(searchLogs.map(log => log.user_id).filter(Boolean))];

        if (!uniqueUserIds || uniqueUserIds.length === 0) {
            return NextResponse.json({ error: 'No users found in this circle' }, { status: 404 });
        }

        // Verify users are active (optional - if you want to filter by status)
        // Note: This is a simplified approach. For better accuracy, you might want to join with users table
        const users = uniqueUserIds.map(id => ({ id }));

        // Create notifications for all users
        const notifications = users.map(user => ({
            user_id: user.id,
            type: 'e_auction',
            title: `New ${auction.type === 'e-auction' ? 'E-Auction' : 'Online Draw'}: ${auction.title}`,
            message: `A new ${auction.type === 'e-auction' ? 'e-auction' : 'online draw'} has started in your circle. Check it out!`,
            metadata: { auction_id: id },
            status: 'pending',
        }));

        // Insert notifications in batches (Supabase has limits)
        const batchSize = 100;
        for (let i = 0; i < notifications.length; i += batchSize) {
            const batch = notifications.slice(i, i + batchSize);
            await supabaseRestInsert('/rest/v1/notifications', batch);
        }

        // Update auction offers count
        await supabaseRestPatch(`/rest/v1/e_auctions?id=eq.${id}`, {
            offers_count: users.length,
        });

        return NextResponse.json({
            success: true,
            notifications_sent: users.length,
            message: `Offers sent to ${users.length} users in ${auction.circle}`,
        });
    } catch (error) {
        console.error('Error sending offers:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
