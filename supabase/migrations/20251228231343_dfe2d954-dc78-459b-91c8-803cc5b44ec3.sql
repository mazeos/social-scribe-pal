-- Add analysis column to store AI analysis results
ALTER TABLE public.transcriptions 
ADD COLUMN analysis jsonb DEFAULT NULL;