'use client';
import { createContext, useContext } from 'react';

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  exp: number;
} | null;

export const UserContext = createContext<User>(null);

export function useUser() {
  return useContext(UserContext);
}

// 'use client';
// import { createContext, useContext } from 'react';
// import { User } from '@/types/userType';

// type UserContextType = {
//   user: User | null;
//   setUser: React.Dispatch<React.SetStateAction<User>>;
// }
// export const UserContext = createContext<UserContextType | null>(null);

// export function useUser() {
//   const ctx = useContext(UserContext);
//   if (!ctx) {
//     throw new Error('useUser must be used within a UserContext.Provider');
//   }
//   return ctx;
// }
