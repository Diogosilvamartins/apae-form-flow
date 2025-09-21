-- Create storage bucket for assistido photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assistido-photos', 'assistido-photos', true);

-- Create RLS policies for assistido photos
CREATE POLICY "Authenticated users can view assistido photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assistido-photos');

CREATE POLICY "Authenticated users can upload assistido photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'assistido-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own assistido photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'assistido-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own assistido photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'assistido-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);