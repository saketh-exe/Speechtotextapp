import React, { createContext, useContext, useState } from 'react';

interface NavContextType {
  isScrolled: boolean;
  setIsScrolled: (value: boolean) => void;
}

const NavContext = createContext<NavContextType>({
  isScrolled: false,
  setIsScrolled: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <NavContext.Provider value={{ isScrolled, setIsScrolled }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavBar() {
  return useContext(NavContext);
}
