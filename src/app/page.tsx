'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { theme } from '@/styles/theme';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/rooms');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center" style={{ backgroundColor: theme.colors.background.app }}>
      <div className="text-center transition-opacity duration-300 opacity-100">
        <img src="/loading.svg" alt="Loading" className="h-12 w-12 mx-auto" />
        <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
    </div>
  );
}
