import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the friend ID from the URL instead of params directly
    const url = new URL(request.url);
    const friendId = url.pathname.split('/').pop();
    const authToken = request.cookies.get('auth_token')?.value;

    if (!friendId) {
      return new Response(JSON.stringify({ message: 'Friend ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!authToken) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
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
      throw new Error(data.message || 'Failed to fetch friend details');
    }

    return Response.json(data);

  } catch (error) {
    console.error('Error in friend details API:', error);
    return new Response(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 