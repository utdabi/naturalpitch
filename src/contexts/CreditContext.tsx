import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface CreditContextType {
  credits: number;
  useCredit: () => boolean; // returns false if no credits left
}

const CreditContext = createContext<CreditContextType>({
  credits: 10,
  useCredit: () => false,
});

export const useCredits = () => useContext(CreditContext);

export function CreditProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem("np_credits");
    return saved !== null ? parseInt(saved, 10) : 10;
  });

  const useCredit = useCallback(() => {
    if (credits <= 0) return false;
    const next = credits - 1;
    setCredits(next);
    localStorage.setItem("np_credits", String(next));
    return true;
  }, [credits]);

  return (
    <CreditContext.Provider value={{ credits, useCredit }}>
      {children}
    </CreditContext.Provider>
  );
}
