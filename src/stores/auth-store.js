import { create } from 'zustand';

export const authStore = create((set) => ({
  accessToken: null,
  userId: null,
  isRefreshing: false,
  refreshPromise: null,
  setTokens: (accessToken, userId) => set({ accessToken, userId }),
  setIsRefreshing: (status) => set({ isRefreshing: status }),
  setRefreshPromise: (promise) => set({ refreshPromise: promise }),
}));
