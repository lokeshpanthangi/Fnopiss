import { motion } from "framer-motion";
import { Route, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RoutingDecision {
  claim_id?: string;
  processing_path?: string;
  priority?: string;
  adjuster_tier?: string;
  rationale?: string;
}

interface RoutingData {
  routing_decision_report?: RoutingDecision;
  [key: string]: unknown;
}

interface RoutingCardProps {
  data: RoutingData;
}

export function RoutingCard({ data }: RoutingCardProps) {
  const routingReport = data.routing_decision_report;
  const department = routingReport?.processing_path || "Standard Processing";
  const isSpecialUnit = department.toLowerCase().includes("special") || 
                        department.toLowerCase().includes("investigation");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Card className={cn(
        "glass-card-elevated border-l-4 overflow-hidden h-full flex flex-col",
        isSpecialUnit ? "border-l-status-warning" : "border-l-status-safe"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Route className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Final Decision</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto">
          

          {/* Department Routing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="p-4 bg-background/50 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Claim</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold",
                  isSpecialUnit 
                    ? "bg-status-warning/15 text-status-warning" 
                    : "bg-status-safe/15 text-status-safe"
                )}
              >
                <Building2 className="w-4 h-4" />
                {department}
              </motion.div>
            </div>
            
            {routingReport?.priority && (
              <p className="text-sm text-muted-foreground">
                Priority: <span className="font-medium text-foreground">{routingReport.priority}</span>
              </p>
            )}
          </motion.div>

          {/* Adjuster Tier */}
          {routingReport?.adjuster_tier && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 bg-background/50 rounded-lg"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Assigned To</p>
              <p className="text-sm font-medium text-foreground">{routingReport.adjuster_tier}</p>
            </motion.div>
          )}

          {/* Rationale */}
          {routingReport?.rationale && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-3 bg-background/50 rounded-lg"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Routing Reason</p>
              <p className="text-sm text-foreground">{routingReport.rationale}</p>
            </motion.div>
          )}

          {/* Success Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 p-3 bg-status-safe/10 rounded-lg border border-status-safe/20"
          >
            <CheckCircle2 className="w-5 h-5 text-status-safe" />
            <p className="text-sm font-medium text-status-safe">Claim processed successfully</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
