import React from 'react';
import { auth, signInWithGoogle, handleRedirectResult } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { DriveService } from '../lib/drive';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  driveService: DriveService | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [driveService, setDriveService] = React.useState<DriveService | null>(null);

  React.useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        if (result?.token) {
          setDriveService(new DriveService(result.token));
        }
      } catch (err) {
        console.error('Redirect result error:', err);
        setError(err instanceof Error ? err : new Error('Authentication failed'));
      }
    };

    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoading(false);
      
      if (user) {
        try {
          const token = await user.getIdToken();
          setDriveService(new DriveService(token));
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Authentication error occurred'));
          setDriveService(null);
        }
      } else {
        setDriveService(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err instanceof Error ? err : new Error('Sign-in failed'));
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDriveService(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      error,
      driveService, 
      signInWithGoogle: handleSignIn, 
      logout: handleLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};