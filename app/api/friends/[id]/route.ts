import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const authToken = await cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!params.id) {
      return new Response(JSON.stringify({ message: 'Friend ID is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(
      `${API_URL}/api/friends/${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Disable caching
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ message: data.message || 'Failed to fetch friend' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error in friend details API:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch friend details' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 