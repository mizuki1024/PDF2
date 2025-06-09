import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, User, AlertCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const handleLogin = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error('Googleログインエラー:', err);
      if ((err as { code?: string })?.code === 'auth/popup-blocked') {
        setError('ポップアップがブロックされました');
      } else {
        setError('ログインに失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">PDF Summary App</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {error && (
              <div className="text-sm text-red-200 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <span className="text-sm text-white">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </>
            ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'ログイン中...' : 'Googleでログイン'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};