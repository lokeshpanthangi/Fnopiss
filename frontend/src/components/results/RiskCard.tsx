import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RiskAssessment {
  claim_id?: string;
  risk_score?: number;
  category?: string;
  reasons?: string[];
}

interface RiskData {
  risk_assessment_report?: RiskAssessment;
  [key: string]: unknown;
}

interface RiskCardProps {
  data: RiskData;
}

export function RiskCard({ data }: RiskCardProps) {
  const riskReport = data.risk_assessment_report;
  const score = riskReport?.risk_score ?? 0;
  const category = riskReport?.category ?? "Low";
  
  const getRiskLevel = (category: string) => {
    if (category === "Low") return { level: "Low", color: "status-safe", Icon: CheckCircle };
    if (category === "Medium") return { level: "Medium", color: "status-warning", Icon: AlertTriangle };
    return { level: "High", color: "status-danger", Icon: XCircle };
  };

  const { level, color, Icon } = getRiskLevel(category);
  const riskFactors = riskReport?.reasons || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Card className={cn(
        "glass-card border-l-4 overflow-hidden h-full flex flex-col",
        color === "status-safe" && "border-l-status-safe",
        color === "status-warning" && "border-l-status-warning",
        color === "status-danger" && "border-l-status-danger"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              color === "status-safe" && "bg-status-safe/10",
              color === "status-warning" && "bg-status-warning/10",
              color === "status-danger" && "bg-status-danger/10"
            )}>
              <ShieldAlert className={cn(
                "w-5 h-5",
                color === "status-safe" && "text-status-safe",
                color === "status-warning" && "text-status-warning",
                color === "status-danger" && "text-status-danger"
              )} />
            </div>
            <CardTitle className="text-lg">Risk Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 flex-1 overflow-y-auto">
          {/* Score Display */}
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className={cn(
                "text-4xl font-bold",
                color === "status-safe" && "text-status-safe",
                color === "status-warning" && "text-status-warning",
                color === "status-danger" && "text-status-danger"
              )}>
                {score}<span className="text-2xl text-muted-foreground">/10</span>
              </p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className={cn(
                "status-badge gap-2",
                color === "status-safe" && "status-safe",
                color === "status-warning" && "status-warning",
                color === "status-danger" && "status-danger"
              )}
            >
              <Icon className="w-4 h-4" />
              {level} Risk
            </motion.div>
          </div>

          {/* Risk Score Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>10</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(score / 10) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  color === "status-safe" && "bg-status-safe",
                  color === "status-warning" && "bg-status-warning",
                  color === "status-danger" && "bg-status-danger"
                )}
              />
            </div>
          </div>

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Risk Factors</p>
              <ul className="space-y-2">
                {riskFactors.map((factor, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 text-status-warning mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{factor}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
