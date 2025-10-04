-- Create table for storing feedback analyses
CREATE TABLE IF NOT EXISTS public.feedback_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_feedback TEXT NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual feedback items with historical tracking
CREATE TABLE IF NOT EXISTS public.feedback_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.feedback_analyses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency INTEGER NOT NULL CHECK (urgency >= 1 AND urgency <= 10),
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 10),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  summary TEXT NOT NULL,
  priority_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for notification settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  enable_weekly_reports BOOLEAN NOT NULL DEFAULT true,
  enable_critical_alerts BOOLEAN NOT NULL DEFAULT true,
  critical_threshold INTEGER NOT NULL DEFAULT 14,
  slack_webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented)
CREATE POLICY "Allow public read access to feedback_analyses" 
ON public.feedback_analyses FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to feedback_analyses" 
ON public.feedback_analyses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to feedback_items" 
ON public.feedback_items FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to feedback_items" 
ON public.feedback_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public access to notification_settings" 
ON public.notification_settings FOR ALL USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_feedback_items_analysis_id ON public.feedback_items(analysis_id);
CREATE INDEX idx_feedback_items_created_at ON public.feedback_items(created_at DESC);
CREATE INDEX idx_feedback_items_category ON public.feedback_items(category);
CREATE INDEX idx_feedback_items_sentiment ON public.feedback_items(sentiment);
CREATE INDEX idx_feedback_analyses_created_at ON public.feedback_analyses(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification_settings
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();