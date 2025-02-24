import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Wait for params to be available
    const { id: friendId } = await params;
    const authToken = request.cookies.get('auth_token')?.value;

    if (!friendId) {
      return Response.json(
        { message: 'Friend ID is required' },
        { status: 400 }
      );
    }

    if (!authToken) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/friends/${friendId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch details');
    }

    return Response.json(data);

  } catch (error) {
    console.error('Error in friend details API:', error);
    return Response.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 