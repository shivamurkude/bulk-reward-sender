import { useState } from 'react';
import { Gift, Zap } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { ProcessingTable } from '@/components/ProcessingTable';
import { useToast } from '@/hooks/use-toast';
import { parseCSV, downloadCSV } from '@/utils/csvUtils';
import { sendReward } from '@/services/tremendousApi';
import { CSVRow, ProcessedRow } from '@/types/reward';

const Index = () => {
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      const csvRows = await parseCSV(file);
      const processedRows: ProcessedRow[] = csvRows.map((row, index) => ({
        ...row,
        id: `row-${index}`,
        status: 'pending' as const,
      }));

      setRows(processedRows);
      setIsProcessing(true);
      setIsComplete(false);

      toast({
        title: "CSV Parsed Successfully",
        description: `Found ${processedRows.length} recipients. Starting to send rewards...`,
      });

      await processRewards(processedRows);
    } catch (error) {
      toast({
        title: "Error parsing CSV",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive",
      });
    }
  };

  const processRewards = async (processedRows: ProcessedRow[]) => {
    for (let i = 0; i < processedRows.length; i++) {
      const row = processedRows[i];
      
      // Update status to sending
      setRows(prevRows => 
        prevRows.map(r => 
          r.id === row.id ? { ...r, status: 'sending' as const } : r
        )
      );

      try {
        const response = await sendReward({
          recipient_email: row.recipient_email,
          recipient_name: row.recipient_name,
          amount: row.amount,
          message: row.message,
        });

        const rewardId = response.order.rewards[0]?.id;

        // Update status to success
        setRows(prevRows => 
          prevRows.map(r => 
            r.id === row.id 
              ? { ...r, status: 'success' as const, reward_id: rewardId }
              : r
          )
        );

        toast({
          title: "Reward Sent Successfully!",
          description: `Reward sent to ${row.recipient_email}`,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Update status to failed
        setRows(prevRows => 
          prevRows.map(r => 
            r.id === row.id 
              ? { ...r, status: 'failed' as const, error_message: errorMessage }
              : r
          )
        );

        toast({
          title: "Failed to send reward",
          description: `Failed to send reward to ${row.recipient_email}: ${errorMessage}`,
          variant: "destructive",
        });
      }

      // Small delay between requests to avoid rate limiting
      if (i < processedRows.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsComplete(true);
    
    // Auto-download summary
    setTimeout(() => {
      handleDownloadSummary();
    }, 1000);
  };

  const handleDownloadSummary = () => {
    downloadCSV(rows, `reward_summary_${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: "Summary Downloaded",
      description: "Reward processing summary has been downloaded",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Tremendous Reward Sender
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your CSV file and send rewards to multiple recipients automatically with real-time tracking and summary reports.
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto space-y-8">
          <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
          
          {rows.length > 0 && (
            <ProcessingTable 
              rows={rows} 
              onDownloadSummary={handleDownloadSummary}
              isComplete={isComplete}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>Powered by Tremendous API</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
