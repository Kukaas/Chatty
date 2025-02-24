import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/friends/${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch friend details');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Friend details API error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch friend details' },
      { status: 500 }
    );
  }
} 