import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreditContextType {
  credits: number;
  useCredit: () => Promise<boolean>;
  loading: boolean;
}

const CreditContext = createContext<CreditContextType>({
  credits: 0,
  useCredit: async () => false,
  loading: true,
});

export const useCredits = () => useContext(CreditContext);

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

  const useCredit = useCallback(async () => {
    if (!user || credits <= 0) return false;
    const next = credits - 1;

    const { error } = await supabase
      .from("user_credits")
      .update({ balance: next })
      .eq("user_id", user.id);

    if (error) return false;
    setCredits(next);
    return true;
  }, [user, credits]);

  return (
    <CreditContext.Provider value={{ credits, useCredit, loading }}>
      {children}
    </CreditContext.Provider>
  );
}
