-- Clear existing data first since it won't have user_id values
TRUNCATE public.notification_settings CASCADE;
TRUNCATE public.feedback_analyses CASCADE;
TRUNCATE public.feedback_items CASCADE;

-- Add user_id columns to all tables
ALTER TABLE public.notification_settings ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
ALTER TABLE public.feedback_analyses ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
ALTER TABLE public.feedback_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public access to notification_settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Allow public read access to feedback_analyses" ON public.feedback_analyses;
DROP POLICY IF EXISTS "Allow public insert access to feedback_analyses" ON public.feedback_analyses;
DROP POLICY IF EXISTS "Allow public read access to feedback_items" ON public.feedback_items;
DROP POLICY IF EXISTS "Allow public insert access to feedback_items" ON public.feedback_items;

-- Create secure RLS policies for notification_settings
CREATE POLICY "Users can view their own notification settings"
  ON public.notification_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON public.notification_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON public.notification_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings"
  ON public.notification_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure RLS policies for feedback_analyses
CREATE POLICY "Users can view their own feedback analyses"
  ON public.feedback_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback analyses"
  ON public.feedback_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create secure RLS policies for feedback_items
CREATE POLICY "Users can view their own feedback items"
  ON public.feedback_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback items"
  ON public.feedback_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX idx_feedback_analyses_user_id ON public.feedback_analyses(user_id);
CREATE INDEX idx_feedback_items_user_id ON public.feedback_items(user_id);