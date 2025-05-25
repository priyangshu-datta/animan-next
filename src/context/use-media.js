import { createContext, useContext } from 'react';

const MediaContext = createContext(null);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error(`context is: ${context}`);
  }
  return context;
};

export const MediaProvider = MediaContext.Provider;
