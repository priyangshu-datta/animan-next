import { createContext, useContext } from 'react';

const MediaContext = createContext(null);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

export const MediaProvider = MediaContext.Provider;
