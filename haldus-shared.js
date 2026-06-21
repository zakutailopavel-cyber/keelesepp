(function(){
  const TEACHER_CODE = 'KS2026';
  const ADMIN_CODE   = 'KSADMIN2026';
  const APP_VERSION  = 'CRM 2026-06-21 18:05';
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
    company:'E&P Kooitus OÜ',
    regCode:'17270880',
    address:'Harju maakond, Saue vald, Laagri alevik, Nõlvaku põik 3b, 76401',
    iban:'EE917700771011885682',
    bank:'LHV Pank AS',
    swift:'LHVBEE22',
    paymentTermDays:5,
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
  const TIMES = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

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
  const pkgLeft = s => (s.packageTotal||0)-(s.packageUsed||0);
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

  async function ensureStudentRecord(authUser, profile){
    if(!authUser || profile?.role!=='student') return;
    const db = window._db;
    const name = profile.displayName || authUser.displayName || authUser.email || 'Õpilane';
    const email = profile.email || authUser.email || '';
    const existing = await db.collection('students').where('linkedUserId','==',authUser.uid).limit(1).get();
    if(!existing.empty) return;
    await db.collection('students').add({
      linkedUserId: authUser.uid,
      name,
      email,
      phone:'',
      level:'A1',
      targetLevel:'A2',
      teacher:'',
      active:true,
      packageTotal:0,
      packageUsed:0,
      subject:'Eesti keel',
      grade:'',
      group:'',
      registrationSource:'self-service',
      profileStatus:'new',
      contactStatus:'new',
      contactOwner:'',
      contactLastAt:'',
      contactNotes:'',
      createdAt:today()
    });
  }

  async function ensureParentStudentRecords(authUser, profile){
    if(!authUser || profile?.role!=='parent') return;
    const db = window._db;
    const linkedNames = parseLinkedNames(profile.childName);
    if(linkedNames.length===0) return;

    const parentDisplayName = profile.displayName || authUser.displayName || profile.email || authUser.email || 'Lapsevanem';
    const parentEmail = profile.email || authUser.email || '';
    const preferredTeacher = canonicalTeacherName(profile.preferredTeacher || 'Pavel');
    const existingSnap = await db.collection('students').where('linkedParentId','==',authUser.uid).get();
    const existingProfiles = new Set(existingSnap.docs.map(doc => studentProfileKey({
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
        parentName: parentDisplayName,
        parentEmail,
        name: label || 'Õpilane',
        email:'',
        phone:'',
        level:'A1',
        targetLevel:'A2',
        teacher:preferredTeacher,
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
    TEACHER_CODE,
    ADMIN_CODE,
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
    parseLinkedNames,
    canonicalTeacherName,
    levelPct,
    avg,
    fmtDate,
    toLocalISODate,
    today,
    pkgLeft,
    copyText,
    ensureStudentRecord,
    ensureParentStudentRecords
  };
})();
