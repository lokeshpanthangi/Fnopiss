import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ClaimInputProps {
  onSubmit: (claimText: string) => void;
  isProcessing: boolean;
}

export function ClaimInput({ onSubmit, isProcessing }: ClaimInputProps) {
  const [claimText, setClaimText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!claimText.trim()) {
      setError("Please enter claim details before processing.");
      return;
    }
    setError("");
    onSubmit(claimText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">New Claim Intake</h2>
          <p className="text-sm text-muted-foreground">Enter the claim description below</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="claim-details" className="text-sm font-medium text-foreground">
            Claim Details
          </Label>
          <Textarea
            id="claim-details"
            placeholder="Type or paste the claim description here..."
            className="min-h-[160px] resize-none bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all duration-200"
            value={claimText}
            onChange={(e) => {
              setClaimText(e.target.value);
              if (error) setError("");
            }}
            disabled={isProcessing}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              {error}
            </motion.p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full h-12 text-base font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-70"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Claim...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Process Claim
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
