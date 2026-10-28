import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/firebase/auth.js';
import { isFirebaseConfigured } from '../services/firebase/client.js';

const AuthContext = createContext(null);

// who may open a read-only view of another user: an admin anyone's, a teacher a student card's (the rules still limit
// what the teacher reads to his own students)
export const mayPreview = (roles = [], target = {}) => (roles || []).includes('admin') || ((roles || []).includes('teacher') && Boolean(target?.studentId));

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
        return user;
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
        return user;
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
    refresh: async () => {
      const user = await service.refresh();
      setState((current) => ({ ...current, user, error: null }));
      return user;
    },
    signOut: () => { setPreview(null); return service.signOut(); },
    startPreview: (target) => {
      // an admin opens anyone's view; a teacher his own student's (owner 2026-10-27: „учитель видит всё, что и ученик”) —
      // read only, and the teacher's own data rights stay (Firestore rules)
      if (!mayPreview(state.user?.roles, target)) throw new Error('Ainult administraator või õpilase õpetaja saab vaadet avada.');
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

// the signed-in user when there is an AuthProvider, otherwise null (a page rendered alone, e.g. in a test)
export function useOptionalAuth() {
  return useContext(AuthContext);
}
