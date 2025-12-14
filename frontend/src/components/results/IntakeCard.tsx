import { motion } from "framer-motion";
import { ClipboardList, User, Calendar, Hash, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IntakeData {
  claim_id?: string;
  customer_id?: string;
  policy_number?: string;
  type?: string;
  date?: string;
  amount?: number;
  description?: string;
  incident_location?: string;
  [key: string]: unknown;
}

interface IntakeCardProps {
  data: IntakeData;
}

export function IntakeCard({ data }: IntakeCardProps) {
  const fields = [
    { icon: Hash, label: "Claim ID", value: data.claim_id || "N/A" },
    { icon: User, label: "Policy Number", value: data.policy_number || "N/A" },
    { icon: Calendar, label: "Incident Date", value: data.date || "N/A" },
    { icon: FileText, label: "Claim Type", value: data.type || "N/A" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="glass-card border-l-4 border-l-primary overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Claim Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-background/50 rounded-lg"
              >
                <field.icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{field.label}</p>
                  <p className="font-medium text-foreground">{field.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {data.description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 p-3 bg-background/50 rounded-lg"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-foreground">{data.description}</p>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 grid grid-cols-2 gap-3"
          >
            {data.amount !== undefined && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount</p>
                <p className="text-sm font-semibold text-foreground">${data.amount.toLocaleString()}</p>
              </div>
            )}
            {data.incident_location && (
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm text-foreground">{data.incident_location}</p>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
