-- Create storage bucket for idea attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('idea-attachments', 'idea-attachments', true);

-- Create storage policies for idea attachments
CREATE POLICY "Users can view all files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'idea-attachments');

CREATE POLICY "Users can upload files for their ideas" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'idea-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'idea-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'idea-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);