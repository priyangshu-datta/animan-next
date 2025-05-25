const { create } = require('zustand');

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
