import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Trash2, Search, AlertCircle, Check, X } from 'lucide-react';

interface AdminManagementProps {
  playerIsAdmin: boolean;
}

interface AdminUser {
  id: string;
  user_id: string;
  username?: string;
  created_at: string;
  created_by: string;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ playerIsAdmin }) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin users on component mount
  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get all admin users
      const { data: admins, error } = await supabase
        .from('admin_users')
        .select('*');
        
      if (error) throw error;
      
      // Get usernames for all admin users
      const adminWithUsernames = await Promise.all(
        (admins || []).map(async (admin) => {
          const { data: player } = await supabase
            .from('players')
            .select('username')
            .eq('id', admin.user_id)
            .single();
            
          return {
            ...admin,
            username: player?.username || 'Unknown User'
          };
        })
      );
      
      setAdminUsers(adminWithUsernames);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      setMessage({ 
        text: 'Failed to load admin users', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!userSearch.trim()) return;
    
    try {
      setIsSearching(true);
      
      // Search for users by username
      const { data, error } = await supabase
        .from('players')
        .select('id, username')
        .ilike('username', `%${userSearch}%`)
        .limit(5);
        
      if (error) throw error;
      
      // Filter out users who are already admins
      const filteredResults = (data || []).filter(
        user => !adminUsers.some(admin => admin.user_id === user.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching for users:', error);
      setMessage({ 
        text: 'Error searching for users', 
        type: 'error' 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addAdmin = async (userId: string, username: string) => {
    try {
      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Insert new admin record
      const { error } = await supabase
        .from('admin_users')
        .insert([
          { 
            user_id: userId,
            created_by: user.id
          }
        ]);
        
      if (error) throw error;
      
      // Add to local state
      setAdminUsers([
        ...adminUsers,
        {
          id: Date.now().toString(), // temporary ID until refresh
          user_id: userId,
          username,
          created_at: new Date().toISOString(),
          created_by: user.id
        }
      ]);
      
      // Clear search
      setSearchResults([]);
      setUserSearch('');
      
      setMessage({ 
        text: `Added ${username} as admin`, 
        type: 'success' 
      });
      
      // Refresh the list to get the actual data
      fetchAdminUsers();
    } catch (error) {
      console.error('Error adding admin:', error);
      setMessage({ 
        text: 'Failed to add admin user', 
        type: 'error'
      });
    }
  };

  const removeAdmin = async (adminId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
        
      if (error) throw error;
      
      // Remove from local state
      setAdminUsers(adminUsers.filter(admin => admin.id !== adminId));
      
      setMessage({ 
        text: `Removed ${username} from admins`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error removing admin:', error);
      setMessage({ 
        text: 'Failed to remove admin user', 
        type: 'error' 
      });
    }
  };

  if (!playerIsAdmin) {
    return (
      <div className="text-center">
        <p className="text-red-400 font-mono">
          You don't have permission to access admin management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-4">
        Admin Management
      </h2>
      
      {message.text && (
        <div className={`p-4 rounded border ${
          message.type === 'error' 
            ? 'border-red-500 bg-red-900/20 text-red-400' 
            : 'border-green-500 bg-green-900/20 text-green-400'
        } font-mono mb-4 flex items-center gap-2`}>
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          {message.text}
          <button 
            onClick={() => setMessage({ text: '', type: '' })}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Search for users */}
      <div className="bg-black/50 border-4 border-green-900/50 rounded-lg p-6">
        <h3 className="text-green-400 font-bold font-mono mb-4">Add New Admin</h3>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search for users by username"
              className="w-full bg-black/50 border-2 border-green-900 rounded py-2 pl-10 pr-4 text-green-400 font-mono focus:outline-none focus:border-green-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-green-600" />
          </div>
          <button
            onClick={searchUsers}
            disabled={!userSearch.trim() || isSearching}
            className={`px-4 py-2 rounded border-2 font-mono ${
              !userSearch.trim() || isSearching
                ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                : 'border-green-500 text-green-400 hover:bg-green-900/30'
            }`}
          >
            Search
          </button>
        </div>
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 mb-4">
            {searchResults.map(user => (
              <div key={user.id} className="flex justify-between items-center bg-black/30 border border-green-900 rounded p-3">
                <span className="text-green-400 font-mono">{user.username}</span>
                <button
                  onClick={() => addAdmin(user.id, user.username)}
                  className="px-3 py-1 rounded border border-green-500 text-green-400 font-mono text-sm flex items-center gap-1 hover:bg-green-900/30"
                >
                  <UserPlus className="w-4 h-4" />
                  Add as Admin
                </button>
              </div>
            ))}
          </div>
        )}
        
        {searchResults.length === 0 && userSearch && !isSearching && (
          <div className="text-yellow-400 font-mono text-sm text-center py-2">
            No matching users found
          </div>
        )}
      </div>
      
      {/* Current admin users */}
      <div className="bg-black/50 border-4 border-green-900/50 rounded-lg p-6">
        <h3 className="text-green-400 font-bold font-mono mb-4">Current Admin Users</h3>
        
        {isLoading ? (
          <div className="text-green-400 font-mono text-center py-4">
            Loading admin users...
          </div>
        ) : adminUsers.length > 0 ? (
          <div className="space-y-2">
            {adminUsers.map(admin => (
              <div key={admin.id} className="flex justify-between items-center bg-black/30 border border-green-900 rounded p-3">
                <span className="text-green-400 font-mono">{admin.username}</span>
                <span className="text-green-600 font-mono text-sm">
                  Added: {new Date(admin.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => removeAdmin(admin.id, admin.username || 'Unknown User')}
                  className="px-3 py-1 rounded border border-red-500 text-red-400 font-mono text-sm flex items-center gap-1 hover:bg-red-900/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-yellow-400 font-mono text-center py-4">
            No admin users found. Add an admin user using the search above.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;