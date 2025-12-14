import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface StreamResult {
  node: string;
  data: Record<string, unknown>;
}

interface UseClaimProcessorReturn {
  isProcessing: boolean;
  results: StreamResult[];
  completedNodes: string[];
  processClaim: (claimText: string) => Promise<void>;
  reset: () => void;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const API_ENDPOINT = `${API_BASE_URL}/process-claim-stream/`;

export function useClaimProcessor(): UseClaimProcessorReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<StreamResult[]>([]);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);

  const reset = useCallback(() => {
    setResults([]);
    setCompletedNodes([]);
    setIsProcessing(false);
  }, []);

  const processClaim = useCallback(async (claimText: string) => {
    reset();
    setIsProcessing(true);

    try {
      // Send a minimal state object with only claim_description
      // The backend will populate the rest through the Intake Node
      const requestBody = {
        claim_description: claimText,
        claim_id: "",
        type: "",
        date: "",
        amount: 0,
        description: "",
        customer_id: "",
        policy_number: "",
        incident_location: "",
        police_report: null,
        injuries_reported: false,
        other_party_involved: false,
        timestamp_submitted: "",
        customer_tenure_days: 0,
        previous_claims_count: 0,
        claim_Extracted: false,
        risk_assessment_report: null,
        routing_decision_report: null
      };

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines (NDJSON - newline delimited)
        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          try {
            const parsed = JSON.parse(trimmedLine) as StreamResult;
            
            // Update results and completed nodes
            setResults((prev) => [...prev, parsed]);
            setCompletedNodes((prev) => 
              prev.includes(parsed.node) ? prev : [...prev, parsed.node]
            );
          } catch (parseError) {
            console.warn("Failed to parse line:", trimmedLine, parseError);
          }
        }
      }

      // Process any remaining content in buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim()) as StreamResult;
          setResults((prev) => [...prev, parsed]);
          setCompletedNodes((prev) => 
            prev.includes(parsed.node) ? prev : [...prev, parsed.node]
          );
        } catch (parseError) {
          console.warn("Failed to parse remaining buffer:", buffer, parseError);
        }
      }

      toast.success("Claim processed successfully!");
    } catch (error) {
      console.error("Error processing claim:", error);
      toast.error(
        error instanceof Error 
          ? `Connection Error: ${error.message}` 
          : "Failed to connect to the processing server"
      );
    } finally {
      setIsProcessing(false);
    }
  }, [reset]);

  return {
    isProcessing,
    results,
    completedNodes,
    processClaim,
    reset,
  };
}
