(function(){
  const {
    cleanText,
    escapeHtml,
    getRoles,
    isStaff,
    buildScene,
    buildSceneHistoryEntry,
    normalizeActionUrl,
    sceneAcceptsResponse,
    isUnsafeDisplaySurface,
    classroomLink,
    responseLabel,
    isPresenceFresh,
    classroomErrorMessage
  }=window.LiveClassroomCore;

  if(!firebase.apps.length){
    firebase.initializeApp({
      apiKey:"AIzaSyAp8emBOh1fIqv72k_O5hkLkXVkfBt1al4",
      authDomain:"keelesepp-5136b.firebaseapp.com",
      projectId:"keelesepp-5136b",
      storageBucket:"keelesepp-5136b.firebasestorage.app",
      messagingSenderId:"674098517935",
      appId:"1:674098517935:web:e73d04a4ada67874da015a"
    });
  }

  const auth=firebase.auth();
  const db=firebase.firestore();
  const app=document.getElementById('app');
  const serverTimestamp=()=>firebase.firestore.FieldValue.serverTimestamp();
  const state={
    authUser:null,
    profile:null,
    students:[],
    rooms:[],
    room:null,
    roomUnsub:null,
    responseUnsub:null,
    signalUnsub:null,
    presenceUnsub:null,
    presenceTimer:null,
    presenceTicker:null,
    presenceRef:null,
    presenceWrite:null,
    presence:[],
    responses:[],
    sceneMode:'message',
    selectedChoice:'',
    lastSceneVersion:0,
    submitting:false,
    peer:null,
    screenStream:null,
    shareId:'',
    processedSignals:new Set(),
    pendingCandidates:[],
    connectionStatus:''
  };

  const isAdmin=()=>getRoles(state.profile).includes('admin')||String(state.profile?.email||'').toLowerCase()==='zakutailo.pavel@gmail.com';
  const isRoomHost=()=>Boolean(state.room)&&(isAdmin()||(isStaff(state.profile)&&state.room.teacherUid===state.authUser?.uid));
  const teacherName=()=>state.profile?.displayName||state.authUser?.displayName||state.authUser?.email||'Õpetaja';
  const statusMeta=status=>({
    waiting:{label:'Ooteruum',className:'waiting'},
    live:{label:'Tund käib',className:'live'},
    ended:{label:'Lõpetatud',className:'ended'}
  }[status]||{label:'Ooteruum',className:'waiting'});
  const formatDate=value=>{
    if(!value) return '—';
    const date=value?.toDate?value.toDate():new Date(value);
    return Number.isNaN(date.getTime())?'—':date.toLocaleString('et-EE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  };
  const setNotice=(message,type='ok')=>{
    const target=document.getElementById('notice');
    if(!target) return;
    target.className=`notice ${type}`;
    target.textContent=message;
    target.hidden=false;
    window.clearTimeout(target._timer);
    target._timer=window.setTimeout(()=>{target.hidden=true;},4200);
  };
  const roomIdFromUrl=()=>new URLSearchParams(location.search).get('room')||'';
  const setRoomUrl=roomId=>{
    const url=roomId?`/live-classroom/?room=${encodeURIComponent(roomId)}`:'/live-classroom/';
    history.pushState({},'',url);
  };
  async function commitRoomScene(sceneInput,changesForRoom={}){
    if(!state.room?.id) throw new Error('Klassiruumi ei leitud.');
    const ref=db.collection('liveClassrooms').doc(state.room.id);
    return db.runTransaction(async transaction=>{
      const snapshot=await transaction.get(ref);
      if(!snapshot.exists) throw new Error('Klassiruumi ei leitud.');
      const room=snapshot.data();
      if(room.status==='ended'&&!sceneInput.allowEnded) throw new Error('Lõpetatud tunnis ei saa uut õppestseeni avaldada.');
      const nextVersion=(Number(room.sceneVersion)||0)+1;
      const {allowEnded,historyEvent='scene_published',...publicSceneInput}=sceneInput;
      const scene=buildScene({...publicSceneInput,version:nextVersion});
      const createdAtIso=new Date().toISOString();
      const history=buildSceneHistoryEntry({
        classroomId:ref.id,
        room,
        scene,
        eventType:historyEvent,
        createdAtIso
      });
      const extra=typeof changesForRoom==='function'
        ?changesForRoom(room,scene,nextVersion)
        :changesForRoom;
      const normalizedExtra={...(extra||{})};
      if(scene.type!=='screen'&&!('screenShare' in normalizedExtra)){
        normalizedExtra.screenShare={status:'idle',shareId:''};
      }
      transaction.update(ref,{
        activeScene:scene,
        sceneVersion:nextVersion,
        updatedAt:serverTimestamp(),
        ...normalizedExtra
      });
      transaction.set(ref.collection('scenes').doc(`scene-${nextVersion}`),{
        ...history,
        createdAt:serverTimestamp()
      });
      return{room,scene,nextVersion};
    });
  }

  function cleanupRoom(){
    stopPresence(true);
    state.roomUnsub?.();
    state.responseUnsub?.();
    state.signalUnsub?.();
    state.roomUnsub=null;
    state.responseUnsub=null;
    state.signalUnsub=null;
    stopPeer(true);
    state.room=null;
    state.responses=[];
    state.presence=[];
    state.lastSceneVersion=0;
    state.processedSignals.clear();
  }

  function authRequired(){
    app.className='';
    app.innerHTML=`
      <header class="topbar"><div class="brand">Keele<span>Sepp</span> Classroom</div></header>
      <main class="shell">
        <section class="card panel" style="max-width:620px;margin:80px auto;text-align:center">
          <h1>Logi kõigepealt sisse</h1>
          <p class="subtitle" style="margin:12px auto 22px">Live Classroom kasutab sama kontot nagu KeeleSepp CRM.</p>
          <a class="btn btn-primary" href="/haldus/">Ava KeeleSepp CRM</a>
        </section>
      </main>`;
  }

  function accessError(error){
    const message=classroomErrorMessage(error);
    const roomId=roomIdFromUrl();
    app.className='';
    app.innerHTML=`
      <header class="topbar"><div class="brand">Keele<span>Sepp</span> Classroom</div></header>
      <main class="shell">
        <section class="card panel" style="max-width:700px;margin:70px auto">
          <h1>Ruumi ei saanud avada</h1>
          <p class="subtitle">${escapeHtml(message)}</p>
          <div class="actions">
            ${roomId?'<button id="retry-room" class="btn btn-primary">Proovi uuesti</button>':''}
            <a class="btn" href="/live-classroom/">Tagasi klassiruumi</a>
            <a class="btn" href="/haldus/">CRM</a>
          </div>
        </section>
      </main>`;
    document.getElementById('retry-room')?.addEventListener('click',()=>openRoom(roomId,false));
  }

  async function loadProfile(user){
    const snap=await db.collection('users').doc(user.uid).get();
    return {uid:user.uid,email:user.email,displayName:user.displayName||user.email,...(snap.exists?snap.data():{})};
  }

  async function loadStudents(){
    if(isStaff(state.profile)){
      const snap=await db.collection('students').get();
      state.students=snap.docs.map(doc=>({id:doc.id,...doc.data()})).filter(student=>student.active!==false);
      return;
    }
    const fields=['linkedUserId','studentUid','linkedParentId','parentUid','guardianUid'];
    const results=await Promise.allSettled(fields.map(field=>db.collection('students').where(field,'==',state.authUser.uid).get()));
    const byId=new Map();
    results.forEach(result=>{
      if(result.status!=='fulfilled') return;
      result.value.docs.forEach(doc=>byId.set(doc.id,{id:doc.id,...doc.data()}));
    });
    state.students=Array.from(byId.values()).filter(student=>student.active!==false);
  }

  async function loadRooms(){
    const byId=new Map();
    if(isStaff(state.profile)){
      const snap=isAdmin()
        ? await db.collection('liveClassrooms').get()
        : await db.collection('liveClassrooms').where('teacherUid','==',state.authUser.uid).get();
      snap.docs.forEach(doc=>byId.set(doc.id,{id:doc.id,...doc.data()}));
    }else{
      const results=await Promise.allSettled(state.students.map(student=>
        db.collection('liveClassrooms').where('studentId','==',student.id).get()
      ));
      results.forEach(result=>{
        if(result.status!=='fulfilled') return;
        result.value.docs.forEach(doc=>byId.set(doc.id,{id:doc.id,...doc.data()}));
      });
    }
    state.rooms=Array.from(byId.values()).sort((a,b)=>{
      const aTime=a.createdAt?.toMillis?.()||Date.parse(a.createdAt||0)||0;
      const bTime=b.createdAt?.toMillis?.()||Date.parse(b.createdAt||0)||0;
      return bTime-aTime;
    });
  }

  function topbar(){
    return `
      <header class="topbar">
        <div class="brand">Keele<span>Sepp</span> Classroom</div>
        <div class="topbar-actions">
          <span class="label">${escapeHtml(teacherName())}</span>
          <a class="btn" href="/haldus/">CRM</a>
        </div>
      </header>`;
  }

  function roomRows(){
    if(!state.rooms.length) return `<div class="empty">Klassiruume pole veel loodud.</div>`;
    return state.rooms.map(room=>{
      const meta=statusMeta(room.status);
      return `
        <div class="room-row">
          <div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <strong>${escapeHtml(room.title||'KeeleSepp tund')}</strong>
              <span class="badge ${meta.className}">${meta.label}</span>
            </div>
            <div class="room-meta">${escapeHtml(room.studentName||'Õpilane')} · ${escapeHtml(room.teacherName||'Õpetaja')} · ${escapeHtml(formatDate(room.createdAt))}</div>
          </div>
          <button class="btn btn-primary open-room" data-room="${escapeHtml(room.id)}">${room.status==='ended'?'Vaata':'Ava ruum'}</button>
        </div>`;
    }).join('');
  }

  function renderLobby(){
    cleanupRoom();
    app.className='';
    const staff=isStaff(state.profile);
    const studentOptions=state.students
      .slice()
      .sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'et'))
      .map(student=>`<option value="${escapeHtml(student.id)}">${escapeHtml(student.name||'Nimi puudub')} · ${escapeHtml(student.level||'—')} · ${escapeHtml(student.teacher||'')}</option>`)
      .join('');
    app.innerHTML=`
      ${topbar()}
      <main class="shell">
        <div id="notice" hidden></div>
        <div class="hero">
          <div><h1>Live Classroom</h1><p class="subtitle">Õpetaja juhib privaatset töölauda. Õpilane näeb ainult avaldatud õppestseeni.</p></div>
          <button id="refresh-rooms" class="btn">Värskenda</button>
        </div>
        <div class="lobby-grid">
          ${staff?`
            <section class="card panel">
              <div class="eyebrow">Uus turvaline ruum</div>
              <h2 style="margin:6px 0 16px">Alusta tundi</h2>
              <form id="create-room" class="form-grid">
                <div class="field span-2"><label>Õpilane</label><select id="room-student" required><option value="">Vali õpilane</option>${studentOptions}</select></div>
                <div class="field span-2"><label>Tunni pealkiri</label><input id="room-title" maxlength="160" value="KeeleSepp tund"></div>
                <div class="safety span-2"><strong>Privaatsus:</strong> tavalises režiimis ei jagata õpetaja ekraani. Õpilane näeb ainult seda, mille õpetaja eraldi lavale avaldab.</div>
                <button class="btn btn-primary span-2" type="submit">Loo klassiruum</button>
              </form>
            </section>
          `:`
            <section class="card panel">
              <div class="eyebrow">Õpilase vaade</div>
              <h2 style="margin:6px 0 12px">Sinu tunnid</h2>
              <p class="subtitle">Kui õpetaja loob ruumi, ilmub see siia. Ava ainult oma nimega klassiruum.</p>
            </section>
          `}
          <section class="card panel">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
              <div><div class="eyebrow">Klassiruumid</div><h2 style="margin-top:6px">${staff?'Minu ruumid':'Aktiivsed ruumid'}</h2></div>
              <span class="badge">${state.rooms.length}</span>
            </div>
            <div class="room-list">${roomRows()}</div>
          </section>
        </div>
      </main>`;
    document.querySelectorAll('.open-room').forEach(button=>button.addEventListener('click',()=>openRoom(button.dataset.room,true)));
    document.getElementById('refresh-rooms')?.addEventListener('click',async()=>{
      await loadRooms();
      renderLobby();
    });
    document.getElementById('create-room')?.addEventListener('submit',createRoom);
  }

  async function createRoom(event){
    event.preventDefault();
    const studentId=document.getElementById('room-student').value;
    const student=state.students.find(item=>item.id===studentId);
    if(!student){setNotice('Vali õpilane.','error');return;}
    const title=cleanText(document.getElementById('room-title').value,160)||'KeeleSepp tund';
    const ref=db.collection('liveClassrooms').doc();
    const now=new Date().toISOString();
    const scene=buildScene({
      type:'welcome',
      title:'Tere tulemast tundi!',
      body:'Õpetaja valmistab õppestseeni ette.',
      version:1
    });
    await ref.set({
      title,
      studentId:student.id,
      studentName:student.name||'Õpilane',
      teacherUid:state.authUser.uid,
      teacherName:teacherName(),
      status:'waiting',
      sceneVersion:1,
      activeScene:scene,
      screenShare:{status:'idle',shareId:''},
      accessVersion:1,
      createdAt:serverTimestamp(),
      createdAtIso:now,
      updatedAt:serverTimestamp()
    });
    await openRoom(ref.id,true);
  }

  function presenceRole(){
    return isRoomHost()?'teacher':'student';
  }

  function presenceName(role){
    if(role==='teacher') return teacherName();
    return state.profile?.displayName||state.room?.studentName||state.authUser?.email||'Õpilane';
  }

  function writePresence(online=true){
    if(!state.presenceRef||!state.room||state.room.status==='ended') return Promise.resolve();
    const ref=state.presenceRef;
    const now=new Date().toISOString();
    const role=presenceRole();
    const write=ref.set({
      classroomId:state.room.id,
      uid:state.authUser.uid,
      role,
      displayName:cleanText(presenceName(role),160),
      online:Boolean(online),
      lastSeen:serverTimestamp(),
      lastSeenIso:now
    },{merge:true}).catch(error=>console.warn('Classroom presence unavailable',error));
    state.presenceWrite=write;
    return write;
  }

  function stopPresence(markOffline=false){
    window.clearInterval(state.presenceTimer);
    window.clearInterval(state.presenceTicker);
    state.presenceTimer=null;
    state.presenceTicker=null;
    state.presenceUnsub?.();
    state.presenceUnsub=null;
    const ref=state.presenceRef;
    const pending=state.presenceWrite;
    state.presenceRef=null;
    state.presenceWrite=null;
    if(markOffline&&ref&&state.authUser){
      return Promise.resolve(pending).then(()=>ref.set({
          online:false,
          lastSeen:serverTimestamp(),
          lastSeenIso:new Date().toISOString()
        },{merge:true}).catch(()=>{}));
    }
    return Promise.resolve();
  }

  function startPresence(roomRef){
    if(state.presenceRef||!state.room||state.room.status==='ended') return;
    const collection=roomRef.collection('presence');
    state.presenceRef=collection.doc(state.authUser.uid);
    state.presenceUnsub=collection.onSnapshot(snapshot=>{
      state.presence=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
      updatePresenceUi();
    },error=>console.warn('Classroom presence unavailable',error));
    writePresence(true);
    state.presenceTimer=window.setInterval(()=>writePresence(true),25000);
    state.presenceTicker=window.setInterval(updatePresenceUi,10000);
  }

  function counterpartPresence(){
    const counterpartRole=isRoomHost()?'student':'teacher';
    return state.presence.find(item=>item.role===counterpartRole);
  }

  function updatePresenceUi(){
    if(!state.room) return;
    const host=isRoomHost();
    const presence=counterpartPresence();
    const online=isPresenceFresh(presence);
    const label=host
      ? (online?'Õpilane on tunnis':'Õpilane pole veel liitunud')
      : (online?'Õpetaja on tunnis':'Õpetaja pole praegu ühendatud');
    ['participant-presence','student-presence'].forEach(id=>{
      const target=document.getElementById(id);
      if(!target) return;
      target.className=`presence-pill ${online?'online':'offline'}`;
      target.innerHTML=`<span class="presence-dot" aria-hidden="true"></span><span>${escapeHtml(label)}</span>`;
    });
  }

  async function openRoom(roomId,pushUrl=false){
    cleanupRoom();
    if(pushUrl) setRoomUrl(roomId);
    app.className='';
    app.innerHTML=`${topbar()}<main class="loading-shell"><div class="spinner"></div><div>Klassiruum avaneb…</div></main>`;
    const ref=db.collection('liveClassrooms').doc(roomId);
    try{
      const first=await ref.get();
      if(!first.exists){accessError('Klassiruumi ei leitud.');return;}
      state.room={id:first.id,...first.data()};
      state.lastSceneVersion=Number(state.room.sceneVersion)||0;
      startPresence(ref);
    }catch(error){
      accessError(error);
      return;
    }
    state.roomUnsub=ref.onSnapshot(snapshot=>{
      if(!snapshot.exists){accessError('Klassiruumi ei leitud.');return;}
      const nextRoom={id:snapshot.id,...snapshot.data()};
      const nextVersion=Number(nextRoom.sceneVersion)||0;
      if(state.lastSceneVersion&&nextVersion!==state.lastSceneVersion) state.selectedChoice='';
      if(state.room?.activeScene?.type==='screen'&&nextRoom.activeScene?.type!=='screen') stopPeer(true);
      state.lastSceneVersion=nextVersion;
      state.room=nextRoom;
      renderRoom();
      if(state.room.status==='ended') stopPresence(false);
      else startPresence(ref);
    },error=>accessError(error));
    state.responseUnsub=ref.collection('responses').onSnapshot(snapshot=>{
      state.responses=snapshot.docs.map(doc=>({id:doc.id,...doc.data()})).sort((a,b)=>String(b.createdAtIso||'').localeCompare(String(a.createdAtIso||'')));
      renderResponseArea();
      updateStudentSubmissionState();
    });
    listenSignals(ref);
  }

  function teacherControls(){
    const room=state.room;
    const mode=state.sceneMode;
    const current=room.activeScene||{};
    return `
      <aside class="private-desk">
        <section class="card desk-section">
          <div class="private-label">🔒 Privaatne õpetaja töölaud — õpilane seda osa ei näe</div>
          <div class="student-summary">
            <div><strong>${escapeHtml(room.studentName||'Õpilane')}</strong><div class="room-meta">${escapeHtml(room.title||'KeeleSepp tund')}</div></div>
            <div id="student-presence" class="presence-pill offline" role="status" aria-live="polite"><span class="presence-dot" aria-hidden="true"></span><span>Õpilane pole veel liitunud</span></div>
          </div>
          <div class="actions">
            <button id="copy-room-link" class="btn">Kopeeri õpilase link</button>
            <button id="back-lobby" class="btn">Kõik ruumid</button>
          </div>
        </section>
        <section class="card desk-section">
          <h3>Avalda õppestseen</h3>
          <div class="scene-tabs">
            <button class="scene-tab ${mode==='message'?'active':''}" data-mode="message">Juhis</button>
            <button class="scene-tab ${mode==='choice'?'active':''}" data-mode="choice">Valik</button>
            <button class="scene-tab ${mode==='short_answer'?'active':''}" data-mode="short_answer">Vastus</button>
          </div>
          <div class="field"><label>Pealkiri</label><input id="scene-title" maxlength="160" value="${escapeHtml(mode===current.type?current.title:'')}"></div>
          <div class="field" style="margin-top:10px"><label>Juhis või küsimus</label><textarea id="scene-body" maxlength="4000">${escapeHtml(mode===current.type?current.body:'')}</textarea></div>
          ${mode==='choice'?`<div class="field" style="margin-top:10px"><label>Vastusevariandid — üks real</label><textarea id="scene-options" placeholder="Variant A&#10;Variant B">${escapeHtml((mode===current.type?current.options||[]:[]).join('\n'))}</textarea></div>`:''}
          <button id="publish-scene" class="btn btn-primary" style="width:100%;margin-top:12px" ${room.status==='ended'?'disabled':''}>Avalda õpilase lavale</button>
        </section>
        <section class="card desk-section">
          <h3>Ekraani jagamine</h3>
          <div class="safety"><strong>Vali brauseri aknas ainult üks vahekaart või rakenduse aken.</strong> Ära vali „Entire screen“, sest seal võivad olla e-post, paroolid või teiste õpilaste andmed.</div>
          <div class="actions">
            <button id="start-screen" class="btn btn-amber" ${state.screenStream||room.status==='ended'?'disabled':''}>Jaga valitud akent</button>
            <button id="stop-screen" class="btn btn-danger" ${state.screenStream?'':'disabled'}>Lõpeta jagamine</button>
          </div>
          <div id="connection-status" class="room-meta">${escapeHtml(state.connectionStatus||'Ekraani ei jagata.')}</div>
        </section>
        <section class="card desk-section">
          <h3>Õpilase vastused</h3>
          <div id="teacher-responses" class="response-list"></div>
        </section>
        <section class="card desk-section">
          <button id="end-room" class="btn btn-danger" style="width:100%">${room.status==='ended'?'Tund on lõpetatud':'Lõpeta tund'}</button>
        </section>
      </aside>`;
  }

  function sceneHtml(scene,{student=false}={}){
    const type=scene?.type||'welcome';
    if(type==='screen'){
      return `
        <div class="scene-content" style="width:100%">
          <h2>${escapeHtml(scene.title||'Õpetaja jagab ekraani')}</h2>
          <p class="scene-body">${escapeHtml(scene.body||'Ühenduse loomine…')}</p>
          <video id="screen-video" class="screen-video" autoplay playsinline muted="${student?'':'muted'}"></video>
          <div id="screen-placeholder" class="screen-placeholder">Turvalise videovoo ühendamine…</div>
        </div>`;
    }
    const title=scene?.title||'Tere tulemast tundi!';
    const body=scene?.body||'Õpetaja valmistab õppestseeni ette.';
    const interactive=sceneAcceptsResponse(scene);
    const actionUrl=normalizeActionUrl(scene?.actionUrl);
    const action=actionUrl&&student
      ?`<div class="student-actions"><a class="btn btn-amber" href="${escapeHtml(actionUrl)}" target="_blank" rel="noopener">Ava täisülesanne</a></div>`
      :'';
    const options=(scene?.options||[]).map((option,index)=>`
      <button class="choice" data-choice="${escapeHtml(option)}" ${student?'':'disabled'}><span>${String.fromCharCode(65+index)}.</span> ${escapeHtml(option)}</button>
    `).join('');
    if(interactive){
      return `
        <div class="task-overlay">
          <section class="task-dialog" role="dialog" aria-modal="${student?'true':'false'}" aria-labelledby="task-title">
            <div class="task-kicker">${type==='choice'?'Valikvastusega ülesanne':'Kirjalik vastus'}</div>
            <h2 id="task-title">${escapeHtml(title)}</h2>
            <div class="scene-body">${escapeHtml(body)}</div>
            ${type==='choice'?`<div class="choice-grid">${options}</div>`:''}
            ${student&&type==='choice'?`<div class="student-actions"><button id="submit-choice" class="btn btn-primary" disabled>Saada vastus</button></div>`:''}
            ${type==='short_answer'?`
              <div class="answer-box">
                <textarea id="${student?'student-answer':'answer-preview'}" maxlength="1600" placeholder="${student?'Kirjuta vastus siia…':'Õpilane kirjutab vastuse siia…'}" ${student?'':'disabled'}></textarea>
                ${student?'<div class="student-actions"><button id="submit-short" class="btn btn-primary">Saada vastus</button></div>':''}
              </div>`:''}
            ${action}
            ${student
              ? `<div id="submitted-note" class="notice ok task-success" hidden>Vastus on õpetajale saadetud.</div>`
              : `<div class="task-preview-note">Eelvaade — õpilane saab vastata oma ekraanil.</div>`}
          </section>
        </div>`;
    }
    return `
      <div class="scene-content">
        <div class="eyebrow">KeeleSepp Live</div>
        <h2 style="margin-top:8px">${escapeHtml(title)}</h2>
        <div class="scene-body">${escapeHtml(body)}</div>
        ${action}
      </div>`;
  }

  function stageCard(student=false){
    const room=state.room;
    const meta=statusMeta(room.status);
    const interactive=sceneAcceptsResponse(room.activeScene);
    const version=Number(room.sceneVersion)||1;
    const responseCount=state.responses.filter(response=>response.sceneVersion===version).length;
    return `
      <section class="card stage-wrap">
        <div class="stage-head">
          <div><strong>${escapeHtml(room.title||'KeeleSepp tund')}</strong><div class="room-meta">${student?'Õpilase avalik lava':'Õpilase lava eelvaade'}</div></div>
          <div class="stage-status">
            <div id="participant-presence" class="presence-pill offline" role="status" aria-live="polite"><span class="presence-dot" aria-hidden="true"></span><span>${student?'Õpetaja pole praegu ühendatud':'Õpilane pole veel liitunud'}</span></div>
            ${!student&&interactive?`<span id="stage-response-status" class="response-status ${responseCount?'received':'waiting'}" role="status" aria-live="polite">${responseCount?'Vastus saabus':'Ootan vastust'}</span>`:''}
            <span class="badge ${meta.className}">${meta.label}</span>
          </div>
        </div>
        <div class="stage">${sceneHtml(room.activeScene,{student})}</div>
      </section>`;
  }

  function renderRoom(){
    const staff=isStaff(state.profile);
    const host=isRoomHost();
    app.className=host?'':'student-room';
    app.innerHTML=`
      ${topbar()}
      <main class="shell">
        <div id="notice" hidden></div>
        ${host
          ? `<div class="studio">${teacherControls()}${stageCard(false)}</div>`
          : `<div class="hero"><div><h1>${escapeHtml(state.room.title||'KeeleSepp tund')}</h1><p class="subtitle">${escapeHtml(state.room.teacherName||'Õpetaja')} · ${escapeHtml(state.room.studentName||'Õpilane')}</p></div><button id="back-lobby" class="btn">Minu ruumid</button></div>${stageCard(!staff)}`
        }
      </main>`;
    if(host) bindTeacherControls();
    else if(!staff) bindStudentControls();
    else document.getElementById('back-lobby')?.addEventListener('click',backToLobby);
    renderResponseArea();
    updatePresenceUi();
    if(state.room.activeScene?.type==='screen'){
      if(host&&state.screenStream) attachLocalScreen();
      if(!staff) connectStudentToScreen();
    }
  }

  function bindTeacherControls(){
    document.querySelectorAll('.scene-tab').forEach(button=>button.addEventListener('click',()=>{
      state.sceneMode=button.dataset.mode;
      renderRoom();
    }));
    document.getElementById('publish-scene')?.addEventListener('click',publishScene);
    document.getElementById('copy-room-link')?.addEventListener('click',copyRoomLink);
    document.getElementById('back-lobby')?.addEventListener('click',backToLobby);
    document.getElementById('start-screen')?.addEventListener('click',startScreenShare);
    document.getElementById('stop-screen')?.addEventListener('click',()=>stopScreenShare(true));
    document.getElementById('end-room')?.addEventListener('click',endRoom);
  }

  function bindStudentControls(){
    document.getElementById('back-lobby')?.addEventListener('click',backToLobby);
    document.querySelectorAll('.choice').forEach(button=>button.addEventListener('click',()=>{
      state.selectedChoice=button.dataset.choice;
      document.querySelectorAll('.choice').forEach(choice=>choice.classList.toggle('selected',choice===button));
      const submit=document.getElementById('submit-choice');
      if(submit) submit.disabled=false;
    }));
    document.getElementById('submit-choice')?.addEventListener('click',()=>submitResponse(state.selectedChoice));
    document.getElementById('submit-short')?.addEventListener('click',()=>submitResponse(document.getElementById('student-answer')?.value));
    updateStudentSubmissionState();
  }

  async function publishScene(){
    if(state.room?.status==='ended'){
      setNotice('Lõpetatud tunnis ei saa uut õppestseeni avaldada.','error');
      return;
    }
    try{
      await commitRoomScene({
        type:state.sceneMode,
        title:document.getElementById('scene-title')?.value,
        body:document.getElementById('scene-body')?.value,
        options:document.getElementById('scene-options')?.value
      },room=>({
        status:'live',
        startedAt:room.startedAt||serverTimestamp()
      }));
      setNotice('Õppestseen avaldati õpilasele.');
    }catch(error){
      setNotice(error.message||'Stseeni ei saanud avaldada.','error');
    }
  }

  async function copyRoomLink(){
    const link=classroomLink(location.origin,state.room.id);
    try{
      await navigator.clipboard.writeText(link);
      setNotice('Õpilase link kopeeriti.');
    }catch(error){
      window.prompt('Kopeeri õpilase link',link);
    }
  }

  function backToLobby(){
    setRoomUrl('');
    loadRooms().then(renderLobby).catch(error=>accessError(error.message));
  }

  async function endRoom(){
    if(state.room.status==='ended') return;
    if(!window.confirm('Kas lõpetada see tund? Õpilase lava suletakse.')) return;
    await stopScreenShare(false);
    await stopPresence(true);
    await commitRoomScene({
      type:'welcome',
      title:'Tund on lõpetatud',
      body:'Aitäh osalemast! Vastused on õpetajale salvestatud.',
      allowEnded:true,
      historyEvent:'lesson_ended'
    },{
      status:'ended',
      screenShare:{status:'idle',shareId:''},
      endedAt:serverTimestamp()
    });
  }

  async function submitResponse(answer){
    if(state.submitting||state.room.status==='ended') return;
    const cleanAnswer=cleanText(answer,1600);
    if(!cleanAnswer){setNotice('Lisa enne saatmist vastus.','error');return;}
    const student=state.students.find(item=>item.id===state.room.studentId);
    if(!student){setNotice('Õpilase seost ei leitud.','error');return;}
    const version=Number(state.room.sceneVersion)||Number(state.room.activeScene?.version)||1;
    const responseId=`scene-${version}-${state.authUser.uid}`;
    state.submitting=true;
    try{
      await db.collection('liveClassrooms').doc(state.room.id).collection('responses').doc(responseId).set({
        classroomId:state.room.id,
        sceneVersion:version,
        sceneType:state.room.activeScene?.type||'message',
        studentId:student.id,
        studentName:student.name||state.room.studentName||'Õpilane',
        studentUid:state.authUser.uid,
        answer:cleanAnswer,
        createdAt:serverTimestamp(),
        createdAtIso:new Date().toISOString()
      });
      setNotice('Vastus saadeti õpetajale.');
    }catch(error){
      setNotice(error.code==='permission-denied'?'Seda vastust ei saa saata. Kontrolli õpilase seost.':error.message,'error');
    }finally{
      state.submitting=false;
    }
  }

  function currentResponse(){
    const version=Number(state.room?.sceneVersion)||Number(state.room?.activeScene?.version)||1;
    return state.responses.find(response=>response.sceneVersion===version&&response.studentUid===state.authUser?.uid);
  }

  function updateStudentSubmissionState(){
    if(isStaff(state.profile)||!state.room) return;
    const response=currentResponse();
    const note=document.getElementById('submitted-note');
    if(note) note.hidden=!response;
    ['submit-choice','submit-short'].forEach(id=>{
      const button=document.getElementById(id);
      if(button&&response){button.disabled=true;button.textContent='Vastus saadetud';}
    });
    document.querySelectorAll('.choice').forEach(choice=>{if(response) choice.disabled=true;});
    const answer=document.getElementById('student-answer');
    if(answer&&response){answer.value=responseLabel(response);answer.disabled=true;}
  }

  function renderResponseArea(){
    const target=document.getElementById('teacher-responses');
    if(!state.room) return;
    const version=Number(state.room.sceneVersion)||1;
    const responses=state.responses.filter(response=>response.sceneVersion===version);
    const status=document.getElementById('stage-response-status');
    if(status){
      status.className=`response-status ${responses.length?'received':'waiting'}`;
      status.textContent=responses.length?'Vastus saabus':'Ootan vastust';
    }
    if(!target) return;
    target.innerHTML=responses.length
      ? responses.map(response=>`
          <div class="response">
            <strong>${escapeHtml(response.studentName||state.room.studentName||'Õpilane')}</strong>
            <div style="margin-top:4px">${escapeHtml(responseLabel(response))}</div>
            <small>${escapeHtml(formatDate(response.createdAt||response.createdAtIso))}</small>
          </div>`).join('')
      : `<div class="empty" style="padding:12px">Selle stseeni vastust pole veel saabunud.</div>`;
  }

  function makePeer(role,shareId){
    stopPeer(false);
    const peer=new RTCPeerConnection({iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]});
    state.peer=peer;
    state.shareId=shareId;
    peer.onicecandidate=event=>{
      if(!event.candidate) return;
      addSignal('candidate',event.candidate.toJSON(),role,shareId).catch(console.error);
    };
    peer.onconnectionstatechange=()=>{
      const labels={new:'Ühenduse loomine…',connecting:'Ühenduse loomine…',connected:'Ekraani jagamine on ühendatud.',disconnected:'Ühendus katkes.',failed:'Otseühendus ebaõnnestus. Proovi uuesti või kasuta õppestseeni.',closed:'Ekraani jagamine lõpetati.'};
      state.connectionStatus=labels[peer.connectionState]||peer.connectionState;
      const target=document.getElementById('connection-status');
      if(target) target.textContent=state.connectionStatus;
    };
    return peer;
  }

  async function addSignal(type,payload,senderRole,shareId){
    if(!state.room) return;
    await db.collection('liveClassrooms').doc(state.room.id).collection('signals').add({
      type,
      payload:JSON.stringify(payload),
      senderUid:state.authUser.uid,
      senderRole,
      shareId,
      createdAt:serverTimestamp(),
      createdAtIso:new Date().toISOString()
    });
  }

  function listenSignals(roomRef){
    state.signalUnsub=roomRef.collection('signals').onSnapshot(snapshot=>{
      snapshot.docChanges().forEach(change=>{
        if(change.type!=='added'||state.processedSignals.has(change.doc.id)) return;
        state.processedSignals.add(change.doc.id);
        handleSignal({id:change.doc.id,...change.doc.data()}).catch(error=>console.warn('Live signal failed',error));
      });
    },error=>console.warn('Live signals unavailable',error));
  }

  async function handleSignal(signal){
    if(!state.room||signal.senderUid===state.authUser.uid) return;
    const activeShareId=state.room.screenShare?.shareId||state.shareId;
    if(!activeShareId||signal.shareId!==activeShareId) return;
    const payload=JSON.parse(signal.payload||'{}');
    const staff=isStaff(state.profile);
    if(staff){
      if(!state.peer) return;
      if(signal.type==='answer'&&signal.senderRole==='student'&&!state.peer.currentRemoteDescription){
        await state.peer.setRemoteDescription(new RTCSessionDescription(payload));
        await flushCandidates();
      }else if(signal.type==='candidate'&&signal.senderRole==='student'){
        await addRemoteCandidate(payload);
      }
      return;
    }
    if(signal.type==='offer'&&signal.senderRole==='teacher'){
      const peer=state.peer||makePeer('student',signal.shareId);
      if(!peer.currentRemoteDescription){
        peer.ontrack=event=>{
          const video=document.getElementById('screen-video');
          if(video){
            video.srcObject=event.streams[0];
            video.muted=false;
            video.play().catch(()=>{});
          }
          document.getElementById('screen-placeholder')?.remove();
        };
        await peer.setRemoteDescription(new RTCSessionDescription(payload));
        await flushCandidates();
        const answer=await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await addSignal('answer',answer.toJSON(),'student',signal.shareId);
      }
    }else if(signal.type==='candidate'&&signal.senderRole==='teacher'){
      await addRemoteCandidate(payload);
    }
  }

  async function addRemoteCandidate(payload){
    if(!state.peer?.remoteDescription){
      state.pendingCandidates.push(payload);
      return;
    }
    try{await state.peer.addIceCandidate(new RTCIceCandidate(payload));}
    catch(error){console.warn('ICE candidate rejected',error);}
  }

  async function flushCandidates(){
    const pending=state.pendingCandidates.splice(0);
    for(const candidate of pending) await addRemoteCandidate(candidate);
  }

  async function startScreenShare(){
    if(state.room?.status==='ended'){
      setNotice('Lõpetatud tunnis ei saa ekraani jagada.','error');
      return;
    }
    if(!navigator.mediaDevices?.getDisplayMedia){
      setNotice('See brauser ei toeta ekraani jagamist.','error');
      return;
    }
    let publishedShareId='';
    try{
      const stream=await navigator.mediaDevices.getDisplayMedia({
        video:{displaySurface:'browser'},
        audio:false,
        preferCurrentTab:false,
        selfBrowserSurface:'exclude',
        surfaceSwitching:'include'
      });
      const videoTrack=stream.getVideoTracks()[0];
      if(!videoTrack){
        stream.getTracks().forEach(track=>track.stop());
        setNotice('Jagatavat akent ei leitud. Proovi uuesti.','error');
        return;
      }
      if(isUnsafeDisplaySurface(videoTrack?.getSettings?.().displaySurface)){
        stream.getTracks().forEach(track=>track.stop());
        setNotice('Kogu ekraani jagamine on privaatsuse kaitseks keelatud. Vali üks vahekaart või rakenduse aken.','error');
        return;
      }
      const shareId=crypto.randomUUID?.()||`share-${Date.now()}`;
      state.screenStream=stream;
      const peer=makePeer('teacher',shareId);
      state.screenStream=stream;
      stream.getTracks().forEach(track=>peer.addTrack(track,stream));
      videoTrack.addEventListener('ended',()=>stopScreenShare(true));
      await commitRoomScene({
        type:'screen',
        title:'Õpetaja jagab valitud akent',
        body:'Näed ainult õpetaja valitud vahekaarti või rakenduse akent.',
        historyEvent:'screen_started'
      },room=>({
        status:'live',
        startedAt:room.startedAt||serverTimestamp(),
        screenShare:{status:'active',shareId,startedAtIso:new Date().toISOString()},
      }));
      publishedShareId=shareId;
      const offer=await peer.createOffer();
      await peer.setLocalDescription(offer);
      await addSignal('offer',offer.toJSON(),'teacher',shareId);
      state.connectionStatus='Ekraani voog käivitati. Ootan õpilase ühendust…';
    }catch(error){
      stopPeer(true);
      if(publishedShareId&&state.room){
        try{
          await commitRoomScene({
            type:'welcome',
            title:'Ekraani jagamine katkestati',
            body:'Õpetaja valmistab järgmist õppestseeni ette.',
            historyEvent:'screen_stopped'
          },{
            screenShare:{status:'idle',shareId:''},
          });
        }catch(rollbackError){
          console.error('Screen share rollback failed',rollbackError);
        }
      }
      if(error.name!=='NotAllowedError') setNotice(error.message||'Ekraani jagamist ei saanud käivitada.','error');
    }
  }

  function attachLocalScreen(){
    const video=document.getElementById('screen-video');
    if(!video||!state.screenStream) return;
    video.srcObject=state.screenStream;
    video.muted=true;
    video.play().catch(()=>{});
    document.getElementById('screen-placeholder')?.remove();
  }

  function connectStudentToScreen(){
    if(state.peer||!state.room?.screenShare?.shareId) return;
    makePeer('student',state.room.screenShare.shareId);
    const existingSignals=state.processedSignals;
    existingSignals.clear();
    state.signalUnsub?.();
    listenSignals(db.collection('liveClassrooms').doc(state.room.id));
  }

  function stopPeer(stopTracks=true){
    if(stopTracks&&state.screenStream) state.screenStream.getTracks().forEach(track=>track.stop());
    state.screenStream=null;
    state.peer?.close();
    state.peer=null;
    state.pendingCandidates=[];
    state.shareId='';
  }

  async function stopScreenShare(updateRoom=true){
    stopPeer(true);
    state.connectionStatus='Ekraani jagamine lõpetati.';
    if(!updateRoom||!state.room) return;
    await commitRoomScene({
      type:'welcome',
      title:'Ekraani jagamine on lõppenud',
      body:'Õpetaja valmistab järgmist õppestseeni ette.',
      historyEvent:'screen_stopped'
    },{
      screenShare:{status:'idle',shareId:''},
    });
  }

  window.addEventListener('popstate',()=>{
    const roomId=roomIdFromUrl();
    if(roomId) openRoom(roomId,false);
    else loadRooms().then(renderLobby);
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible') writePresence(true);
  });
  window.addEventListener('beforeunload',()=>cleanupRoom());

  auth.onAuthStateChanged(async user=>{
    if(!user){authRequired();return;}
    state.authUser=user;
    try{
      state.profile=await loadProfile(user);
      await loadStudents();
      const roomId=roomIdFromUrl();
      if(roomId) await openRoom(roomId,false);
      else{
        await loadRooms();
        renderLobby();
      }
    }catch(error){
      accessError(error.message||'Live Classroom ei saanud laadida.');
    }
  });
})();
