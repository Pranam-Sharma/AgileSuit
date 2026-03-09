import { create } from 'zustand';
import type { User } from '@/types/user';

interface UserState {
    currentUser: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
    currentUser: null,
    isAuthenticated: false,
    setUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
}));
