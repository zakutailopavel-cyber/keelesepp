import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/firebase/auth.js';
import { isFirebaseConfigured } from '../services/firebase/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, service = authService }) {
  const configured = isFirebaseConfigured();
  const [state, setState] = useState({ loading: configured, user: null, error: null });

  useEffect(() => {
    if (!configured) return undefined;
    return service.subscribe(
      (user) => setState({ loading: false, user, error: null }),
      (error) => setState({ loading: false, user: null, error }),
    );
  }, [configured, service]);

  const value = useMemo(() => ({
    ...state,
    configured,
    signIn: async (email, password) => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const user = await service.signIn(email, password);
        setState({ loading: false, user, error: null });
      } catch (error) {
        setState({ loading: false, user: null, error });
        throw error;
      }
    },
    signInWithGoogle: async () => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const user = await service.signInWithGoogle();
        setState({ loading: false, user, error: null });
      } catch (error) {
        setState({ loading: false, user: null, error });
        throw error;
      }
    },
    signOut: () => service.signOut(),
  }), [configured, service, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export { AuthContext };
