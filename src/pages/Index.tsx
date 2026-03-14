import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ClipboardCheck, Compass, Copy, Flag, Info, Loader2 } from "lucide-react";
import { ScoreBubbleChart } from "@/components/ScoreBubbleChart";
import { useTour } from "@/hooks/use-tour";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

interface SubjectLineScore {
  curiosity: number;
  specificity: number;
  length: number;
  options: string[];
}

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
  subject_line?: SubjectLineScore;
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

function SubjectLineBadge({ score }: { score: SubjectLineScore }) {
  const avg = Math.round((score.curiosity + score.specificity + score.length) / 3);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      Subject: {avg}/10
    </span>
  );
}

function ScorecardPanel({ data, usedDeepContext }: { data: Scorecard; usedDeepContext: boolean }) {
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
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">Overall Score</span>
            {data.subject_line && <SubjectLineBadge score={data.subject_line} />}
          </div>
          <div className="text-sm text-muted-foreground">{getLabel(data.overall)}</div>
        </div>
      </div>

      {data.subject_line && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-md bg-muted p-2 text-center">
            <div className="text-muted-foreground">Curiosity</div>
            <div className="font-semibold text-foreground">{data.subject_line.curiosity}/10</div>
          </div>
          <div className="rounded-md bg-muted p-2 text-center">
            <div className="text-muted-foreground">Specificity</div>
            <div className="font-semibold text-foreground">{data.subject_line.specificity}/10</div>
          </div>
          <div className="rounded-md bg-muted p-2 text-center">
            <div className="text-muted-foreground">Length</div>
            <div className="font-semibold text-foreground">{data.subject_line.length}/10</div>
          </div>
        </div>
      )}

      <ScoreBubbleChart subscores={subscores} />

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

      {data.subject_line && data.subject_line.options.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="font-semibold text-sm text-foreground mb-2">Subject Line Options</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {data.subject_line.options.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-semibold text-sm text-foreground mb-2">Alternative Openers</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {data.hooks.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>

      {!usedDeepContext && data.overall >= 75 && data.overall <= 88 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm text-foreground leading-relaxed">
            Your message scores well on structure and brevity. To break past 88, add their LinkedIn profile in Deep Context — the top marks are reserved for messages that reference something specific about the recipient.
          </p>
        </div>
      )}
    </div>
  );
}

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { credits, refreshCredits } = useCredits();
  const [loading, setLoading] = useState(false);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [persona, setPersona] = useState("");
  const [message, setMessage] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [injectionError, setInjectionError] = useState<string | null>(null);
  const [deepContextOn, setDeepContextOn] = useState(false);
  const [deepContext, setDeepContext] = useState("");
  const [cachedResultId, setCachedResultId] = useState<string | null>(null);

  const creditCost = deepContextOn ? 2 : 1;
  const { maybeStartTour } = useTour();

  useEffect(() => {
    maybeStartTour();
  }, [maybeStartTour]);

  useEffect(() => {
    const state = location.state as { message?: string; persona?: string; subjectLine?: string } | null;
    if (state?.message) setMessage(state.message);
    if (state?.persona) setPersona(state.persona);
    if (state?.subjectLine) setSubjectLine(state.subjectLine);
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
    // Client-side check for UX only - actual enforcement is server-side
    if (credits < creditCost) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setScorecard(null);
    setInjectionError(null);
    setCachedResultId(null);

    try {
      // Check for cached result first
      const trimmedMessage = message.trim();
      const trimmedSubject = subjectLine.trim() || null;

      let cacheQuery = supabase
        .from("grade_results")
        .select("*")
        .ilike("message", trimmedMessage)
        .eq("persona", persona);

      if (trimmedSubject) {
        cacheQuery = cacheQuery.ilike("subject_line_input", trimmedSubject);
      } else {
        cacheQuery = cacheQuery.is("subject_line_input", null);
      }

      const { data: cachedRows } = await cacheQuery.limit(1);

      if (cachedRows && cachedRows.length > 0) {
        const cached = cachedRows[0];
        const cachedScorecard: Scorecard = {
          overall: cached.overall_score,
          clarity: cached.clarity ?? 0,
          relevance: cached.relevance ?? 0,
          credibility: cached.credibility ?? 0,
          cta: cached.cta ?? 0,
          tone: cached.tone ?? 0,
          red_flags: (cached.red_flags as string[]) ?? [],
          rewrite_direct: cached.rewrite_direct ?? "",
          rewrite_friendly: cached.rewrite_friendly ?? "",
          hooks: (cached.hooks as string[]) ?? [],
        };
        setScorecard(cachedScorecard);
        setCachedResultId(cached.id);
        setLoading(false);
        return;
      }

      // No cache hit — proceed with grading
      const { data, error } = await supabase.functions.invoke("grade-message", {
        body: {
          message,
          persona,
          deep_context: deepContextOn ? deepContext : null,
          subject_line: trimmedSubject,
        },
      });

      if (error) {
        let errorBody: any = null;
        try {
          if (error.context && typeof error.context === "object" && error.context instanceof Response) {
            errorBody = await error.context.json();
          }
        } catch { /* ignore parse failures */ }

        if (errorBody?.error === "INJECTION_DETECTED") {
          setInjectionError(errorBody.message);
          return;
        }

        if (errorBody?.code === "INSUFFICIENT_CREDITS") {
          setShowUpgrade(true);
          return;
        }

        setInjectionError("Something went wrong. Please try again.");
        return;
      }

      if (data?.error === "INJECTION_DETECTED") {
        setInjectionError(data.message);
        return;
      }

      const result = data as Scorecard;
      setScorecard(result);
      
      // Refresh credits from server (credits were deducted server-side)
      await refreshCredits();

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
        message: trimmedMessage,
        rewrite_direct: result.rewrite_direct,
        rewrite_friendly: result.rewrite_friendly,
        hooks: result.hooks,
        subject_line_input: trimmedSubject,
        subject_line_rewrites: result.subject_line?.options?.length
          ? JSON.stringify(result.subject_line.options)
          : null,
        credits_used: creditCost,
      });
    } catch (e: any) {
      console.error("Grading failed:", e);
      setInjectionError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-screen min-w-0">
        {/* Left Pane */}
        <div className="flex-1 min-w-0 p-6 lg:p-8 overflow-auto flex flex-col relative">
          <button
            onClick={() => maybeStartTour(true)}
            className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/5 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 hover:border-primary transition-colors"
          >
            <Compass className="h-3.5 w-3.5" />
            Take a tour
          </button>
          <h1 className="text-2xl font-bold text-foreground mb-6">New Pitch</h1>
          <div className="flex flex-col flex-1 min-h-0 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Target Persona</label>
              <Select value={persona} onValueChange={setPersona}>
                <SelectTrigger id="tour-persona" className="w-full bg-card border-border">
                  <SelectValue placeholder="Select target (HR, Founder, Peer...)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Hiring Manager">Hiring Manager</SelectItem>
                  <SelectItem value="Founder">Founder</SelectItem>
                  <SelectItem value="Peer">Peer</SelectItem>
                  <SelectItem value="Investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div id="tour-deep-context" className="flex items-center gap-2">
              <Switch checked={deepContextOn} onCheckedChange={setDeepContextOn} />
              <label className="text-sm text-foreground">Deep Context (2 credits)</label>
            </div>

            {deepContextOn && (
              <Textarea
                value={deepContext}
                onChange={(e) => setDeepContext(e.target.value)}
                placeholder="Paste recipient's LinkedIn About section, a recent post, or their job description here..."
                className="flex-[2] min-h-0 bg-card border-border border resize-none text-foreground placeholder:text-muted-foreground"
              />
            )}

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Subject Line (optional)</label>
              <Input
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
                placeholder="e.g. Quick question about your AI project"
                className="bg-card border-border"
              />
            </div>

            <Textarea
              id="tour-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste your LinkedIn message here..."
              className={`${deepContextOn ? "flex-[3]" : "flex-1"} min-h-0 bg-card border-primary/40 border-2 resize-none text-foreground placeholder:text-muted-foreground`}
            />

            <Button
              id="tour-grade"
              onClick={handleGrade}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-lg"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Grading…</>
              ) : (
                `Grade & Improve (${creditCost} credit${creditCost !== 1 ? "s" : ""})`
              )}
            </Button>
          </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 min-w-0 bg-secondary/60 p-6 lg:p-8 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
          {!loading && injectionError && (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">{injectionError}</p>
            </div>
          )}
          {!loading && !injectionError && scorecard && (
            <>
              {cachedResultId && (
                <div className="flex items-center gap-3 rounded-lg bg-[hsl(45,90%,50%)]/10 border border-[hsl(45,90%,50%)]/30 p-4 mb-4">
                  <Info className="h-5 w-5 text-[hsl(45,90%,50%)] shrink-0" />
                  <p className="text-sm text-foreground font-medium flex-1">
                    We found this in your history. No credits were used.{" "}
                    <button
                      onClick={() => navigate("/history")}
                      className="underline text-primary hover:text-primary/80"
                    >
                      View in History
                    </button>
                  </p>
                </div>
              )}
              <ScorecardPanel data={scorecard} usedDeepContext={deepContextOn} />
            </>
          )}
          {!loading && !injectionError && !scorecard && (
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

      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>You've used your free credits</DialogTitle>
            <DialogDescription>
              Upgrade to continue grading and improving your LinkedIn messages.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowUpgrade(false)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
          >
            Upgrade
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;
