import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

interface BubbleData {
  name: string;
  score: number;
  max: number;
  importance: number;
}

const CATEGORY_IMPORTANCE: Record<string, number> = {
  Clarity: 8,
  Relevance: 9,
  Credibility: 7,
  CTA: 6,
  Tone: 5,
};

function scoreToPct(score: number, max: number) {
  return Math.round((score / max) * 100);
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{d.name}</p>
      <p className="text-muted-foreground">Score: {d.scorePct}%</p>
      <p className="text-muted-foreground">Importance: {d.importance}/10</p>
    </div>
  );
}

export function ScoreBubbleChart({
  subscores,
}: {
  subscores: { name: string; score: number; max: number }[];
}) {
  const data = subscores.map((s) => ({
    name: s.name,
    importance: CATEGORY_IMPORTANCE[s.name] ?? 5,
    scorePct: scoreToPct(s.score, s.max),
    bubbleSize: s.max,
  }));

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 16, bottom: 24, left: 8 }}>
          {/* Quadrant backgrounds */}
          <ReferenceArea
            x1={0} x2={5} y1={50} y2={100}
            fill="hsl(174, 42%, 40%)" fillOpacity={0.06}
            ifOverflow="extendDomain"
          />
          <ReferenceArea
            x1={5} x2={10} y1={50} y2={100}
            fill="hsl(174, 42%, 40%)" fillOpacity={0.12}
            ifOverflow="extendDomain"
          />
          <ReferenceArea
            x1={0} x2={5} y1={0} y2={50}
            fill="hsl(220, 10%, 50%)" fillOpacity={0.06}
            ifOverflow="extendDomain"
          />
          <ReferenceArea
            x1={5} x2={10} y1={0} y2={50}
            fill="hsl(25, 90%, 55%)" fillOpacity={0.1}
            ifOverflow="extendDomain"
          />

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 86%)" strokeOpacity={0.5} />
          <XAxis
            type="number"
            dataKey="importance"
            domain={[0, 10]}
            name="Importance"
            tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
            label={{ value: "Category Importance", position: "bottom", offset: 8, fontSize: 12, fill: "hsl(220, 10%, 50%)" }}
          />
          <YAxis
            type="number"
            dataKey="scorePct"
            domain={[0, 100]}
            name="Score"
            tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
            label={{ value: "Score (%)", angle: -90, position: "insideLeft", offset: 4, fontSize: 12, fill: "hsl(220, 10%, 50%)" }}
          />
          <ZAxis
            type="number"
            dataKey="bubbleSize"
            range={[200, 600]}
            name="Max Points"
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Scatter
            data={data}
            fill="hsl(174, 42%, 40%)"
            stroke="hsl(174, 42%, 30%)"
            strokeWidth={1.5}
            fillOpacity={0.75}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
