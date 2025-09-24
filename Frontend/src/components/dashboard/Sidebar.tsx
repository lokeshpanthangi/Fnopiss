import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Settings,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigationItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'Claims', path: '/claims' },
  { icon: Users, label: 'Agents', path: '/agents' },
  { icon: Activity, label: 'Analytics', path: '/analytics' },
  { icon: AlertTriangle, label: 'Alerts', path: '/alerts' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <aside className="w-64 bg-white border-r border-border h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-smooth',
                isActive 
                  ? 'bg-accent text-accent-foreground font-medium' 
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium">System Status</div>
          <div className="text-xs text-muted-foreground mt-1">
            All agents operational
          </div>
          <div className="flex space-x-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-status-low"></div>
            <div className="w-2 h-2 rounded-full bg-status-low"></div>
            <div className="w-2 h-2 rounded-full bg-status-low"></div>
            <div className="w-2 h-2 rounded-full bg-status-low"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;