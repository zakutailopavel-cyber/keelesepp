(function(){
  'use strict';

  const HEARTBEAT_INTERVAL_MS = 45 * 1000;
  const HEARTBEAT_THROTTLE_MS = 30 * 1000;
  const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
  const API_BASE = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';
  const SUPER_ADMIN_EMAIL = 'zakutailo.pavel@gmail.com';
  const ACTIVITY_EVENTS = ['pointerdown','keydown','scroll','touchstart'];
  const TEACHER_HOME_PATH = '/haldus-teacher-home/';
  const TEACHER_HOME_ENTRY_ID = 'keelesepp-teacher-home-entry';
  let stopCurrentTracker = function(){};

  const pageInstanceId = (window.crypto && typeof window.crypto.randomUUID === 'function')
    ? window.crypto.randomUUID()
    : `page_${Date.now()}_${Math.random().toString(36).slice(2,12)}`;

  const normalizedRoles = profile => {
    const values = [
      profile && profile.role,
      ...(Array.isArray(profile && profile.roles) ? profile.roles : []),
    ];
    return new Set(values.map(value=>String(value||'').trim().toLowerCase()).filter(Boolean));
  };

  const isStaffProfile = profile => {
    const roles = normalizedRoles(profile);
    return roles.has('admin')
      || roles.has('teacher')
      || String(profile && profile.email || '').trim().toLowerCase() === SUPER_ADMIN_EMAIL;
  };

  const currentPath = () => String(window.location.pathname || '/').replace(/\/+$/,'') || '/';

  const isLegacyHaldusHome = () => {
    const path = currentPath();
    return path === '/haldus' || path === '/haldus.html';
  };

  const removeTeacherHomeEntry = () => {
    const existing = document.getElementById(TEACHER_HOME_ENTRY_ID);
    if(existing) existing.remove();
  };

  const ensureTeacherHomeEntry = () => {
    if(!isLegacyHaldusHome()) return;
    if(document.getElementById(TEACHER_HOME_ENTRY_ID)) return;
    const entry = document.createElement('a');
    entry.id = TEACHER_HOME_ENTRY_ID;
    entry.href = TEACHER_HOME_PATH;
    entry.textContent = 'Õpetaja täna →';
    entry.setAttribute('aria-label','Ava õpetaja tänane töölaud');
    entry.title = 'Tänased tunnid, õppimiskontekst ja Lesson Mode';
    Object.assign(entry.style,{
      position:'fixed',
      right:'18px',
      bottom:'18px',
      zIndex:'2147483000',
      display:'inline-flex',
      alignItems:'center',
      justifyContent:'center',
      minHeight:'44px',
      padding:'0 16px',
      borderRadius:'999px',
      background:'#172a3d',
      color:'#ffffff',
      textDecoration:'none',
      fontFamily:'IBM Plex Sans,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      fontSize:'13px',
      fontWeight:'700',
      letterSpacing:'.01em',
      boxShadow:'0 12px 30px rgba(23,42,61,.22)'
    });
    document.body.appendChild(entry);
  };

  const activityArea = () => {
    const path = currentPath();
    if(path.startsWith('/live-classroom')) return 'live-classroom';
    if(path.startsWith('/haldus-exercises')) return 'learning-library';
    if(path.startsWith('/haldus-worksheet')) return 'worksheet';
    if(path.startsWith('/haldus-teacher-home')) return 'teacher-home';
    if(path.startsWith('/haldus-learning-profile')) return 'learning-profile';
    if(path.startsWith('/haldus-skillmap')) return 'skill-map';
    if(path.includes('calendar')) return 'calendar';
    return 'crm';
  };

  const emitStatus = detail => {
    window.dispatchEvent(new CustomEvent('keelesepp-staff-activity',{detail}));
  };

  const startTracker = user => {
    let lastInteractionAt = Date.now();
    let lastSentAt = 0;
    let inFlight = false;
    let stopped = false;
    const area = activityArea();

    const canCountNow = () =>
      !stopped
      && document.visibilityState === 'visible'
      && (typeof document.hasFocus !== 'function' || document.hasFocus())
      && Date.now() - lastInteractionAt <= IDLE_TIMEOUT_MS;

    const sendHeartbeat = async(force=false) => {
      if(!canCountNow() || inFlight) return;
      if(!force && Date.now() - lastSentAt < HEARTBEAT_THROTTLE_MS) return;
      inFlight = true;
      try{
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE}/activity/heartbeat`,{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            Authorization:`Bearer ${token}`
          },
          body:JSON.stringify({pageInstanceId,area})
        });
        if(!response.ok) throw new Error(`Heartbeat failed (${response.status})`);
        const result = await response.json();
        lastSentAt = Date.now();
        emitStatus({state:'counting',area,...result});
      }catch(error){
        console.warn('Staff activity heartbeat failed:',error);
        emitStatus({state:'error',area});
      }finally{
        inFlight = false;
      }
    };

    const onInteraction = () => {
      const wasIdle = Date.now() - lastInteractionAt > IDLE_TIMEOUT_MS;
      lastInteractionAt = Date.now();
      if(wasIdle) sendHeartbeat(true);
    };
    const onVisibility = () => {
      if(document.visibilityState === 'visible'){
        lastInteractionAt = Date.now();
        sendHeartbeat(true);
      }else{
        emitStatus({state:'paused',area});
      }
    };
    const onFocus = () => {
      lastInteractionAt = Date.now();
      sendHeartbeat(true);
    };
    const timer = window.setInterval(()=>{
      if(canCountNow()) sendHeartbeat();
      else emitStatus({state:'idle',area});
    },HEARTBEAT_INTERVAL_MS);

    ACTIVITY_EVENTS.forEach(eventName=>
      window.addEventListener(eventName,onInteraction,{passive:true,capture:true})
    );
    document.addEventListener('visibilitychange',onVisibility);
    window.addEventListener('focus',onFocus);
    window.addEventListener('online',onFocus);
    window.setTimeout(()=>sendHeartbeat(true),1500);

    return () => {
      stopped = true;
      window.clearInterval(timer);
      ACTIVITY_EVENTS.forEach(eventName=>
        window.removeEventListener(eventName,onInteraction,{capture:true})
      );
      document.removeEventListener('visibilitychange',onVisibility);
      window.removeEventListener('focus',onFocus);
      window.removeEventListener('online',onFocus);
    };
  };

  const boot = () => {
    const auth = window._auth || (window.firebase && firebase.auth && firebase.auth());
    const db = window._db || (window.firebase && firebase.firestore && firebase.firestore());
    if(!auth || !db) return;
    auth.onAuthStateChanged(async user=>{
      stopCurrentTracker();
      stopCurrentTracker = function(){};
      removeTeacherHomeEntry();
      if(!user) return;
      try{
        const profileSnap = await db.collection('users').doc(user.uid).get();
        const profile = {email:user.email,...(profileSnap.exists?profileSnap.data():{})};
        if(isStaffProfile(profile)){
          ensureTeacherHomeEntry();
          stopCurrentTracker = startTracker(user);
        }
      }catch(error){
        console.warn('Staff activity tracker could not verify the profile:',error);
      }
    });
  };

  window.KeeleSeppStaffActivity = {
    heartbeatIntervalMs:HEARTBEAT_INTERVAL_MS,
    idleTimeoutMs:IDLE_TIMEOUT_MS,
    pageInstanceId,
    teacherHomePath:TEACHER_HOME_PATH
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();