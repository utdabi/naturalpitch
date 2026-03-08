import { Pencil, Folder, BarChart3, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
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

  return (
    <Sidebar collapsible="none" className="border-r-0">
      <SidebarHeader className="px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold italic text-sidebar-foreground tracking-tight">
            <span className="text-[hsl(var(--sidebar-primary))] text-2xl font-black italic">N</span>
            {" "}NaturalPitch
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
                  <SidebarMenuItem key={item.title}>
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
        <span className="inline-block rounded-full bg-[hsl(var(--sidebar-primary))] px-4 py-1.5 text-sm font-semibold text-white">
          95 Credits
        </span>
        <Settings className="h-5 w-5 text-sidebar-foreground/60" />
        <div className="h-9 w-9 rounded-full bg-sidebar-accent overflow-hidden flex items-center justify-center">
          <span className="text-xs text-sidebar-foreground">U</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
