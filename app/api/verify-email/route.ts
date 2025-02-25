import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Updated URL to match the Express route
    const verifyUrl = `${API_URL}/api/auth/verify-email?token=${token}`;
    console.log('Verifying email with URL:', verifyUrl);

    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    // Log response details for debugging
    console.log('Backend response status:', response.status);
    
    const textResponse = await response.text();
    console.log('Raw response:', textResponse);
    
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return NextResponse.json(
        { message: 'Invalid server response format' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Verification failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error verifying email' },
      { status: 500 }
    );
  }
} 