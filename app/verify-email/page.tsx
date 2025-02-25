'use client';

import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const verifyEmail = useCallback(async () => {
    try {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        return;
      }

      const response = await fetch(`/api/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });
      
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        
        setIsRedirecting(true);
        
        // Reduced delay to 1.5 seconds for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        router.push('/login');
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An error occurred during verification');
    }
  }, [searchParams, router]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'loading' && (
          <div>
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
            <p className="mt-2 text-neutral-500">Please wait while we verify your email address.</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
            <p className="mt-2">{message}</p>
            {isRedirecting && (
              <p className="mt-2 text-neutral-500">Redirecting to login page...</p>
            )}
          </div>
        )}
        {status === 'error' && (
          <div>
            <h1 className="text-2xl font-bold text-red-500">Verification Failed</h1>
            <p className="mt-2 text-neutral-600">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="mt-2 text-neutral-500">Please wait...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 