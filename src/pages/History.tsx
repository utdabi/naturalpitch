import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const outcomeOptions = ["Pending", "Replied", "Connected", "Ignored", "Booked Call"] as const;
type Outcome = (typeof outcomeOptions)[number];

const outcomeColors: Record<Outcome, string> = {
  Pending: "bg-muted text-muted-foreground",
  Replied: "bg-primary text-primary-foreground",
  Connected: "bg-[hsl(210,70%,50%)] text-white",
  Ignored: "bg-muted text-muted-foreground",
  "Booked Call": "bg-[hsl(45,90%,45%)] text-white",
};

interface GradeRow {
  id: string;
  date: string;
  persona: string;
  score: number;
  outcome: Outcome;
  message: string;
  clarity: number;
  relevance: number;
  credibility: number;
  cta: number;
  tone: number;
  red_flags: string[];
  rewrite_direct: string;
  rewrite_friendly: string;
  hooks: string[];
  subject_line_input: string | null;
  subject_line_rewrites: string[] | null;
  credits_used: number;
}

const personaColors: Record<string, string> = {
  "Hiring Manager": "bg-[hsl(210,70%,50%)] text-white",
  Founder: "bg-[hsl(0,70%,55%)] text-white",
  HR: "bg-[hsl(160,60%,40%)] text-white",
  Peer: "bg-primary text-primary-foreground",
  Investor: "bg-[hsl(270,50%,55%)] text-white",
};

function ScoreBar({ name, score, max }: { name: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? "bg-[hsl(160,60%,40%)]" : pct >= 60 ? "bg-primary" : pct >= 40 ? "bg-[hsl(45,90%,50%)]" : "bg-[hsl(25,90%,55%)]";
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 text-muted-foreground shrink-0">{name}: {score}/{max}</span>
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-muted-foreground text-xs">{pct}%</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const History = () => {
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [selected, setSelected] = useState<GradeRow | null>(null);
  const [patterns, setPatterns] = useState<{ avgScore: number; replyRate: number; bestPersona: string } | null>(null);
  const [outcomeCount, setOutcomeCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: grades } = await supabase
        .from("grade_results")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: outcomes } = await supabase
        .from("outcome_logs")
        .select("grade_result_id, outcome")
        .order("created_at", { ascending: false });

      // Build outcome map (latest per grade)
      const outcomeMap: Record<string, Outcome> = {};
      if (outcomes) {
        for (const o of outcomes) {
          if (!outcomeMap[o.grade_result_id]) {
            outcomeMap[o.grade_result_id] = o.outcome as Outcome;
          }
        }
        setOutcomeCount(outcomes.length);

        // Calculate patterns if 10+ outcome logs
        if (outcomes.length >= 10 && grades && grades.length > 0) {
          const avgScore = Math.round(grades.reduce((s, g) => s + g.overall_score, 0) / grades.length);
          const repliedCount = outcomes.filter((o) => o.outcome === "Replied").length;
          const replyRate = Math.round((repliedCount / outcomes.length) * 100);

          // Best persona by avg score
          const personaScores: Record<string, { total: number; count: number }> = {};
          for (const g of grades) {
            if (!personaScores[g.persona]) personaScores[g.persona] = { total: 0, count: 0 };
            personaScores[g.persona].total += g.overall_score;
            personaScores[g.persona].count += 1;
          }
          let bestPersona = "";
          let bestAvg = -1;
          for (const [p, v] of Object.entries(personaScores)) {
            const avg = v.total / v.count;
            if (avg > bestAvg) { bestAvg = avg; bestPersona = p; }
          }

          setPatterns({ avgScore, replyRate, bestPersona });
        }
      }

      if (grades) {
        setRows(
          grades.map((r) => ({
            id: r.id,
            date: formatDate(r.created_at),
            persona: r.persona,
            score: r.overall_score,
            outcome: outcomeMap[r.id] || ("Pending" as Outcome),
            message: r.message || "",
            clarity: r.clarity || 0,
            relevance: r.relevance || 0,
            credibility: r.credibility || 0,
            cta: r.cta || 0,
            tone: r.tone || 0,
            red_flags: r.red_flags || [],
            rewrite_direct: r.rewrite_direct || "",
            rewrite_friendly: r.rewrite_friendly || "",
            hooks: r.hooks || [],
            subject_line_input: r.subject_line_input || null,
            subject_line_rewrites: r.subject_line_rewrites ? (() => { try { return JSON.parse(r.subject_line_rewrites); } catch { return null; } })() : null,
            credits_used: r.credits_used ?? 1,
          }))
        );
      }
    };
    fetchData();
  }, []);

  const updateOutcome = async (id: string, outcome: Outcome) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, outcome } : r)));
    await supabase.from("outcome_logs").insert({
      grade_result_id: id,
      outcome,
    });
  };

  return (
    <div className="h-screen overflow-auto p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">History & Outcomes</h1>

      {outcomeCount < 10 ? (
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <p className="text-sm text-muted-foreground">Log 10 outcomes to unlock your personal patterns.</p>
        </div>
      ) : patterns ? (
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground">Your Patterns</h2>
          <p className="text-sm text-muted-foreground mb-4">Based on {outcomeCount} outcomes logged</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: String(patterns.avgScore), label: "Avg Score" },
              { value: `${patterns.replyRate}%`, label: "Reply Rate" },
              { value: patterns.bestPersona, label: "Best Persona" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-secondary/40 p-6 text-center">
                <div className="text-4xl font-bold text-foreground">{m.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Grade History Table */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Grade History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Persona</th>
              <th className="pb-3 font-medium">Score</th>
              <th className="pb-3 font-medium">Credits</th>
              <th className="pb-3 font-medium">Outcome</th>
              <th className="pb-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer"
                onClick={() => setSelected(row)}
              >
                <td className="py-4">{row.date}</td>
                <td className="py-4">
                  <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-medium ${personaColors[row.persona] || "bg-muted text-foreground"}`}>
                    {row.persona}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center justify-center rounded-full w-9 h-9 text-sm font-semibold ${
                    row.score >= 80
                      ? "bg-[hsl(160,60%,40%)] text-white"
                      : row.score >= 60
                        ? "bg-[hsl(45,90%,50%)] text-[hsl(30,10%,15%)]"
                        : "bg-[hsl(0,70%,50%)] text-white"
                  }`}>
                    {row.score}
                  </span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm text-muted-foreground">{row.credits_used}</span>
                </td>
                <td className="py-4" onClick={(e) => e.stopPropagation()}>
                  <Select value={row.outcome} onValueChange={(v) => updateOutcome(row.id, v as Outcome)}>
                    <SelectTrigger className={`w-[140px] h-8 text-xs font-medium rounded-full ${outcomeColors[row.outcome]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outcomeOptions.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-4 text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over detail panel */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-[480px] sm:w-[540px] overflow-auto">
          {selected && (
            <div className="space-y-6 pt-4">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Grade Details</h2>
                  <span className={`rounded px-2.5 py-0.5 text-xs font-medium ${personaColors[selected.persona] || "bg-muted"}`}>
                    {selected.persona}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{selected.date}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-foreground">{selected.score}</span>
                <div className="text-sm text-muted-foreground">
                  {selected.score >= 80 ? "Excellent" : selected.score >= 60 ? "Needs improvement" : "Weak"}
                </div>
              </div>

              <div className="space-y-2">
                <ScoreBar name="Clarity" score={selected.clarity} max={20} />
                <ScoreBar name="Relevance" score={selected.relevance} max={20} />
                <ScoreBar name="Credibility" score={selected.credibility} max={20} />
                <ScoreBar name="CTA" score={selected.cta} max={20} />
                <ScoreBar name="Tone" score={selected.tone} max={20} />
              </div>

              <div className="flex gap-2 flex-wrap">
                {selected.red_flags.map((f) => (
                  <span key={f} className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                    🚩 {f}
                  </span>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground italic">"{selected.message}"</p>
                {selected.subject_line_input && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Subject:</span> {selected.subject_line_input}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Rewrites</h3>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Option 1: Direct</p>
                  <p className="text-sm text-muted-foreground">{selected.rewrite_direct}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Option 2: Friendly</p>
                  <p className="text-sm text-muted-foreground">{selected.rewrite_friendly}</p>
                </div>
              </div>

              {selected.subject_line_rewrites && selected.subject_line_rewrites.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <h4 className="text-xs font-semibold text-foreground mb-2">Subject Line Options</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {selected.subject_line_rewrites.map((opt, i) => <li key={i}>{opt}</li>)}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border border-border p-3">
                <h4 className="text-xs font-semibold text-foreground mb-2">Alternative Openers</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {selected.hooks.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default History;
