import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const personaColors: Record<string, string> = {
  "Hiring Manager": "bg-[hsl(210,70%,50%)] text-white",
  Founder: "bg-[hsl(0,70%,55%)] text-white",
  "Recruiter / HR": "bg-[hsl(30,70%,50%)] text-white",
  Peer: "bg-[hsl(160,60%,40%)] text-white",
  "Potential Client": "bg-[hsl(140,50%,45%)] text-white",
};

const templates = [
  {
    persona: "Hiring Manager",
    selectPersona: "Hiring Manager",
    text: "Hi [Name], I noticed your recent LinkedIn post about scaling engineering teams and was impressed by your approach to building distributed teams. I have 8 years of experience in DevOps and have helped scale infrastructure at two Series B startups. I'd love to share some specific ideas that could help with the challenges you mentioned.",
  },
  {
    persona: "Founder",
    selectPersona: "Founder",
    text: "I've been following [Company]'s growth and was impressed by your approach to solving [Problem] in the [Industry] space. Your recent funding round caught my attention, and I believe my experience in growth marketing could help accelerate your next phase of expansion.",
  },
  {
    persona: "Recruiter / HR",
    selectPersona: "HR",
    text: "Thank you for connecting! I saw the [Job Title] opening at [Company] and wanted to share why I'd be a strong fit. With my background in [Skill Area] and track record of delivering [Specific Result], I'm confident I can contribute to your team's goals.",
  },
  {
    persona: "Peer",
    selectPersona: "Peer",
    text: "I came across your article on [Topic] and it really resonated with my experience in the field. I've been working on similar challenges at [My Company] and would love to exchange ideas. Perhaps we could grab a virtual coffee sometime this week?",
  },
  {
    persona: "Potential Client",
    selectPersona: "Investor",
    text: "I help [Industry] companies solve [Problem]. Based on [Company]'s recent [Event], it looks like you might be facing similar challenges. I've helped 3 companies in your space achieve [Specific Metric] — happy to share what worked if you're interested.",
  },
  {
    persona: "Hiring Manager",
    selectPersona: "Hiring Manager",
    text: "Hi [Name], I noticed your team is expanding the engineering department. Having led DevOps transformations at companies like [Previous Company], I understand the infrastructure challenges that come with rapid growth. I'd welcome the chance to discuss how my experience aligns with your needs.",
  },
];

const Templates = () => {
  const navigate = useNavigate();

  const useTemplate = (template: (typeof templates)[0]) => {
    navigate("/", { state: { message: template.text, persona: template.selectPersona } });
  };

  return (
    <div className="h-screen overflow-auto p-8">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Templates</h1>
          <p className="text-sm text-muted-foreground">Your personal playbook of proven messages</p>
        </div>
        <span className="text-sm text-muted-foreground">{templates.length} templates saved</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between">
            <div>
              <span className={`inline-block rounded px-2.5 py-1 text-xs font-medium mb-3 ${personaColors[t.persona] || "bg-muted text-foreground"}`}>
                {t.persona}
              </span>
              <p className="text-sm text-foreground line-clamp-3 leading-relaxed">{t.text}</p>
            </div>
            <Button
              onClick={() => useTemplate(t)}
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
            >
              Use Template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
