import { create } from 'zustand';

const useAuthStore = create(() => ({
  accessToken: null,
  userId: null,
}));

export const authStore = useAuthStore;
