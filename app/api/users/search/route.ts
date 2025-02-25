import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!query) {
      return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
    }

    const endpoint = `${API_URL}/api/users/search?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search users');
      }

      return NextResponse.json(data);
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch failed')) {
        console.error('Backend connection error:', fetchError);
        return NextResponse.json(
          { message: 'Could not connect to the backend server. Please ensure it is running.' },
          { status: 503 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('User search API error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}