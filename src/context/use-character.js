import { createContext, useContext } from 'react';

const CharacterContext = createContext(null);

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error(`context is: ${context}`);
  }
  return context;
};

export const CharacterProvider = CharacterContext.Provider;
