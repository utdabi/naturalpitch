import { ClipboardCheck } from "lucide-react";
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

const Index = () => {
  return (
    <div className="flex h-screen">
      {/* Left Pane */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">New Pitch</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Target Persona
            </label>
            <Select>
              <SelectTrigger className="w-full bg-card border-border">
                <SelectValue placeholder="Select target (HR, Founder, Peer...)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="peer">Peer</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch />
            <label className="text-sm text-foreground">
              Deep Context (5 credits)
            </label>
          </div>

          <Textarea
            placeholder="Paste your LinkedIn message here..."
            className="min-h-[340px] bg-card border-primary/40 border-2 resize-none text-foreground placeholder:text-muted-foreground"
          />

          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-lg">
            Grade & Improve (1 credit)
          </Button>
        </div>
      </div>

      {/* Right Pane */}
      <div className="flex-1 bg-secondary/60 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ClipboardCheck className="h-16 w-16 mx-auto text-muted-foreground/40" strokeWidth={1} />
          <p className="text-muted-foreground text-sm max-w-[240px]">
            Your scorecard and rewrites will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
