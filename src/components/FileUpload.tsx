import { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileSelect, isProcessing }: FileUploadProps) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    if (csvFile) {
      onFileSelect(csvFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  if (isProcessing) {
    return null;
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <div
        className="p-12 text-center transition-all duration-300 hover:bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="mx-auto mb-6 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary">
          <Upload className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Upload Recipients CSV
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Upload your recipients CSV to send rewards. File should contain: recipient_email, amount, recipient_name, and message (optional).
        </p>
        
        <div className="space-y-4">
          <label
            htmlFor="csv-upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-medium transition-all hover:shadow-primary hover:scale-[1.02] cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Choose CSV File
          </label>
          
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <p className="text-sm text-muted-foreground">
            or drag and drop your CSV file here
          </p>
        </div>
      </div>
    </Card>
  );
};