import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExistingFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
}

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
  existingFiles?: ExistingFile[];
  onRemoveExisting?: (fileId: string) => void;
  readOnly?: boolean;
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
  placeholder,
  existingFiles = [],
  onRemoveExisting,
  readOnly = false
}: FileUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const { t, isRTL } = useLanguage();

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

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      // Fetch the file properly to ensure integrity
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      // Get the file as a blob to preserve binary data
      const blob = await response.blob();
      
      // Create object URL for the blob
      const objectUrl = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      
      toast({
        title: t('idea_form', 'file_downloaded'),
        description: `${fileName} has been downloaded successfully`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: t('idea_form', 'download_failed'),
        description: `Failed to download ${fileName}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className={`text-sm font-medium ${isRTL ? 'text-right block' : 'text-left'}`}>{label}</Label>
      
      {!readOnly && (
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
            <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
              {placeholder || t('idea_form', 'upload_files')}
            </p>
            <p className={`text-xs text-muted-foreground mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {multiple 
                ? t('idea_form', 'multiple_files_allowed')
                : t('idea_form', 'single_file_only')
              }
            </p>
          </div>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {readOnly ? 'Attached Files:' : 'Current Files:'}
          </p>
          {existingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-md border gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{file.file_name}</span>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-primary/10 rounded flex-shrink-0">
                  {file.file_type}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file.file_url, file.file_name)}
                  title={t('idea_form', 'download_file')}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
                {!readOnly && onRemoveExisting && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveExisting(file.id)}
                    disabled={disabled}
                    title={t('idea_form', 'remove_file')}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Files */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className={`text-sm font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('idea_form', 'new_files')}:
          </p>
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-md border gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-primary/10 rounded flex-shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
                title={t('idea_form', 'remove_file')}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};