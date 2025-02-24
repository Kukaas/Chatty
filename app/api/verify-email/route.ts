import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Get raw response text first
    const responseText = await response.text();
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', parseError);
      return NextResponse.json(
        { 
          message: 'Invalid response from server',
          details: process.env.NODE_ENV === 'development' ? responseText : undefined
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Verification failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
} 