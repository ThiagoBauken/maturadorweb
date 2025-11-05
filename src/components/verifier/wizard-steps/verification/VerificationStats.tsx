
interface VerificationStatsProps {
  processedCount: number;
  validCount: number;
  invalidCount: number;
}

export function VerificationStats({
  processedCount,
  validCount,
  invalidCount
}: VerificationStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 bg-muted rounded-md">
        <div className="text-2xl font-bold">{processedCount}</div>
        <div className="text-sm text-muted-foreground">Processed</div>
      </div>
      <div className="text-center p-4 bg-muted rounded-md">
        <div className="text-2xl font-bold text-green-500">{validCount}</div>
        <div className="text-sm text-muted-foreground">Valid</div>
      </div>
      <div className="text-center p-4 bg-muted rounded-md">
        <div className="text-2xl font-bold text-red-500">{invalidCount}</div>
        <div className="text-sm text-muted-foreground">Invalid</div>
      </div>
    </div>
  );
}
