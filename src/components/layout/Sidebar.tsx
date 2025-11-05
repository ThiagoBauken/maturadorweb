
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Phone, 
  BarChart3, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Flame,
  CheckCircle2,
  Send,
  Activity
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
};

const NavItem = ({ to, icon: Icon, label, isCollapsed }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive 
          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
          : "text-sidebar-foreground",
        isCollapsed && "justify-center px-0"
      )
    }
  >
    <Icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-2")} />
    {!isCollapsed && <span>{label}</span>}
  </NavLink>
);

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  const isAdmin = user?.role === 'admin';

  // On mobile, always start collapsed
  const effectiveCollapsed = isMobile || isCollapsed;

  return (
    <div
      className={cn(
        "h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        effectiveCollapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
        {!effectiveCollapsed && (
          <div className="font-bold text-sidebar-foreground">WhatsApp Platform</div>
        )}
        {effectiveCollapsed && (
          <div className="w-full flex justify-center">
            <span className="text-xl font-bold text-brand-600">W</span>
          </div>
        )}
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="space-y-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isCollapsed={effectiveCollapsed} />
          <NavItem to="/bulk-sender" icon={Send} label="Bulk Sender" isCollapsed={effectiveCollapsed} />
          <NavItem to="/sessions" icon={Phone} label="Sessions" isCollapsed={effectiveCollapsed} />
          <NavItem to="/analytics" icon={Activity} label="Analytics" isCollapsed={effectiveCollapsed} />
          {isAdmin && (
            <NavItem to="/admin/analytics" icon={BarChart3} label="Admin Analytics" isCollapsed={effectiveCollapsed} />
          )}
          <NavItem to="/warmers" icon={Flame} label="Warmers" isCollapsed={effectiveCollapsed} />
          <NavItem to="/verifier" icon={CheckCircle2} label="Verifier" isCollapsed={effectiveCollapsed} />
          <NavItem to="/settings" icon={Settings} label="Settings" isCollapsed={effectiveCollapsed} />
        </nav>
      </div>

      <div className="p-3 border-t border-sidebar-border">
        {!effectiveCollapsed && (
          <div className="mb-2 text-xs text-sidebar-foreground/70 truncate">
            Logged in as: {user?.name} {isAdmin && <span className="text-primary">(Admin)</span>}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
