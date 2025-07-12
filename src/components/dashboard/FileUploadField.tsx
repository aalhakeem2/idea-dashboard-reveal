import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadFieldProps {
  label: string;
  fileType: 'feasibility' | 'pricing_offer' | 'prototype';
  accept?: string;
  multiple?: boolean;
  value: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const FileUploadField = ({
  label,
  fileType,
  accept = "*/*",
  multiple = false,
  value,
  onChange,
  disabled = false,
  className = "",
  placeholder
}: FileUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate file types and sizes
    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        continue;
      }

      // Basic file type validation based on fileType
      if (fileType === 'feasibility' || fileType === 'pricing_offer') {
        if (!file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('document')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} must be a PDF or Word document`,
            variant: "destructive",
          });
          continue;
        }
      } else if (fileType === 'prototype') {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} must be an image`,
            variant: "destructive",
          });
          continue;
        }
      }

      validFiles.push(file);
    }

    if (multiple) {
      onChange([...value, ...validFiles]);
    } else {
      onChange(validFiles.slice(0, 1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {placeholder || "Drop files here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {multiple ? "Multiple files allowed" : "Single file only"} • Max 10MB
          </p>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};