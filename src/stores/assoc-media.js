import { create } from 'zustand';

const assocMediaInit = {
  id: 0,
  type: '',
  role: '',
  coverImage: '',
  title: '',
};

export const assocMedia = create((set) => ({
  ...assocMediaInit,
  reset: () => {
    set(assocMediaInit);
  },
}));
