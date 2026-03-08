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
}

const personaColors: Record<string, string> = {
  "Hiring Manager": "bg-[hsl(210,70%,50%)] text-white",
  Founder: "bg-[hsl(0,70%,55%)] text-white",
  HR: "bg-[hsl(160,60%,40%)] text-white",
  Peer: "bg-primary text-primary-foreground",
  Investor: "bg-[hsl(270,50%,55%)] text-white",
};

const mockRows: GradeRow[] = [
  {
    id: 1, date: "Mar 5, 2026", persona: "Hiring Manager", score: 68, outcome: "Pending",
    message: "Hi Sarah, I saw your post about scaling engineering teams...",
    clarity: 15, relevance: 11, credibility: 12, cta: 10, tone: 20,
    red_flags: ["Vague CTA", "No personalisation"],
    rewrite_direct: "I saw your post about scaling engineering teams and wanted to reach out.",
    rewrite_friendly: "I loved your recent post on scaling engineering teams!",
    hooks: ["Your recent post resonated with me.", "I've been following your team's growth.", "As a DevOps engineer, I noticed..."],
  },
  {
    id: 2, date: "Mar 4, 2026", persona: "Founder", score: 85, outcome: "Replied",
    message: "Hey Alex, congrats on the Series A! I'd love to chat about how my background in growth marketing could help...",
    clarity: 18, relevance: 17, credibility: 16, cta: 16, tone: 18,
    red_flags: ["Slightly generic opener"],
    rewrite_direct: "Congrats on the Series A. My growth marketing experience could directly support your next phase.",
    rewrite_friendly: "Huge congrats on the Series A! I'd love to explore how my growth marketing background might fit.",
    hooks: ["Your Series A announcement caught my eye.", "I've worked with 3 post-Series A startups.", "The growth challenges you mentioned..."],
  },
  {
    id: 3, date: "Mar 3, 2026", persona: "HR", score: 72, outcome: "Ignored",
    message: "Hello, I'm interested in the open DevOps position at your company...",
    clarity: 16, relevance: 14, credibility: 14, cta: 12, tone: 16,
    red_flags: ["Too formal", "Missing hook"],
    rewrite_direct: "I noticed your open DevOps role and believe my 8 years of experience align well.",
    rewrite_friendly: "Hi! I came across your DevOps opening and got excited — here's why.",
    hooks: ["Your job posting stood out because...", "I've been admiring your engineering culture.", "As someone who's scaled infra at..."],
  },
  {
    id: 4, date: "Mar 2, 2026", persona: "Peer", score: 81, outcome: "Booked Call",
    message: "Hey Jamie, we met briefly at the DevOps meetup last week...",
    clarity: 17, relevance: 16, credibility: 15, cta: 15, tone: 18,
    red_flags: ["Could be more specific about shared interests"],
    rewrite_direct: "Great meeting you at the DevOps meetup. I'd love to continue our conversation about CI/CD pipelines.",
    rewrite_friendly: "It was awesome chatting at the meetup! Would love to grab coffee and dig deeper into those CI/CD ideas.",
    hooks: ["Our conversation at the meetup got me thinking...", "Following up on the CI/CD topic we discussed.", "I really enjoyed your take on..."],
  },
  {
    id: 5, date: "Mar 1, 2026", persona: "Hiring Manager", score: 55, outcome: "Pending",
    message: "Hi, I would like to apply for a position at your company...",
    clarity: 12, relevance: 10, credibility: 10, cta: 8, tone: 15,
    red_flags: ["No personalisation", "Weak CTA", "Generic opener", "No value prop"],
    rewrite_direct: "I'm reaching out about your open engineering role. Here's what I bring to the table.",
    rewrite_friendly: "Hi! I stumbled across your team's work and was really inspired — here's a bit about me.",
    hooks: ["Your company's recent work on...", "I noticed you're hiring for...", "After reading about your team's approach to..."],
  },
];

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

const History = () => {
  const [rows, setRows] = useState(mockRows);
  const [selected, setSelected] = useState<GradeRow | null>(null);

  const updateOutcome = (id: number, outcome: Outcome) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, outcome } : r)));
  };

  return (
    <div className="h-screen overflow-auto p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">History & Outcomes</h1>

      {/* Patterns Section */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="text-lg font-bold text-foreground">Your Patterns</h2>
        <p className="text-sm text-muted-foreground mb-4">Unlocked after 10 outcomes logged</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "78", label: "Avg Score" },
            { value: "32%", label: "Reply Rate" },
            { value: "HR", label: "Best Persona" },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-border bg-secondary/40 p-6 text-center">
              <div className="text-4xl font-bold text-foreground">{m.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground">
          Messages where you score &gt;15 on 'Clarity' get 3x more replies.
        </div>
      </div>

      {/* Grade History Table */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Grade History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Persona</th>
              <th className="pb-3 font-medium">Score</th>
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
                  <span className="inline-flex items-center justify-center rounded-full border border-border w-9 h-9 text-sm font-semibold">
                    {row.score}
                  </span>
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
