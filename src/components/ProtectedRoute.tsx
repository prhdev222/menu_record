'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = typeof window !== 'undefined' && localStorage.getItem('adminLoggedIn') === 'true';
    if (!loggedIn) {
      router.replace('/admin');
    }
  }, [router]);

  return <>{children}</>;
}


