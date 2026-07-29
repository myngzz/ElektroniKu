'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser, getToken } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getUser());
    setToken(getToken());
    setIsLoading(false);
  }, []);

  const isLoggedIn = !!token;
  const isAdmin = user?.role === 'admin';

  return { user, token, isLoggedIn, isAdmin, isLoading };
}
