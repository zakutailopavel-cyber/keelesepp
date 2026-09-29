import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/firebase/auth.js';
import { isFirebaseConfigured } from '../services/firebase/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, service = authService }) {
  const configured = isFirebaseConfigured();
  const [state, setState] = useState({ loading: configured, user: null, error: null });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!configured) return undefined;
    return service.subscribe(
      (user) => setState({ loading: false, user, error: null }),
      (error) => setState({ loading: false, user: null, error }),
    );
  }, [configured, service]);

  const value = useMemo(() => ({
    ...state,
    user: preview?.user || state.user,
    adminUser: state.user,
    preview,
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
    signInWithGoogle: async (registration = null) => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const user = await service.signInWithGoogle(registration);
        setState({ loading: false, user, error: null });
      } catch (error) {
        setState({ loading: false, user: null, error });
        throw error;
      }
    },
    register: async (values) => {
      const user = await service.register(values);
      setState({ loading: false, user, error: null });
      return user;
    },
    resetPasswordFor: (email) => service.resetPasswordFor(email),
    signOut: () => { setPreview(null); return service.signOut(); },
    startPreview: (target) => {
      if (!state.user?.roles?.includes('admin')) throw new Error('Ainult administraator saab kasutajavaadet avada.');
      if (!target?.user) throw new Error('Vali kasutaja.');
      setPreview({ ...target, readOnly: true });
    },
    stopPreview: () => setPreview(null),
    updateProfile: async (values) => {
      const user = await service.updateProfile(values);
      setState((current) => ({ ...current, user, error: null }));
      return user;
    },
    sendPasswordReset: () => service.sendPasswordReset(),
  }), [configured, preview, service, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export { AuthContext };
