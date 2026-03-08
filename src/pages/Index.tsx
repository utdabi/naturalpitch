import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";

const mockScorecard = {
  overall: 68,
  label: "Needs improvement",
  subscores: [
    { name: "Clarity", score: 15, max: 20, color: "bg-primary" },
    { name: "Relevance", score: 11, max: 20, color: "bg-[hsl(45,90%,50%)]" },
    { name: "Credibility", score: 12, max: 20, color: "bg-[hsl(45,90%,50%)]" },
    { name: "CTA", score: 10, max: 20, color: "bg-[hsl(25,90%,55%)]" },
    { name: "Tone", score: 20, max: 20, color: "bg-[hsl(160,60%,40%)]" },
  ],
  flags: ["Vague CTA", "No personalisation"],
  rewrites: [
    {
      title: "Option 1: Direct",
      text: "I saw your post about scaling engineering teams and wanted to reach out. I have 8 years of experience in DevOps and would love to connect and learn more about opportunities at your company.",
    },
    {
      title: "Option 2: Friendly",
      text: "I saw your post about scaling engineering teams and wanted to reach out. I have 8 years of experience in DevOps and would love to connect and learn more about opportunities. Do you have time for a quick call next week?",
    },
  ],
  hooks: [
    "Such your hook about scaling engineering teams out.",
    "However, a short cooking courses to footmarks.",
    "There's we spoken sentences and opportunities to today.",
  ],
};

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

function ScorecardPanel() {
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex items-center gap-4">
        <span className="text-7xl font-bold text-foreground leading-none">{mockScorecard.overall}</span>
        <div>
          <div className="text-lg font-semibold text-foreground">Overall Score</div>
          <div className="text-sm text-muted-foreground">{mockScorecard.label}</div>
        </div>
      </div>

      {/* Subscores */}
      <div className="space-y-2.5">
        {mockScorecard.subscores.map((s) => (
          <ScoreBar key={s.name} {...s} />
        ))}
      </div>

      {/* Flags */}
      <div className="flex gap-2 flex-wrap">
        {mockScorecard.flags.map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            <Flag className="h-3 w-3" />
            {f}
          </span>
        ))}
      </div>

      {/* Rewrites */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-3">Rewrites</h3>
        <div className="space-y-3">
          {mockScorecard.rewrites.map((r) => (
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

      {/* Alternative Openers */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-semibold text-sm text-foreground mb-2">Alternative Openers</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {mockScorecard.hooks.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGrade = () => {
    setLoading(true);
    setShowResults(false);
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="flex h-screen">
      {/* Left Pane */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">New Pitch</h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Target Persona</label>
            <Select>
              <SelectTrigger className="w-full bg-card border-border">
                <SelectValue placeholder="Select target (HR, Founder, Peer...)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                <SelectItem value="peer">Peer</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch />
            <label className="text-sm text-foreground">Deep Context (5 credits)</label>
          </div>

          <Textarea
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
        {!loading && showResults && <ScorecardPanel />}
        {!loading && !showResults && (
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
