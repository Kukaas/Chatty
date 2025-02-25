import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Make sure this matches your server's URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let endpoint = `${API_URL}/api/friends`;
    
    // Add type parameter if present
    if (type) {
      endpoint += `/${type}`;
    }

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
        throw new Error(data.message || 'Failed to fetch friends data');
      }

      return NextResponse.json(data);
    } catch (fetchError) {
      // Handle connection errors specially
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch failed')) {
        console.error('Backend connection error:', fetchError);
        return NextResponse.json(
          { message: 'Could not connect to the backend server. Please ensure it is running.' },
          { status: 503 } // Service Unavailable
        );
      }
      throw fetchError;
    }
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
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let endpoint = `${API_URL}/api/friends`;
    
    // Add type parameter if present
    if (type) {
      endpoint += `/${type}`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });

      const data = await response.json();

      // Return the response with the same status code and data from the backend
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      // Handle connection errors specially
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch failed')) {
        console.error('Backend connection error:', fetchError);
        return NextResponse.json(
          { message: 'Could not connect to the backend server. Please ensure it is running.' },
          { status: 503 } // Service Unavailable
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Friends API error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 