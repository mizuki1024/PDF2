import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAFsyt6MbqwYxHzOaSsyhGup5qYZYKOpms",
  authDomain: "tizu-2df5d.firebaseapp.com",
  projectId: "tizu-2df5d",
  storageBucket: "tizu-2df5d.appspot.com",
  messagingSenderId: "121970837294",
  appId: "1:121970837294:web:003042ff34b80ac75edcbf",
  measurementId: "G-N88BZKCY1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

// Google authentication provider setup
export const googleProvider = new GoogleAuthProvider();

// Configure OAuth 2.0 scopes
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');

// Set custom OAuth parameters
googleProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

// Handle redirect result
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return {
        user: result.user,
        token: credential?.accessToken
      };
    }
    return null;
  } catch (error) {
    console.error('Auth redirect error:', error);
    throw error;
  }
};

// Sign in with redirect
export const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);