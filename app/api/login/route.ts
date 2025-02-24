import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Login API Error Response:', errorText);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();

    if (!data.token) {
      return NextResponse.json(
        { message: 'No token received from server' },
        { status: 500 }
      );
    }

    // Create a new response
    const response = NextResponse.json({ 
      success: true,
      user: data.user 
    });

    // Set the auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 