import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  connectionStatus: 'connected' | 'disconnected';
}

const Header: React.FC<HeaderProps> = ({ connectionStatus }) => {
  return (
    <header className="bg-white border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-foreground">
          FNOL Multi-Agent System
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Badge 
          variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
          className="flex items-center space-x-1"
        >
          {connectionStatus === 'connected' ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Disconnected</span>
            </>
          )}
        </Badge>
        
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
};

export default Header;