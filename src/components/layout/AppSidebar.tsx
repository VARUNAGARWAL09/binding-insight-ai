import {
  Home,
  FlaskConical,
  Layers,
  Brain,
  BarChart3,
  Database,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  User,
  Bot,
  Pill,
  History
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Prediction", url: "/prediction", icon: FlaskConical },
  { title: "Batch Prediction", url: "/batch-prediction", icon: Layers },
  { title: "History & Analytics", url: "/history", icon: History },
  { title: "Explainability", url: "/explainability", icon: Brain },
  { title: "Drug Likeness", url: "/drug-likeness", icon: Pill },
  { title: "Model Performance", url: "/performance", icon: BarChart3 },
  { title: "Dataset Explorer", url: "/dataset", icon: Database },
  { title: "Documentation", url: "/documentation", icon: BookOpen },
  { title: "About", url: "/about", icon: User },
];

interface AppSidebarProps {
  onOpenAssistant?: () => void;
}

export function AppSidebar({ onOpenAssistant }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt="DrugBind AI"
            className="h-9 w-9 rounded-lg"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">DrugBind AI</span>
              <span className="text-xs text-muted-foreground">Binding Prediction</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* AI Assistant Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={onOpenAssistant}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
                  >
                    <Bot className="h-4 w-4 shrink-0 text-teal-500" />
                    {!collapsed && <span>AI Assistant</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 space-y-2">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
