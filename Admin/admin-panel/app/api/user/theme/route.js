import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

/**
 * PATCH /api/user/theme - Update user's selected theme
 * Body: { userId, phone, email, theme }
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, phone, email, theme } = body;

    // Validate that at least one identifier is provided
    if (!userId && !phone && !email) {
      return NextResponse.json(
        { error: 'At least one of userId, phone, or email is required' },
        { status: 400 }
      );
    }

    // Validate theme is provided
    if (!theme) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    // Build query to find user
    let userQuery = '/rest/v1/users?select=id';
    const conditions = [];
    
    if (userId) {
      conditions.push(`id=eq.${encodeURIComponent(userId)}`);
    }
    if (phone) {
      conditions.push(`phone=eq.${encodeURIComponent(phone)}`);
    }
    if (email) {
      conditions.push(`email=eq.${encodeURIComponent(email)}`);
    }

    if (conditions.length > 0) {
      userQuery += `&or=(${conditions.join(',')})`;
    }

    // Find the user
    const users = await supabaseRestGet(userQuery);
    
    if (!users || (Array.isArray(users) && users.length === 0)) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the first matching user
    const user = Array.isArray(users) ? users[0] : users;
    const userIdToUpdate = user.id;

    // Update the user's selected_theme
    const updated = await supabaseRestPatch(
      `/rest/v1/users?id=eq.${encodeURIComponent(userIdToUpdate)}`,
      { selected_theme: theme }
    );

    const updatedUser = Array.isArray(updated) && updated[0] ? updated[0] : updated;

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        selected_theme: updatedUser.selected_theme || theme,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user theme:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user theme' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/theme - Get user's selected theme
 * Query params: userId, phone, or email
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');

    // Validate that at least one identifier is provided
    if (!userId && !phone && !email) {
      return NextResponse.json(
        { error: 'At least one of userId, phone, or email is required' },
        { status: 400 }
      );
    }

    // Build query to find user
    let userQuery = '/rest/v1/users?select=id,selected_theme';
    const conditions = [];
    
    if (userId) {
      conditions.push(`id=eq.${encodeURIComponent(userId)}`);
    }
    if (phone) {
      conditions.push(`phone=eq.${encodeURIComponent(phone)}`);
    }
    if (email) {
      conditions.push(`email=eq.${encodeURIComponent(email)}`);
    }

    if (conditions.length > 0) {
      userQuery += `&or=(${conditions.join(',')})`;
    }

    // Find the user
    const users = await supabaseRestGet(userQuery);
    
    if (!users || (Array.isArray(users) && users.length === 0)) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the first matching user
    const user = Array.isArray(users) ? users[0] : users;

    return NextResponse.json({
      success: true,
      theme: user.selected_theme || 'default',
      userId: user.id,
    }, { status: 200 });
  } catch (error) {
    console.error('Error getting user theme:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user theme' },
      { status: 500 }
    );
  }
}
