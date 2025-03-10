/*
  # Create admin users table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `created_at` (timestamp)
      - `created_by` (uuid, references users.id)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for authenticated users to read admin status
    - Add policy for admin users to manage other admins
*/

-- Create the admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to check if someone is an admin
CREATE POLICY "Users can check admin status" 
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admin users to create new admins
CREATE POLICY "Admins can create new admins" 
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Allow admin users to remove other admins
CREATE POLICY "Admins can delete other admins" 
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Create an initial admin user if specified (replace with your user ID)
-- This is useful for bootstrapping the first admin
INSERT INTO admin_users (user_id, created_by)
VALUES ('REPLACE_WITH_YOUR_USER_ID', 'REPLACE_WITH_YOUR_USER_ID')
ON CONFLICT (user_id) DO NOTHING;