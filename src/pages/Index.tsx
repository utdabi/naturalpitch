import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ClipboardCheck, Copy, Flag, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/contexts/CreditContext";

interface Scorecard {
  overall: number;
  clarity: number;
  relevance: number;
  credibility: number;
  cta: number;
  tone: number;
  red_flags: string[];
  rewrite_direct: string;
  rewrite_friendly: string;
  hooks: string[];
}

function getBarColor(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.8) return "bg-[hsl(160,60%,40%)]";
  if (pct >= 0.6) return "bg-primary";
  if (pct >= 0.4) return "bg-[hsl(45,90%,50%)]";
  return "bg-[hsl(25,90%,55%)]";
}

function getLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Needs improvement";
  if (score >= 40) return "Weak";
  return "Poor";
}

function ScoreBar({ name, score, max, color }: { name: string; score: number; max: number; color: string }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 text-muted-foreground shrink-0">
        {name}: {score}/{max}
      </span>
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-muted-foreground text-xs">{pct}%</span>
    </div>
  );
}

function ScorecardPanel({ data }: { data: Scorecard }) {
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const subscores = [
    { name: "Clarity", score: data.clarity, max: 20 },
    { name: "Relevance", score: data.relevance, max: 20 },
    { name: "Credibility", score: data.credibility, max: 20 },
    { name: "CTA", score: data.cta, max: 20 },
    { name: "Tone", score: data.tone, max: 20 },
  ];

  const rewrites = [
    { title: "Option 1: Direct", text: data.rewrite_direct },
    { title: "Option 2: Friendly", text: data.rewrite_friendly },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-7xl font-bold text-foreground leading-none">{data.overall}</span>
        <div>
          <div className="text-lg font-semibold text-foreground">Overall Score</div>
          <div className="text-sm text-muted-foreground">{getLabel(data.overall)}</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {subscores.map((s) => (
          <ScoreBar key={s.name} {...s} color={getBarColor(s.score, s.max)} />
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {data.red_flags.map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            <Flag className="h-3 w-3" />
            {f}
          </span>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-3">Rewrites</h3>
        <div className="space-y-3">
          {rewrites.map((r) => (
            <div key={r.title} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-foreground">{r.title}</span>
                <button onClick={() => copyText(r.text)} className="text-muted-foreground hover:text-foreground">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-semibold text-sm text-foreground mb-2">Alternative Openers</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {data.hooks.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const Index = () => {
  const location = useLocation();
  const { credits, useCredit } = useCredits();
  const [loading, setLoading] = useState(false);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [persona, setPersona] = useState("");
  const [message, setMessage] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const state = location.state as { message?: string; persona?: string } | null;
    if (state?.message) setMessage(state.message);
    if (state?.persona) setPersona(state.persona);
  }, [location.state]);

  const handleGrade = async () => {
    if (!message.trim()) {
      toast({ title: "Please paste a message first", variant: "destructive" });
      return;
    }
    if (!persona) {
      toast({ title: "Please select a target persona", variant: "destructive" });
      return;
    }
    if (credits <= 0) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setScorecard(null);

    try {
      const { data, error } = await supabase.functions.invoke("grade-message", {
        body: { message, persona },
      });

      if (error) throw error;
      const result = data as Scorecard;
      setScorecard(result);
      useCredit();

      // Save to database
      await supabase.from("grade_results").insert({
        persona,
        overall_score: result.overall,
        clarity: result.clarity,
        relevance: result.relevance,
        credibility: result.credibility,
        cta: result.cta,
        tone: result.tone,
        red_flags: result.red_flags,
        message,
        rewrite_direct: result.rewrite_direct,
        rewrite_friendly: result.rewrite_friendly,
        hooks: result.hooks,
      });
    } catch (e: any) {
      console.error("Grading failed:", e);
      toast({
        title: "Grading failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Pane */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">New Pitch</h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Target Persona</label>
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger className="w-full bg-card border-border">
                <SelectValue placeholder="Select target (HR, Founder, Peer...)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Founder">Founder</SelectItem>
                <SelectItem value="Hiring Manager">Hiring Manager</SelectItem>
                <SelectItem value="Peer">Peer</SelectItem>
                <SelectItem value="Investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch />
            <label className="text-sm text-foreground">Deep Context (5 credits)</label>
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste your LinkedIn message here..."
            className="min-h-[340px] bg-card border-primary/40 border-2 resize-none text-foreground placeholder:text-muted-foreground"
          />

          <Button
            onClick={handleGrade}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-lg"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Grading…</>
            ) : (
              "Grade & Improve (1 credit)"
            )}
          </Button>
        </div>
      </div>

      {/* Right Pane */}
      <div className="flex-1 bg-secondary/60 p-8 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        {!loading && scorecard && <ScorecardPanel data={scorecard} />}
        {!loading && !scorecard && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <ClipboardCheck className="h-16 w-16 mx-auto text-muted-foreground/40" strokeWidth={1} />
              <p className="text-muted-foreground text-sm max-w-[240px]">
                Your scorecard and rewrites will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
