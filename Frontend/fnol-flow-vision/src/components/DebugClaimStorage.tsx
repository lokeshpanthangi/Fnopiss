import { useClaim } from "@/contexts/ClaimContext";
import { apiService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DebugClaimStorage() {
  const { claimResults } = useClaim();

  const checkStorage = () => {
    console.log("=== CLAIM STORAGE DEBUG ===");
    
    // Check context
    console.log("Context claimResults Map size:", claimResults.size);
    console.log("Context claim IDs:", Array.from(claimResults.keys()));
    
    // Check localStorage directly
    try {
      const stored = localStorage.getItem('fnol_claim_results');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("localStorage claim data:", parsed);
        console.log("localStorage claim IDs:", Object.keys(parsed));
      } else {
        console.log("No data in localStorage");
      }
    } catch (error) {
      console.error("Error reading localStorage:", error);
    }
    
    // Check API service method
    const storageData = apiService.getClaimFromStorage("test");
    console.log("API service test lookup:", storageData);
  };

  const clearStorage = () => {
    localStorage.removeItem('fnol_claim_results');
    console.log("Storage cleared");
  };

  return (
    <Card className="p-4 m-4 bg-yellow-50 border-yellow-200">
      <h3 className="font-bold mb-2">Debug: Claim Storage</h3>
      <div className="space-x-2">
        <Button onClick={checkStorage} size="sm">Check Storage</Button>
        <Button onClick={clearStorage} size="sm" variant="outline">Clear Storage</Button>
      </div>
      <div className="mt-2 text-sm">
        <p>Context has {claimResults.size} claims</p>
        <p>Check browser console for detailed logs</p>
      </div>
    </Card>
  );
}