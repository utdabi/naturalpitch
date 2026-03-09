import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreditContextType {
  credits: number;
  refreshCredits: () => Promise<void>;
  loading: boolean;
}

const CreditContext = createContext<CreditContextType>({
  credits: 0,
  refreshCredits: async () => {},
  loading: true,
});

export const useCreditContext = () => useContext(CreditContext);
// Keep backward-compatible alias
export const useCredits = useCreditContext;

export function CreditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setCredits(data.balance);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return (
    <CreditContext.Provider value={{ credits, refreshCredits: fetchCredits, loading }}>
      {children}
    </CreditContext.Provider>
  );
}

