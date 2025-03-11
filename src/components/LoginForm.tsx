import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Terminal as TerminalIcon, User, Lock, Github, Disc as Discord, Heart } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
  addMessage: (message: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, addMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (password.length < 6) {
      addMessage('ERROR: Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    addMessage('Establishing secure connection...');
    try {
      if (isLogin) {
        const { error, data: authData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!authData.user) throw new Error('Authentication failed');
        
        // Check if player exists
        const { data: player } = await supabase
          .from('players')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (!player) {
          // Create player profile for existing auth user
          const { error: profileError } = await supabase
            .from('players')
            .insert([{
              id: authData.user.id,
              username: email.split('@')[0], // Default username from email
            }]);

          if (profileError) throw profileError;
          addMessage('Creating new player profile...');
        }

        addMessage('Access granted. Welcome back, hacker.');
        onLogin();
      } else {
        // Check if username already exists
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
          throw new Error('Username cannot be empty');
        }
        
        // Check if username already exists
        const { data: existingUser } = await supabase
          .from('players')
          .select('id')
          .eq('username', trimmedUsername)
          .single();

        if (existingUser) {
          throw new Error('Username already taken');
        }

        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Failed to create account');

        if (data.user) {
          // Create player profile
          const { error: profileError } = await supabase
            .from('players')
            .insert([
              {
                id: data.user.id,
                username: trimmedUsername,
              }
            ]);

          if (profileError) throw profileError;
          addMessage(`Identity created. Welcome to the Syndicate, ${username}!`);
          onLogin();
        }
      }
    } catch (error) {
      addMessage(`ERROR: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
       <h1 className="text-center text-4xl font-bold mb-4 text-green-500">404 SYNDICATE</h1>
      <div className="bg-black/50 border-4 border-green-900/50 rounded-lg p-6 max-w-md mx-auto relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <TerminalIcon className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold font-mono text-green-400">
            {isLogin ? 'Access Terminal' : 'Create Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-green-400 font-mono text-sm mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-5 h-5 text-green-600" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^A-Za-z0-9_-]/g, ''))}
                minLength={3}
                maxLength={20}
                pattern="[A-Za-z0-9_-]+"
                className="w-full bg-black/50 border-2 border-green-900 rounded py-2 px-10 text-green-400 font-mono focus:outline-none focus:border-green-500"
                placeholder="Choose your hacker alias"
                required
              />
            </div>
            <p className="text-green-600 text-xs mt-1 font-mono">
              3-20 characters, letters, numbers, - and _ only
            </p>
          </div>
        )}

        <div>
          <label className="block text-green-400 font-mono text-sm mb-1">Email</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-5 h-5 text-green-600" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border-2 border-green-900 rounded py-2 px-10 text-green-400 font-mono focus:outline-none focus:border-green-500"
              placeholder="Enter email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-green-400 font-mono text-sm mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-5 h-5 text-green-600" />
            <input
              type="password"
              value={password}
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border-2 border-green-900 rounded py-2 px-10 text-green-400 font-mono focus:outline-none focus:border-green-500"
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-900/30 border-2 border-green-500 rounded text-green-400 font-mono hover:bg-green-900/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
        </button>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-green-600 font-mono text-sm hover:text-green-400"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
          
          <div className="mt-8 pt-4 border-t-2 border-green-900/50">
            <div className="text-center text-green-600 font-mono text-sm mb-4">
              Support 404 Syndicate Development
            </div>
            <div className="flex justify-center gap-4">
              <a
                href="https://discord.gg/AkuhFXsg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 rounded border border-green-900 hover:border-green-500 text-green-400 font-mono text-sm transition-colors"
              >
                <Discord className="w-4 h-4" />
                <span>Discord</span>
              </a>
              <a
                href="https://github.com/KoDarkness"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 rounded border border-green-900 hover:border-green-500 text-green-400 font-mono text-sm transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a
                href="https://paypal.me/KoDarknee94"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 rounded border border-green-900 hover:border-green-500 text-green-400 font-mono text-sm transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Donate</span>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};