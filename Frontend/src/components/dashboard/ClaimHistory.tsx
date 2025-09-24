import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Claim } from '@/types/dashboard';

interface ClaimHistoryProps {
  claims: Claim[];
  onClaimSelect: (claim: Claim) => void;
  activeClaim: Claim | null;
}

const ClaimHistory: React.FC<ClaimHistoryProps> = ({ 
  claims, 
  onClaimSelect, 
  activeClaim 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'risk'>('date');

  const filteredClaims = claims.filter(claim =>
    claim.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.customer_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.amount - a.amount;
      case 'risk':
        return b.risk_score - a.risk_score;
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const getRiskLevelClass = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'status-high';
      case 'MEDIUM':
        return 'status-medium';
      case 'LOW':
        return 'status-low';
      default:
        return 'bg-muted';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-status-low text-white';
      case 'processing':
        return 'bg-status-info text-white';
      case 'error':
        return 'bg-status-high text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Claims History</span>
            <Badge variant="outline">{claims.length} total</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              {['date', 'amount', 'risk'].map((sort) => (
                <Button
                  key={sort}
                  variant={sortBy === sort ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(sort as typeof sortBy)}
                  className="capitalize"
                >
                  {sort}
                </Button>
              ))}
            </div>
          </div>

          {sortedClaims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No claims match your search.' : 'No claims found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Claim ID
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Risk
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClaims.map((claim) => (
                    <tr
                      key={claim.claim_id}
                      onClick={() => onClaimSelect(claim)}
                      className={cn(
                        'border-b hover:bg-muted/50 cursor-pointer transition-smooth',
                        activeClaim?.claim_id === claim.claim_id && 'bg-accent'
                      )}
                    >
                      <td className="py-3">
                        <div className="font-medium">{claim.claim_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {claim.customer_id}
                        </div>
                      </td>
                      <td className="py-3 text-sm">
                        {new Date(claim.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span className="text-sm capitalize">
                          {claim.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 font-medium">
                        ${claim.amount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <Badge className={cn('text-xs', getRiskLevelClass(claim.risk_level))}>
                          {claim.risk_level}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge className={cn('text-xs', getStatusClass(claim.status))}>
                          {claim.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ClaimHistory;