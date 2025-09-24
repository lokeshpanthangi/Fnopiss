import React, { useState } from 'react';
import { FileText, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import SubmitClaimModal from '@/components/dashboard/SubmitClaimModal';
import { mockClaims } from '@/data/mockData';
import type { Claim } from '@/types/dashboard';

const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmitClaim = (newClaim: Omit<Claim, 'claim_id' | 'timestamp' | 'agents_completed' | 'processing_time'>) => {
    const claim: Claim = {
      ...newClaim,
      claim_id: `CLM-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agents_completed: [],
      processing_time: 0
    };
    setClaims(prev => [claim, ...prev]);
    setShowSubmitModal(false);
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-status-high text-white';
      case 'MEDIUM': return 'bg-status-medium text-black';
      case 'LOW': return 'bg-status-low text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-status-low text-white';
      case 'processing': return 'bg-status-medium text-black';
      case 'new': return 'bg-primary text-primary-foreground';
      case 'error': return 'bg-status-high text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus="connected" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Claims Management</h1>
                <p className="text-muted-foreground">View and manage all insurance claims</p>
              </div>
              <Button onClick={() => setShowSubmitModal(true)}>
                <FileText className="h-4 w-4 mr-2" />
                New Claim
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Claims Overview</CardTitle>
                <div className="flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search claims..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => (
                      <TableRow key={claim.claim_id}>
                        <TableCell className="font-mono font-medium">{claim.claim_id}</TableCell>
                        <TableCell className="capitalize">{claim.type.replace('_', ' ')}</TableCell>
                        <TableCell>${claim.amount.toLocaleString()}</TableCell>
                        <TableCell className="font-mono">{claim.customer_id}</TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(claim.risk_level)}>
                            {claim.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(claim.status)}>
                            {claim.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(claim.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <SubmitClaimModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        onSubmit={handleSubmitClaim}
      />
    </div>
  );
};

export default Claims;