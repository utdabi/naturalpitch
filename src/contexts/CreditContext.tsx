import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreditContextType {
  credits: number;
  useCredits: (amount?: number) => Promise<boolean>;
  loading: boolean;
}

const CreditContext = createContext<CreditContextType>({
  credits: 0,
  useCredits: async () => false,
  loading: true,
});

export const useCreditContext = () => useContext(CreditContext);
// Keep backward-compatible alias
export const useCredits = useCreditContext;

export function CreditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    const fetchCredits = async () => {
      const { data, error } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setCredits(data.balance);
      }
      setLoading(false);
    };

    fetchCredits();
  }, [user]);

  const useCreditsAmount = useCallback(async (amount: number = 1) => {
    if (!user || credits < amount) return false;
    const next = credits - amount;

    const { error } = await supabase
      .from("user_credits")
      .update({ balance: next })
      .eq("user_id", user.id);

    if (error) return false;
    setCredits(next);
    return true;
  }, [user, credits]);

  return (
    <CreditContext.Provider value={{ credits, useCredits: useCreditsAmount, loading }}>
      {children}
    </CreditContext.Provider>
  );
}
