-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    preferred_language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comment to explain the table's purpose
COMMENT ON TABLE public.waitlist IS 'Stores email signups for the waitlist before app launch';

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON public.waitlist(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public to insert into waitlist (for the landing page form)
CREATE POLICY "Anyone can join waitlist"
    ON public.waitlist FOR INSERT
    WITH CHECK (true);

-- Allow service role to read waitlist entries (for admin purposes)
CREATE POLICY "Service role can read waitlist"
    ON public.waitlist FOR SELECT
    USING (auth.jwt()->>'role' = 'service_role');

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER waitlist_updated_at_trigger
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION public.update_waitlist_updated_at(); 