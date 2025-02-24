import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });


    // Get the raw response text first
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
        { message: data.message || 'Something went wrong' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        message: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Internal server error'
          : 'Something went wrong'
      },
      { status: 500 }
    );
  }
} 