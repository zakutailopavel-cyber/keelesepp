import { useContext } from 'react';
import { AuthContext } from '../../../app/AuthContext.jsx';
import { isOwnerEmail } from '../../../utils/roles.js';

// „Arve väljastaja” (owner 2026-11-09): FIE settings, the per-student switch, the FIE block and the issuer choice are
// shown only to the owner. Outside an AuthProvider (unit tests of other screens) nobody is the owner.
export function useIsOwner() {
  const context = useContext(AuthContext);
  return isOwnerEmail(context?.user?.email);
}
