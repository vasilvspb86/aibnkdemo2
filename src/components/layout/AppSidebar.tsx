import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  CreditCard,
  FileText,
  Receipt,
  TrendingUp,
  Gift,
  MessageSquare,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Accounts", icon: Wallet, path: "/accounts" },
  { title: "Payments", icon: ArrowUpDown, path: "/payments" },
  { title: "Cards", icon: CreditCard, path: "/cards" },
];

const operationsItems = [
  { title: "Invoices", icon: FileText, path: "/invoices" },
  { title: "Expenses", icon: Receipt, path: "/expenses" },
  { title: "Credit", icon: TrendingUp, path: "/credit" },
  { title: "Rewards", icon: Gift, path: "/rewards", badge: "Soon" },
];

const supportItems = [
  { title: "AI Assistant", icon: MessageSquare, path: "/assistant" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/signin");
  };

  const userEmail = user?.email || "user@example.com";
  const userInitials = userEmail.slice(0, 2).toUpperCase();
  const NavItem = ({ item }: { item: typeof mainNavItems[0] & { badge?: string } }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link to={item.path} className="flex items-center gap-3">
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">AIBNK</h1>
            <p className="text-xs text-sidebar-foreground/60">Business Banking</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
          <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-primary">{userInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userEmail}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">Business Account</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
