(function(){
  const APP_VERSION  = 'KeeleSepp CRM · 29.08.2026.4';
  const LEVELS   = ['Eelkool','A1','A2','B1','B2','C1'];
  const TEACHERS = ['Pavel','Jelena','Elizaveta','Angelina'];
  const STAFF_ALIASES = {
    pavel:'Pavel Zakutailo',
    jelena:'Elena Zakutailo',
    elena:'Elena Zakutailo',
    elizaveta:'Yelyzaveta Lukiianchuk',
    yelyzaveta:'Yelyzaveta Lukiianchuk',
    angelina:'Anhelina Korotka',
    anhelina:'Anhelina Korotka'
  };
  const SUBJECTS = ['Eesti keel','Inglise keel','Matemaatika','Muu'];
  const GRADES = ['Eelkool','1. klass','2. klass','3. klass','4. klass','5. klass','6. klass','7. klass','8. klass','9. klass','10. klass','11. klass','12. klass','Täiskasvanu'];
  const LESSON_DURATIONS = ['30','45','60','90','120'];
  const PAYMENT_METHODS = [
    {id:'bank', label:'Pangaülekanne'},
    {id:'cash', label:'Sularaha'},
    {id:'other', label:'Kokkuleppel'}
  ];
  const PAYMENT_DETAILS = {
    company:'E&P Koolitus OÜ',
    regCode:'17270880',
    address:'Harju maakond, Saue vald, Laagri alevik, Nõlvaku põik 3b, 76401',
    email:'zakutailo.pavel@gmail.com',
    iban:'EE917700771011885682',
    bank:'LHV Pank AS',
    swift:'LHVBEE22',
    paymentTermDays:5,
    paymentDueDay:10,
    paymentDueRule:'monthly_10',
    lateFeePerDay:'0.0%',
    issuer:'Pavel Zakutailo'
  };
  const CONTACT_STATUSES = [
    {id:'new', label:'Uus'},
    {id:'contacted', label:'Võetud ühendust'},
    {id:'waiting', label:'Ootab vastust'},
    {id:'scheduled', label:'Tund kokku lepitud'},
    {id:'active', label:'Aktiivne õpilane'},
  ];
  const DAYS_SHORT = ['E','T','K','N','R','L','P'];
  const DAYS_ID    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const DAYS_FULL  = ['Esmaspäev','Teisipäev','Kolmapäev','Neljapäev','Reede','Laupäev','Pühapäev'];

  // ── TIMES: 15-minute steps (07:00 – 21:00) ───────────
  const TIMES = Array.from({length:57},(_,index)=>{
    const minutes=(7*60)+(index*15);
    return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
  });

  const normalizeText = value => (value || '').trim().toLowerCase();
  const studentIdentityKey = student => [
    normalizeText(student?.name),
    normalizeText(student?.parentEmail || student?.contactEmail || student?.guardianEmail || student?.email),
    normalizeText(student?.parentName || student?.guardianName)
  ].join('|');
  const studentProfileKey = student => [
    studentIdentityKey(student),
    normalizeText(student?.subject || 'Eesti keel'),
    normalizeText(canonicalTeacherName(student?.teacher || ''))
  ].join('|');
  const resolveStudentRecord = (students,record={}) => {
    const list=Array.isArray(students)?students:[];
    const recordId=String(record?.studentId||record?.id||'').trim();
    const byId=recordId?list.find(student=>student.id===recordId):null;
    if(byId?.mergedIntoStudentId){
      const primary=list.find(student=>student.id===byId.mergedIntoStudentId);
      return primary&&!primary.mergedIntoStudentId?primary:null;
    }
    if(byId) return byId;
    const name=normalizeText(record?.studentName||record?.name);
    if(!name) return null;
    const activeMatches=list.filter(student=>
      student.active!==false
      && !student.mergedIntoStudentId
      && normalizeText(student.name)===name
    );
    return activeMatches.length===1?activeMatches[0]:null;
  };
  const lessonJournalErrorGuidance = value => {
    const original=String(value||'').trim();
    const error=normalizeText(original);
    if(!error) return 'Päeviku salvestamine ei õnnestunud. Proovi uuesti.';
    if(error.includes('schedule entry belongs to another student')){
      return 'Tund on seotud teise või ühendatud õpilasekaardiga. Uuenda lehte ja ava tund uuesti.';
    }
    if(error.includes('student not found')||error.includes('registered student')){
      return 'Õpilase põhikaarti ei leitud. Kontrolli tunni seost õpilasega.';
    }
    if(error.includes('billed lesson basis cannot be changed')){
      return 'Arveldatud tunni õpilast, kuupäeva või staatust ei saa päevikust muuta.';
    }
    if(error.includes('financial period')&&error.includes('closed')){
      return 'Selle kuu finantsperiood on suletud. Muudatus tuleb teha paranduskandena.';
    }
    if(error.includes('lesson belongs to another teacher')){
      return 'See tund kuulub teisele õpetajale. Kontrolli tunni õpetajat.';
    }
    if(error.includes('inline lesson attachments are too large')){
      return 'Lisatud failid on liiga suured. Eemalda failid või lisa väiksemad failid.';
    }
    return original.slice(0,300);
  };
  const parseLinkedNames = value =>
    String(value || '')
      .split(/[,\n;|]+/)
      .map(part => normalizeText(part))
      .filter(Boolean);
  const canonicalTeacherName = value => {
    const name = (value || '').trim();
    if(!name) return '';
    const lower = name.toLowerCase();
    const aliasKey = STAFF_ALIASES[lower] ? lower : Object.keys(STAFF_ALIASES).find(key => lower.startsWith(key + ' '));
    if(aliasKey) return STAFF_ALIASES[aliasKey];
    const matched = TEACHERS.find(t => lower === t.toLowerCase() || lower.startsWith(t.toLowerCase() + ' '));
    return matched || name;
  };
  const canonicalTeacherKey = value => {
    const first = normalizeText(canonicalTeacherName(value)).split(/\s+/)[0] || '';
    return {
      jelena:'elena',
      elena:'elena',
      elizaveta:'yelyzaveta',
      yelyzaveta:'yelyzaveta',
      angelina:'anhelina',
      anhelina:'anhelina'
    }[first] || first;
  };
  const teacherUidFromDirectory = async teacherName => {
    const key = canonicalTeacherKey(teacherName);
    if(!key || !window._db) return '';
    try{
      const snapshot = await window._db.collection('securityConfig').doc('teacherDirectoryV1').get();
      return snapshot.exists ? String(snapshot.data()?.teachers?.[key] || '') : '';
    }catch(error){
      console.warn('Teacher directory lookup failed:',error);
      return '';
    }
  };

  const levelPct = (cur,tgt) => { const c=LEVELS.indexOf(cur),t=LEVELS.indexOf(tgt); return t>0&&c<t?Math.round(c/t*100):c>=t?100:0; };
  const avg = arr => arr.length?(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1):'—';
  const fmtDate = d => d?new Date(d).toLocaleDateString('et-EE',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';
  const toLocalISODate = value => {
    const d = value ? new Date(value) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${year}-${month}-${day}`;
  };
  const today = () => toLocalISODate();
  const pkgLeft = s => Math.max(0,(Number.parseInt(s?.packageTotal,10)||0)-(Number.parseInt(s?.packageUsed,10)||0));
  const copyText = async text => {
    try{
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(String(text));
        return true;
      }
    }catch(e){}
    try{
      const area = document.createElement('textarea');
      area.value = String(text);
      area.setAttribute('readonly','');
      area.style.position = 'absolute';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      return true;
    }catch(e){
      return false;
    }
  };

  const getAuthHeaders = async (extraHeaders = {}) => {
    const currentUser = window._auth?.currentUser;
    if(!currentUser) throw new Error('Sisselogimine on aegunud. Palun logi uuesti sisse.');
    const token = await currentUser.getIdToken();
    return {
      ...extraHeaders,
      Authorization: `Bearer ${token}`
    };
  };

  const authFetch = async (url, options = {}) => {
    const headers = await getAuthHeaders(options.headers || {});
    return fetch(url, {...options, headers});
  };

  const getUserRoles = profile => {
    const roles = new Set();
    if(Array.isArray(profile?.roles)){
      profile.roles.forEach(role => { if(role) roles.add(role); });
    }
    if(profile?.role) roles.add(profile.role);
    if(profile?.parentRole || profile?.isParent) roles.add('parent');
    if(profile?.studentRole || profile?.isStudent) roles.add('student');
    return Array.from(roles);
  };
  const hasUserRole = (profile, role) => getUserRoles(profile).includes(role);
  const withUserRoles = (profile, ...extraRoles) => {
    const roles = new Set(getUserRoles(profile));
    extraRoles.flat().forEach(role => { if(role) roles.add(role); });
    return Array.from(roles);
  };

  async function ensureStudentRecord(authUser, profile){
    if(!authUser || !hasUserRole(profile,'student')) return;
    const db = window._db;
    const name = profile.displayName || authUser.displayName || authUser.email || 'Õpilane';
    const email = profile.email || authUser.email || '';
    const existingByLink = await db.collection('students').where('linkedUserId','==',authUser.uid).limit(1).get();
    const existingByUid = existingByLink.empty
      ? await db.collection('students').where('studentUid','==',authUser.uid).limit(1).get()
      : null;
    const existingByArray = existingByLink.empty && existingByUid?.empty
      ? await db.collection('students').where('linkedUserIds','array-contains',authUser.uid).limit(1).get()
      : null;
    const existingDoc = !existingByLink.empty
      ? existingByLink.docs[0]
      : (!existingByUid?.empty ? existingByUid.docs[0] : (!existingByArray?.empty ? existingByArray.docs[0] : null));
    if(existingDoc){
      const data = existingDoc.data() || {};
      if(data.mergedIntoStudentId){
        const canonical = await db.collection('students').doc(data.mergedIntoStudentId).get();
        if(canonical.exists) return;
      }else return;
    }
    const teacher = canonicalTeacherName(profile.preferredTeacher || profile.teacher || '');
    const teacherUid = await teacherUidFromDirectory(teacher);
    await db.collection('students').add({
      linkedUserId: authUser.uid,
      studentUid: authUser.uid,
      linkedUserIds:[authUser.uid],
      isSelfStudent:true,
      name,
      email,
      phone:'',
      level:'A1',
      targetLevel:'B1',
      teacher,
      teacherUid,
      active:true,
      packageTotal:0,
      packageUsed:0,
      subject:'Eesti keel',
      grade:hasUserRole(profile,'parent')?'Täiskasvanu':'',
      group:'',
      registrationSource:hasUserRole(profile,'parent')?'parent-as-student':'self-service',
      profileStatus:'new',
      contactStatus:'new',
      contactOwner:'',
      contactLastAt:'',
      contactNotes:'',
      createdAt:today()
    });
  }

  async function ensureParentStudentRecords(authUser, profile){
    if(!authUser || !hasUserRole(profile,'parent')) return;
    const db = window._db;
    const linkedNames = parseLinkedNames(profile.childName);
    if(linkedNames.length===0) return;

    const parentDisplayName = profile.displayName || authUser.displayName || profile.email || authUser.email || 'Lapsevanem';
    const parentEmail = profile.email || authUser.email || '';
    const preferredTeacher = canonicalTeacherName(profile.preferredTeacher || 'Pavel');
    const preferredTeacherUid = await teacherUidFromDirectory(preferredTeacher);
    const [existingSnap,existingArraySnap] = await Promise.all([
      db.collection('students').where('linkedParentId','==',authUser.uid).get(),
      db.collection('students').where('linkedParentIds','array-contains',authUser.uid).get()
    ]);
    const existingDocs = new Map([...existingSnap.docs,...existingArraySnap.docs].map(doc=>[doc.id,doc]));
    const existingProfiles = new Set([...existingDocs.values()].map(doc => studentProfileKey({
      ...doc.data(),
      parentEmail,
      parentName:parentDisplayName,
      teacher:doc.data().teacher || preferredTeacher
    })));

    for(const childName of linkedNames){
      const label = childName
        .split(' ')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      const candidateProfile = studentProfileKey({
        name:label || 'Õpilane',
        parentName:parentDisplayName,
        parentEmail,
        subject:'Eesti keel',
        teacher:preferredTeacher
      });
      if(existingProfiles.has(candidateProfile)) continue;

      await db.collection('students').add({
        linkedParentId: authUser.uid,
        linkedParentIds:[authUser.uid],
        parentName: parentDisplayName,
        parentEmail,
        name: label || 'Õpilane',
        email:'',
        phone:'',
        level:'A1',
        targetLevel:'A2',
        teacher:preferredTeacher,
        teacherUid:preferredTeacherUid,
        active:true,
        packageTotal:0,
        packageUsed:0,
        subject:'Eesti keel',
        grade:'',
        group:'',
        registrationSource:'parent-self-service',
        profileStatus:'new',
        contactStatus:'new',
        contactOwner:preferredTeacher,
        contactLastAt:'',
        contactNotes:'Loodud lapsevanema konto registreerimisel',
        createdAt:today()
      });
    }
  }

  window.HaldusShared = {
    APP_VERSION,
    LEVELS,
    TEACHERS,
    SUBJECTS,
    GRADES,
    LESSON_DURATIONS,
    PAYMENT_METHODS,
    PAYMENT_DETAILS,
    CONTACT_STATUSES,
    DAYS_SHORT,
    DAYS_ID,
    DAYS_FULL,
    TIMES,
    normalizeText,
    studentIdentityKey,
    studentProfileKey,
    resolveStudentRecord,
    lessonJournalErrorGuidance,
    parseLinkedNames,
    canonicalTeacherName,
    canonicalTeacherKey,
    teacherUidFromDirectory,
    levelPct,
    avg,
    fmtDate,
    toLocalISODate,
    today,
    pkgLeft,
    copyText,
    getAuthHeaders,
    authFetch,
    getUserRoles,
    hasUserRole,
    withUserRoles,
    ensureStudentRecord,
    ensureParentStudentRecords
  };
})();
