import type { User } from './types';

const USER_KEY = 'nusaedu_user';
const TOKEN_KEY = 'nusaedu_token';

export const auth = {
  saveSession: (user: User, token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  isLoggedIn: (): boolean => {
    return !!auth.getToken();
  },

  updatePoints: (points: number) => {
    const user = auth.getUser();
    if (!user) return;
    user.points = points;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};
