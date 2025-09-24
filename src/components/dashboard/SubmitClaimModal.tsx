import React, { useState } from 'react';
import { CalendarIcon, MapPin, FileText, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Claim } from '@/types/dashboard';

interface SubmitClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (claim: Omit<Claim, 'claim_id' | 'timestamp' | 'agents_completed' | 'processing_time'>) => void;
}

const claimTypes = [
  { value: 'auto_collision', label: 'Auto Collision' },
  { value: 'property_damage', label: 'Property Damage' },
  { value: 'personal_injury', label: 'Personal Injury' },
  { value: 'theft', label: 'Theft' },
  { value: 'fire', label: 'Fire' },
  { value: 'flood', label: 'Flood' },
];

const SubmitClaimModal: React.FC<SubmitClaimModalProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    type: '' as Claim['type'],
    amount: '',
    description: '',
    customer_id: '',
    policy_number: '',
    location: '',
    police_report: '',
    has_injuries: false,
  });
  const [date, setDate] = useState<Date>();
  const [useDump, setUseDump] = useState(false);
  const [dumpData, setDumpData] = useState('');

  const handleDumpParse = () => {
    if (!dumpData.trim()) return;
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(dumpData);
      setFormData({
        type: parsed.type || '',
        amount: parsed.amount?.toString() || '',
        description: parsed.description || '',
        customer_id: parsed.customer_id || '',
        policy_number: parsed.policy_number || '',
        location: parsed.location || '',
        police_report: parsed.police_report || '',
        has_injuries: parsed.has_injuries || false,
      });
      if (parsed.date) setDate(new Date(parsed.date));
    } catch {
      // If not JSON, try to extract key-value pairs from text
      const lines = dumpData.split('\n');
      const extracted: any = {};
      
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_');
          const value = line.substring(colonIndex + 1).trim();
          
          if (key.includes('type')) extracted.type = value;
          else if (key.includes('amount')) extracted.amount = value.replace(/[^0-9.]/g, '');
          else if (key.includes('description')) extracted.description = value;
          else if (key.includes('customer')) extracted.customer_id = value;
          else if (key.includes('policy')) extracted.policy_number = value;
          else if (key.includes('location')) extracted.location = value;
          else if (key.includes('police')) extracted.police_report = value;
          else if (key.includes('injur')) extracted.has_injuries = value.toLowerCase().includes('yes') || value.toLowerCase().includes('true');
        }
      });
      
      setFormData(prev => ({ ...prev, ...extracted }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useDump && dumpData.trim()) {
      handleDumpParse();
      return;
    }
    
    if (!formData.type || !formData.amount || !formData.customer_id || !formData.policy_number) {
      return;
    }

    // Auto-calculate risk based on amount and type
    const amount = parseFloat(formData.amount);
    let riskScore = 1;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let priority: 'normal' | 'urgent' | 'critical' = 'normal';

    if (amount > 50000 || formData.has_injuries) {
      riskScore = Math.min(10, Math.floor(amount / 10000) + (formData.has_injuries ? 3 : 0));
      riskLevel = riskScore >= 7 ? 'HIGH' : riskScore >= 4 ? 'MEDIUM' : 'LOW';
      priority = riskScore >= 8 ? 'critical' : riskScore >= 5 ? 'urgent' : 'normal';
    } else {
      riskScore = Math.min(6, Math.floor(amount / 5000) + 1);
      riskLevel = riskScore >= 4 ? 'MEDIUM' : 'LOW';
    }

    const claim: Omit<Claim, 'claim_id' | 'timestamp' | 'agents_completed' | 'processing_time'> = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      status: 'new',
      current_agent: 'intake',
      risk_score: riskScore,
      risk_level: riskLevel,
      priority: priority,
      customer_id: formData.customer_id,
      policy_number: formData.policy_number,
      description: formData.description,
      location: formData.location,
      adjuster_tier: riskLevel === 'HIGH' ? 'Senior' : riskLevel === 'MEDIUM' ? 'Standard' : 'Junior',
      processing_notes: ['Claim submitted successfully', 'Queued for intake processing']
    };

    onSubmit(claim);
    
    // Reset form
    setFormData({
      type: '' as Claim['type'],
      amount: '',
      description: '',
      customer_id: '',
      policy_number: '',
      location: '',
      police_report: '',
      has_injuries: false,
    });
    setDate(undefined);
    setUseDump(false);
    setDumpData('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Submit New Claim</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
            <Checkbox
              id="use-dump"
              checked={useDump}
              onCheckedChange={(checked) => setUseDump(checked as boolean)}
            />
            <Label htmlFor="use-dump" className="text-sm font-medium">
              Quick Dump Mode - Paste all claim data as text or JSON
            </Label>
          </div>
          
          {useDump ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dump-data">Claim Data Dump</Label>
                <Textarea
                  id="dump-data"
                  placeholder="Paste claim data here... 
Examples:
- JSON: {&quot;type&quot;: &quot;auto_collision&quot;, &quot;amount&quot;: 5000, &quot;customer_id&quot;: &quot;CUST-123&quot;}
- Text: Type: Auto Collision, Amount: $5000, Customer ID: CUST-123, Policy: POL-456"
                  value={dumpData}
                  onChange={(e) => setDumpData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <Button type="button" onClick={handleDumpParse} className="w-full">
                Parse & Fill Form
              </Button>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Claim Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Claim['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select claim type" />
                </SelectTrigger>
                <SelectContent>
                  {claimTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Claim Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer ID *</Label>
              <Input
                id="customer_id"
                placeholder="CUST-12345"
                value={formData.customer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policy_number">Policy Number *</Label>
              <Input
                id="policy_number"
                placeholder="POL-789012"
                value={formData.policy_number}
                onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the incident in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Incident</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="police_report">Police Report Number</Label>
              <Input
                id="police_report"
                placeholder="Optional"
                value={formData.police_report}
                onChange={(e) => setFormData(prev => ({ ...prev, police_report: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="injuries"
                checked={formData.has_injuries}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, has_injuries: checked as boolean }))
                }
              />
              <Label htmlFor="injuries" className="text-sm">
                Injuries involved
              </Label>
            </div>
          </div>
          </>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Claim
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitClaimModal;