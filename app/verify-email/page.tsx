'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setStatus('error');
          return;
        }

        const response = await fetch(`/api/verify-email?token=${token}`);
        if (response.ok) {
          setStatus('success');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === 'loading' && <p>Verifying your email...</p>}
        {status === 'success' && (
          <div>
            <h1 className="text-2xl font-bold">Email Verified!</h1>
            <p className="mt-2">Redirecting to login page...</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h1 className="text-2xl font-bold text-red-500">Verification Failed</h1>
            <p className="mt-2">The verification link is invalid or has expired.</p>
          </div>
        )}
      </div>
    </div>
  );
} 