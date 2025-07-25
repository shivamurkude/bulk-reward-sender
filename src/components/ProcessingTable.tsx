import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ProcessedRow } from '@/types/reward';

interface ProcessingTableProps {
  rows: ProcessedRow[];
  onDownloadSummary: () => void;
  isComplete: boolean;
}

export const ProcessingTable = ({ rows, onDownloadSummary, isComplete }: ProcessingTableProps) => {
  const successCount = rows.filter(row => row.status === 'success').length;
  const failedCount = rows.filter(row => row.status === 'failed').length;
  const completedCount = successCount + failedCount;
  const progress = rows.length > 0 ? (completedCount / rows.length) * 100 : 0;

  const getStatusIcon = (status: ProcessedRow['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'sending':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (row: ProcessedRow) => {
    switch (row.status) {
      case 'success':
        return <span className="text-success font-medium">Success</span>;
      case 'failed':
        return (
          <div className="text-destructive">
            <span className="font-medium">Failed</span>
            {row.error_message && (
              <div className="text-xs text-muted-foreground mt-1">
                {row.error_message}
              </div>
            )}
          </div>
        );
      case 'sending':
        return <span className="text-primary font-medium">Sending...</span>;
      default:
        return <span className="text-muted-foreground">Pending</span>;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <div className="p-6">
        {/* Header with progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Processing Results</h2>
            {isComplete && (
              <Button 
                onClick={onDownloadSummary}
                variant="success"
              >
                Download Summary CSV
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground">
                Progress: {completedCount}/{rows.length}
              </span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-success font-medium">{successCount} Success</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-destructive font-medium">{failedCount} Failed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Reward ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-4 px-2 text-foreground font-medium">
                    {row.recipient_name}
                  </td>
                  <td className="py-4 px-2 text-muted-foreground">
                    {row.recipient_email}
                  </td>
                  <td className="py-4 px-2 text-foreground">
                    ${row.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(row.status)}
                      {getStatusText(row)}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-muted-foreground font-mono text-sm">
                    {row.reward_id || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};