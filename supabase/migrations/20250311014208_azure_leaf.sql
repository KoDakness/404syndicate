/*
  # Create chat messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `username` (text)
      - `content` (text)
      - `type` (text) - 'user' or 'system'
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `chat_messages` table
    - Add policies for users to read and insert messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to read messages
CREATE POLICY "Anyone can read messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to insert messages
CREATE POLICY "Authenticated users can insert messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);