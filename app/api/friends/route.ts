import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'list'; // 'list' or 'requests'

    const response = await fetch(`${API_URL}/api/friends/${type}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch friends');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Friends API error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'request'; // 'request' or 'respond'

    const response = await fetch(`${API_URL}/api/friends/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to process friend request');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Friends API error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 