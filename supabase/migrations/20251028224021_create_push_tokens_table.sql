/*
  # Push Tokens Table

  1. New Tables
    - `push_tokens`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - Reference to auth.users
      - `token` (text) - Expo push token
      - `device_id` (text) - Unique device identifier
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `push_tokens` table
    - Policy: Authenticated users can insert/update their own tokens
    - Policy: Authenticated users can read their own tokens
    - Policy: Service role can read all tokens (for webhooks)
  
  3. Indexes
    - Index on user_id for fast lookups
    - Unique constraint on device_id to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  device_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert own tokens"
  ON push_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update own tokens"
  ON push_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own tokens
CREATE POLICY "Users can read own tokens"
  ON push_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service role can read all tokens (for webhooks)
CREATE POLICY "Service role can read all tokens"
  ON push_tokens
  FOR SELECT
  TO service_role
  USING (true);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
