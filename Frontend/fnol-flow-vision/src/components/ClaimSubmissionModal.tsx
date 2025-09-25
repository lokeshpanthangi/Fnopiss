import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, DollarSign, FileText, User, Shield, MapPin, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClaimSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function ClaimSubmissionModal({ open, onClose, onSubmit }: ClaimSubmissionModalProps) {
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    customer_id: "",
    policy_number: "",
    date: undefined as Date | undefined,
    location: "",
    police_report: "",
    injuries: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dumpData, setDumpData] = useState("");
  const [activeTab, setActiveTab] = useState("form");

  const claimTypes = [
    { value: "auto_collision", label: "Auto Collision", icon: "🚗" },
    { value: "property_damage", label: "Property Damage", icon: "🏠" },
    { value: "theft", label: "Theft", icon: "🔒" },
    { value: "water_damage", label: "Water Damage", icon: "💧" },
    { value: "fire_damage", label: "Fire Damage", icon: "🔥" },
    { value: "other", label: "Other", icon: "📋" }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = "Claim type is required";
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.customer_id.trim()) newErrors.customer_id = "Customer ID is required";
    if (!formData.policy_number.trim()) newErrors.policy_number = "Policy number is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        amount: Number(formData.amount)
      });
      
      // Reset form
      setFormData({
        type: "",
        amount: "",
        description: "",
        customer_id: "",
        policy_number: "",
        date: undefined,
        location: "",
        police_report: "",
        injuries: false
      });
      setErrors({});
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleDumpSubmit = () => {
    try {
      // Try to parse as JSON first
      const parsedData = JSON.parse(dumpData);
      onSubmit({
        type: parsedData.type || "other",
        amount: parseFloat(parsedData.amount) || 0,
        customer_id: parsedData.customer_id || "N/A",
        policy_number: parsedData.policy_number || "N/A",
        description: parsedData.description || dumpData.substring(0, 200),
        date: parsedData.date ? new Date(parsedData.date) : new Date(),
        location: parsedData.location || "N/A",
        police_report: parsedData.police_report || "",
        injuries: parsedData.injuries || false
      });
    } catch {
      // If not JSON, treat as text description
      onSubmit({
        type: "other",
        amount: 0,
        customer_id: "N/A",
        policy_number: "N/A", 
        description: dumpData,
        date: new Date(),
        location: "N/A",
        police_report: "",
        injuries: false
      });
    }
    setDumpData("");
    setActiveTab("form");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-surface-secondary border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-text-primary">
            <FileText className="h-5 w-5 text-status-action" />
            <span>Submit New Claim</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form">Form Entry</TabsTrigger>
            <TabsTrigger value="dump">Dump Data</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Claim Type and Amount Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-text-primary">Claim Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                    <SelectTrigger className={cn("bg-surface-tertiary border-border", errors.type && "border-status-high")}>
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-secondary border-border">
                      {claimTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-text-primary hover:bg-surface-hover">
                          <span className="flex items-center space-x-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-status-high text-sm">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-text-primary">Claim Amount * ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => handleChange("amount", e.target.value)}
                      className={cn("pl-10 bg-surface-tertiary border-border text-text-primary", errors.amount && "border-status-high")}
                    />
                  </div>
                  {errors.amount && <p className="text-status-high text-sm">{errors.amount}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-text-primary">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the incident in detail..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={cn("bg-surface-tertiary border-border text-text-primary resize-none h-24", errors.description && "border-status-high")}
                />
                {errors.description && <p className="text-status-high text-sm">{errors.description}</p>}
              </div>

              {/* Customer and Policy Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_id" className="text-text-primary">Customer ID *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <Input
                      id="customer_id"
                      placeholder="CUST-12345"
                      value={formData.customer_id}
                      onChange={(e) => handleChange("customer_id", e.target.value)}
                      className={cn("pl-10 bg-surface-tertiary border-border text-text-primary", errors.customer_id && "border-status-high")}
                    />
                  </div>
                  {errors.customer_id && <p className="text-status-high text-sm">{errors.customer_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy_number" className="text-text-primary">Policy Number *</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <Input
                      id="policy_number"
                      placeholder="POL-98765"
                      value={formData.policy_number}
                      onChange={(e) => handleChange("policy_number", e.target.value)}
                      className={cn("pl-10 bg-surface-tertiary border-border text-text-primary", errors.policy_number && "border-status-high")}
                    />
                  </div>
                  {errors.policy_number && <p className="text-status-high text-sm">{errors.policy_number}</p>}
                </div>
              </div>

              {/* Date and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-text-primary">Date of Incident *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-surface-tertiary border-border hover:bg-surface-hover",
                          !formData.date && "text-text-tertiary",
                          errors.date && "border-status-high"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-surface-secondary border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleChange("date", date)}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && <p className="text-status-high text-sm">{errors.date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-text-primary">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className={cn("pl-10 bg-surface-tertiary border-border text-text-primary", errors.location && "border-status-high")}
                    />
                  </div>
                  {errors.location && <p className="text-status-high text-sm">{errors.location}</p>}
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-text-primary font-medium">Additional Information (Optional)</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="police_report" className="text-text-primary">Police Report Number</Label>
                  <Input
                    id="police_report"
                    placeholder="PR-2024-001"
                    value={formData.police_report}
                    onChange={(e) => handleChange("police_report", e.target.value)}
                    className="bg-surface-tertiary border-border text-text-primary"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="injuries"
                    checked={formData.injuries}
                    onCheckedChange={(checked) => handleChange("injuries", checked)}
                    className="border-border data-[state=checked]:bg-status-action"
                  />
                  <Label htmlFor="injuries" className="text-text-primary cursor-pointer">
                    Injuries were involved in this incident
                  </Label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-surface-tertiary border-border text-text-primary hover:bg-surface-hover"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-status-action hover:bg-status-action/90 text-white"
                >
                  Submit Claim
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="dump">
            <div className="space-y-4">
              <div>
                <Label htmlFor="dump-data" className="text-text-primary">
                  Dump Text or JSON Data
                </Label>
                <p className="text-sm text-text-secondary mb-3">
                  Paste JSON data or plain text. For JSON, include fields: type, amount, customer_id, policy_number, description, date, location, police_report, injuries
                </p>
                <Textarea
                  id="dump-data"
                  value={dumpData}
                  onChange={(e) => setDumpData(e.target.value)}
                  placeholder='{"type": "auto_collision", "amount": 5000, "customer_id": "CUST001", "policy_number": "POL123", "description": "Minor collision", "date": "2024-01-15", "location": "New York, NY", "police_report": "PR001", "injuries": false}'
                  className="bg-surface-tertiary border-border text-text-primary min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-surface-tertiary border-border text-text-primary hover:bg-surface-hover"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDumpSubmit}
                  className="bg-status-action hover:bg-status-action/90 text-white"
                  disabled={!dumpData.trim()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Process Data
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}