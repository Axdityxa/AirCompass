-- Create user_push_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  device_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT user_push_tokens_user_id_push_token_key UNIQUE (user_id, push_token)
);

-- Enable Row Level Security
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for user_push_tokens table
CREATE POLICY "Users can view their own push tokens" ON public.user_push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens" ON public.user_push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens" ON public.user_push_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens" ON public.user_push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at column
DROP TRIGGER IF EXISTS handle_push_tokens_updated_at ON public.user_push_tokens;
CREATE TRIGGER handle_push_tokens_updated_at 
  BEFORE UPDATE ON public.user_push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_user_push_tokens_user_id ON public.user_push_tokens(user_id); 