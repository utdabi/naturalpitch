import { Pencil, Folder, BarChart3, Settings, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditContext";
import { useTour } from "@/hooks/use-tour";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "New Pitch", url: "/", icon: Pencil },
  { title: "Template Library", url: "/templates", icon: Folder },
  { title: "History & Outcomes", url: "/history", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const { startTour } = useTour();

  const MAX_BACKGROUND = 2000;

  const [initial, setInitial] = useState("U");
  const [showBackground, setShowBackground] = useState(false);
  const [background, setBackground] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const metaName = user.user_metadata?.full_name;
    if (metaName) {
      setInitial(metaName.charAt(0).toUpperCase());
      return;
    }
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setInitial(data.full_name.charAt(0).toUpperCase());
      });
  }, [user]);

  const openBackgroundModal = async () => {
    setShowBackground(true);
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_background")
      .eq("user_id", user.id)
      .single();
    if (data?.user_background) setBackground(String(data.user_background).slice(0, MAX_BACKGROUND));
  };

  const saveBackground = async () => {
    if (!user) return;
    setSaving(true);

    const sanitized = background
      .replace(/<[^>]*>/g, "")
      .replace(/```/g, "")
      .trim()
      .slice(0, MAX_BACKGROUND);

    const { error } = await supabase
      .from("profiles")
      .update({ user_background: sanitized } as any)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", variant: "destructive" });
    } else {
      toast({ title: "Background saved" });
      setShowBackground(false);
    }
  };


  return (
    <>
      <Sidebar collapsible="none" className="border-r-0">
        <SidebarHeader className="px-5 py-5">
          <div className="flex items-center gap-2">
            <img src={logo} alt="NaturalPitch" className="h-6 w-6 mix-blend-screen" />
            <span className="text-xl font-bold italic text-sidebar-foreground tracking-tight">
              NaturalPitch
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title} id={item.title === "History & Outcomes" ? "tour-history" : undefined}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground rounded-lg"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg"
                        }
                      >
                        <NavLink to={item.url} end>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-4 pb-4 items-center">
          <span className="inline-block -translate-y-3 rounded-full bg-[hsl(var(--sidebar-primary))] px-4 py-1.5 text-sm font-semibold text-white">
            {credits} Credit{credits !== 1 ? "s" : ""} Remaining
          </span>
          <Settings
            id="tour-gear"
            className="h-5 w-5 text-sidebar-foreground/60 cursor-pointer hover:text-sidebar-foreground transition-colors"
            onClick={openBackgroundModal}
          />
          <Popover>
            <PopoverTrigger asChild>
              <div className="h-9 w-9 rounded-full bg-sidebar-accent overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-sidebar-ring transition-all">
                <span className="text-xs text-sidebar-foreground">{initial}</span>
              </div>
            </PopoverTrigger>
            <PopoverContent side="top" align="center" className="w-40 p-1">
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </PopoverContent>
          </Popover>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showBackground} onOpenChange={setShowBackground}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Your Professional Background</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Paste your resume or LinkedIn About section here
            </label>
            <Textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="e.g. 10+ years in B2B SaaS, led product at Acme Corp..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This is used to personalize your rewrites with your real credentials. Only you can see this.
            </p>
            <Button
              onClick={saveBackground}
              disabled={saving}
              className="w-full"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
