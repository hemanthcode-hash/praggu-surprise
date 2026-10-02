const screens = [...document.querySelectorAll('.screen')];
let timers = [];
let scrollFrame = 0, scrollPaused = false, lastScrollTime = 0, scrollPosition = 0;
const letterScroll = document.querySelector('.letter-scroll');
const pauseLetter = document.getElementById('pause-letter');
function setScrollPaused(paused) {
  scrollPaused = paused;
  pauseLetter.textContent = paused ? 'Resume scrolling' : 'Pause scrolling';
  pauseLetter.setAttribute('aria-pressed', String(paused));
  scrollPosition = letterScroll.scrollTop;
}
function scrollLetter(now) {
  if (!document.getElementById('letter-invite').classList.contains('reading')) return;
  const elapsed = lastScrollTime ? Math.min(now-lastScrollTime, 80) : 0;
  lastScrollTime = now;
  if (!scrollPaused) {
    scrollPosition += elapsed * 0.014;
    letterScroll.scrollTop = scrollPosition;
    if (letterScroll.scrollTop >= letterScroll.scrollHeight-letterScroll.clientHeight-1) setScrollPaused(true);
  }
  scrollFrame = requestAnimationFrame(scrollLetter);
}
pauseLetter.addEventListener('click',()=>setScrollPaused(!scrollPaused));
['wheel','touchstart','pointerdown','keydown'].forEach(type=>letterScroll.addEventListener(type,()=>setScrollPaused(true),{passive:true}));
function show(id) {
  document.querySelectorAll("video").forEach(video=>video.pause());
  cancelAnimationFrame(scrollFrame);
  document.body.classList.remove('envelope-visible');
  screens.forEach(screen => { screen.hidden = screen.id !== id; });
  document.body.dataset.screen = id;
  window.scrollTo({top:0, behavior:'instant'});
  const heading = document.querySelector(`#${id} h2`);
  if (heading) { heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true}); }
}
function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#873750','#dba1ad','#c79c58','#eed3b3'];
  const holder = document.getElementById('confetti');
  for(let i=0;i<65;i++) {
    const piece = document.createElement('i'); piece.className='confetto';
    piece.style.cssText=`left:${Math.random()*100}%;background:${colors[i%4]};animation-duration:${4+Math.random()*4}s;animation-delay:${Math.random()*2}s;--drift:${Math.random()*240-120}px;transform:rotate(${Math.random()*180}deg)`;
    holder.append(piece); piece.addEventListener('animationend',()=>piece.remove());
  }
}
document.getElementById('entry-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.getElementById('name');
  if(input.value.trim().toLowerCase() !== 'praggu') {
    document.getElementById('error').textContent='That name doesn’t unlock the surprise. Try again ♡';
    input.setAttribute('aria-invalid','true'); input.focus(); return;
  }
  document.getElementById('error').textContent=''; input.removeAttribute('aria-invalid');
  show('wish');
  celebrate();
  timers.push(setTimeout(()=>{document.getElementById('letter-invite').hidden=false;document.body.classList.add('envelope-visible');document.getElementById('open-letter').focus({preventScroll:true});},1000));
});

let typewriterActive = false;
function startLetterTypewriter() {
  const paper = document.querySelector('.letter-paper');
  if (!paper) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setScrollPaused(false);
    timers.push(setTimeout(()=>{scrollFrame=requestAnimationFrame(scrollLetter);},1500));
    return;
  }
  if (!paper.dataset.originalHtml) {
    paper.dataset.originalHtml = paper.innerHTML;
  }
  const h2 = paper.querySelector('h2');
  const paragraphs = [...paper.querySelectorAll('p')];
  const signature = paper.querySelector('.signature');
  const items = [
    { el: h2, text: h2 ? h2.textContent : '' },
    ...paragraphs.map(p => ({ el: p, text: p.textContent })),
    { el: signature, isSignature: true }
  ];
  items.forEach(item => {
    if (item.el) {
      if (item.isSignature) item.el.style.opacity = '0';
      else item.el.textContent = '';
    }
  });
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.textContent = '|';
  let itemIdx = 0, charIdx = 0;
  typewriterActive = true;
  function finishTyping() {
    if (!typewriterActive) return;
    typewriterActive = false;
    if (cursor.parentNode) cursor.remove();
    paper.innerHTML = paper.dataset.originalHtml;
    setScrollPaused(false);
    timers.push(setTimeout(()=>{scrollFrame=requestAnimationFrame(scrollLetter);},1500));
  }
  paper.onclick = finishTyping;
  function typeChar() {
    if (!typewriterActive) return;
    if (itemIdx >= items.length) {
      finishTyping();
      return;
    }
    const cur = items[itemIdx];
    if (!cur.el) { itemIdx++; typeChar(); return; }
    if (cur.isSignature) {
      if (cursor.parentNode) cursor.remove();
      typewriterActive = false;
      paper.innerHTML = paper.dataset.originalHtml;
      const sig = paper.querySelector('.signature');
      if (sig) {
        sig.style.opacity = '0';
        sig.style.transition = 'opacity .8s ease';
        requestAnimationFrame(() => { sig.style.opacity = '1'; });
      }
      setScrollPaused(false);
      timers.push(setTimeout(()=>{scrollFrame=requestAnimationFrame(scrollLetter);},2000));
      return;
    }
    if (charIdx < cur.text.length) {
      cur.el.textContent = cur.text.substring(0, charIdx + 1);
      cur.el.appendChild(cursor);
      charIdx++;
      
      // Auto-scroll along with the writing tip
      const cRect = cursor.getBoundingClientRect();
      const sRect = letterScroll.getBoundingClientRect();
      const diff = cRect.bottom - (sRect.bottom - 50);
      if (diff > 0) letterScroll.scrollTop += diff;

      const char = cur.text[charIdx - 1];
      const wait = (char === '.' || char === '!' || char === '?' || char === '🎈') ? 90 : (char === ',' ? 45 : 18);
      timers.push(setTimeout(typeChar, wait));
    } else {
      itemIdx++;
      charIdx = 0;
      const cRect = cursor.getBoundingClientRect();
      const sRect = letterScroll.getBoundingClientRect();
      const diff = cRect.bottom - (sRect.bottom - 50);
      if (diff > 0) letterScroll.scrollTop += diff;
      timers.push(setTimeout(typeChar, 70));
    }
  }
  timers.push(setTimeout(typeChar, 80));
}

document.getElementById('open-letter').addEventListener('click',()=>{
  const envelope = document.getElementById('open-letter');
  envelope.disabled = true;
  envelope.classList.add('opening');
  const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600;
  timers.push(setTimeout(()=>{
    const invite = document.getElementById('letter-invite');
    invite.classList.add('reading');
    document.getElementById('opened-letter').hidden = false;
    letterScroll.scrollTop = 0; scrollPosition = 0; lastScrollTime = 0;
    setScrollPaused(true);
    letterScroll.focus({preventScroll:true});
    startLetterTypewriter();
  },delay));
});
// ==================== BIRTH YEAR PIN ====================
const birthYearPin = '2002';

function resetPinScreen() {
  const input = document.getElementById('birth-pin');
  if (input) {
    input.value = '';
    input.removeAttribute('aria-invalid');
  }
  const error = document.getElementById('pin-error');
  if (error) error.textContent = '';
}

const pinForm = document.getElementById('pin-form');
if (pinForm) {
  pinForm.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('birth-pin');
    const error = document.getElementById('pin-error');
    if (!input) return;
    if (input.value.trim() !== birthYearPin) {
      error.textContent = 'That year does not unlock these memories. Try 2002 ♡';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    input.value = '';
    show('chapter');
    celebrate();
  });
}

document.getElementById('next-chapter').addEventListener('click', () => {
  timers.forEach(clearTimeout); timers = [];
  resetPinScreen();
  show('pin-screen');
  const input = document.getElementById('birth-pin');
  if (input) input.focus({ preventScroll: true });
});
document.getElementById('replay').addEventListener('click',()=>{
  timers.forEach(clearTimeout); timers=[];
  typewriterActive = false;
  resetPinScreen();
  const paper = document.querySelector('.letter-paper');
  if (paper && paper.dataset.originalHtml) paper.innerHTML = paper.dataset.originalHtml;
  document.getElementById('letter-invite').classList.remove('reading');
  document.getElementById('opened-letter').hidden=true;
  document.getElementById('open-letter').classList.remove('opening');
  document.getElementById('open-letter').disabled=false;
  document.getElementById('letter-invite').hidden=true;
  document.getElementById('confetti').replaceChildren();
  show('welcome'); document.getElementById('name').focus();
});

// Decorative birthday motion stays behind the reading surface.
function addBirthdayBackground(parent) {
  const background=document.createElement('div');
  background.className='birthday-background';
  background.setAttribute('aria-hidden','true');
  const symbols=['🎈','✦','🎉','✧','🎈','✦','🎁','✧'];
  for(let i=0;i<16;i++) {
    const item=document.createElement('span');
    item.className='birthday-float';
    item.textContent=symbols[i%symbols.length];
    const side=i%2===0;
    item.style.cssText='left:'+(side ? 2+(i%4)*4 : 84+(i%4)*3)+'%;--duration:'+(15+i%5*3)+'s;--delay:-'+(i*2.7)+'s;--sway:'+(side?25:-25)+'px;font-size:'+(i%4===0?42:24)+'px';
    background.append(item);
  }
  for(let i=0;i<24;i++) {
    const item=document.createElement('i');
    item.className='birthday-confetti';
    item.style.cssText='left:'+((i*37)%100)+'%;--duration:'+(12+i%7*2)+'s;--delay:-'+(i*1.9)+'s;background:'+['#d4a45b','#c58098','#e5b2ba'][i%3];
    background.append(item);
  }
  parent.prepend(background);
}
addBirthdayBackground(document.getElementById('letter-invite'));

// Repeating decorative balloon pops around the secret card.
const landingBalloons = document.createElement('div');
landingBalloons.className = 'landing-balloons';
landingBalloons.setAttribute('aria-hidden','true');
for(let i=0;i<10;i++) {
  const balloon = document.createElement('div');
  balloon.className='landing-balloon';
  balloon.style.cssText='left:'+([7,89,18,78,3,94,24,72,12,84][i])+'%;top:'+(20+(i*19)%65)+'%;--pop-delay:-'+(i*1.7)+'s;--pop-duration:'+(9+i%3*2)+'s';
  const icon=document.createElement('span'); icon.className='balloon-icon';icon.textContent='🎈';
  const name=document.createElement('span');name.className='balloon-name';
  name.textContent = 'Praggu'[i % 6];
  const burst=document.createElement('span');burst.className='balloon-burst';burst.textContent='✧';
  balloon.append(icon,name,burst);landingBalloons.append(balloon);
}
document.getElementById('welcome').prepend(landingBalloons);

const cakeCanvas=document.getElementById('birthday-cake');
const cakeContext=cakeCanvas.getContext('2d');
let cakeCuts=[], cakeStart=null, cakePointer=null, cakeFinished=false, giftTransitionTimer=null;
function drawBirthdayCake(preview) {
 const c=cakeContext;c.clearRect(0,0,600,600);
 c.save();c.shadowColor='#76594125';c.shadowBlur=30;c.shadowOffsetY=12;
 c.fillStyle='#eee7da';c.beginPath();c.arc(300,300,248,0,Math.PI*2);c.fill();c.restore();
 c.fillStyle='#bc885d';c.beginPath();c.ellipse(300,320,202,205,0,0,Math.PI*2);c.fill();
 const icing=c.createRadialGradient(245,215,10,300,295,205);icing.addColorStop(0,'#ffe5e6');icing.addColorStop(.7,'#eeb4c2');icing.addColorStop(1,'#d98d9e');
 c.fillStyle=icing;c.beginPath();c.arc(300,290,200,0,Math.PI*2);c.fill();c.strokeStyle='#fff9ed';c.lineWidth=7;c.stroke();
 c.fillStyle='#fff7efaa';for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.arc(300+Math.cos(a)*170,290+Math.sin(a)*170,4,0,7);c.fill();}
 c.save();c.beginPath();c.arc(300,290,198,0,Math.PI*2);c.clip();
 for(const cut of cakeCuts){c.lineCap='round';c.strokeStyle='#a56b46';c.lineWidth=14;c.beginPath();c.moveTo(...cut[0]);c.lineTo(...cut[1]);c.stroke();c.strokeStyle='#fff5df';c.lineWidth=3;c.stroke();}
 if(preview&&cakeStart){c.strokeStyle='#fffdf6';c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.moveTo(...cakeStart);c.lineTo(...preview);c.stroke();}
 c.restore();
}
function cutBirthdayCake(from,to){
 if(cakeFinished)return;
 const dx=to[0]-from[0],dy=to[1]-from[1],length=Math.hypot(dx,dy);
 const outside=p=>Math.hypot(p[0]-300,p[1]-290)>=190;
 const t=((300-from[0])*dx+(290-from[1])*dy)/(length*length);
 const distance=Math.hypot(from[0]+t*dx-300,from[1]+t*dy-290);
 if(length<250||!outside(from)||!outside(to)||t<=0||t>=1||distance>65){document.getElementById('cake-message').textContent='Start outside one edge and drag across the middle to the other side.';drawBirthdayCake();return;}
 if(cakeCuts.length>=6){document.getElementById('cake-message').textContent='Plenty of slices to share! Happy birthday, Praggu! 🎉';return;}
 // All slices meet at the centre so the displayed piece count stays accurate.
 const ux=dx/length,uy=dy/length;
 const duplicate=cakeCuts.some(cut=>Math.abs((cut[1][0]-cut[0][0])*uy-(cut[1][1]-cut[0][1])*ux)<25);
 if(duplicate){document.getElementById('cake-message').textContent='Try a different angle for the next slice ♡';drawBirthdayCake();return;}
 cakeCuts.push([[300-ux*210,290-uy*210],[300+ux*210,290+uy*210]]);
 drawBirthdayCake();document.getElementById('piece-count').textContent='Pieces: '+cakeCuts.length*2;
 document.getElementById('cake-message').textContent='Happy birthday, Praggu! A little more happiness to share 🎂';celebrate();
 if(cakeCuts.length===4){
  cakeFinished=true;
  document.getElementById('cake-message').textContent='Your birthday gift is waiting… ♡';
  document.getElementById('slice-cake').disabled=true;
  document.getElementById('cake-screen').classList.add('cake-complete');
  giftTransitionTimer=setTimeout(()=>{
   document.getElementById('final-gift').classList.remove('note-visible');
   document.getElementById('gift-reveal').hidden=true;
   document.getElementById('accept-gift').disabled=false;
   document.getElementById('accept-gift').classList.remove('gift-opened');
   document.getElementById('gift-prompt').textContent='A little gift, with all our love.';
   show('final-gift');
  },1000);
  timers.push(giftTransitionTimer);
 }

}
function cakePoint(event){const r=cakeCanvas.getBoundingClientRect();return [(event.clientX-r.left)*600/r.width,(event.clientY-r.top)*600/r.height];}
cakeCanvas.addEventListener('pointerdown',e=>{if(cakePointer!==null)return;cakePointer=e.pointerId;cakeStart=cakePoint(e);cakeCanvas.setPointerCapture(e.pointerId);});
cakeCanvas.addEventListener('pointermove',e=>{if(e.pointerId===cakePointer&&cakeStart)drawBirthdayCake(cakePoint(e));});
cakeCanvas.addEventListener('pointerup',e=>{if(e.pointerId!==cakePointer)return;const start=cakeStart;cakeStart=null;cakePointer=null;if(start)cutBirthdayCake(start,cakePoint(e));});
cakeCanvas.addEventListener('pointercancel',()=>{cakeStart=null;cakePointer=null;drawBirthdayCake();});
function resetBirthdayCake(){clearTimeout(giftTransitionTimer);cakeFinished=false;document.getElementById('slice-cake').disabled=false;document.getElementById('cake-screen').classList.remove('cake-complete');cakeCuts=[];cakeStart=null;cakePointer=null;document.getElementById('piece-count').textContent='Pieces: 1';document.getElementById('cake-message').textContent='A slice of happiness, just for you ♡';drawBirthdayCake();}
document.getElementById('continue-cake').addEventListener('click',()=>{resetBirthdayCake();show('cake-screen');});
document.getElementById('reset-cake').addEventListener('click',resetBirthdayCake);
document.getElementById('slice-cake').addEventListener('click',()=>{for(let i=0;i<6;i++){const a=i*Math.PI/6;const before=cakeCuts.length;cutBirthdayCake([300-Math.cos(a)*240,290-Math.sin(a)*240],[300+Math.cos(a)*240,290+Math.sin(a)*240]);if(cakeCuts.length>before)break;}});

document.getElementById('accept-gift').addEventListener('click',()=>{
 const gift=document.getElementById('accept-gift');
 gift.disabled=true;gift.classList.add('gift-opened');
 document.getElementById('gift-prompt').textContent='A little love is unfolding…';
 celebrate();
 const delay=matchMedia('(prefers-reduced-motion: reduce)').matches?0:1400;
 timers.push(setTimeout(()=>{
  document.getElementById('final-gift').classList.add('note-visible');
  setFriendNote(0, false);
  document.getElementById('gift-reveal').hidden=false;
  document.getElementById('gift-prompt').textContent='Wrapped in love, just for you.';
  document.querySelector('#gift-reveal h3').focus({preventScroll:true});
  document.getElementById('gift-reveal').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 },delay));
});
document.getElementById('gift-replay').addEventListener('click',()=>document.getElementById('replay').click());

let friendNoteIndex=0;
const friendCards=[...document.querySelectorAll('.friend-card')];
function setFriendNote(index,focus=true){
 friendNoteIndex=Math.max(0,Math.min(friendCards.length-1,index));
 friendCards.forEach((card,i)=>{card.hidden=i!==friendNoteIndex;});
 const active=friendCards[friendNoteIndex];
 document.getElementById('note-position').textContent=active.dataset.friend+' ♡';
 document.getElementById('previous-note').disabled=friendNoteIndex===0;
 document.getElementById('next-note').disabled=friendNoteIndex===friendCards.length-1;
 if(focus){const heading=active.querySelector('h3');heading.tabIndex=-1;heading.focus({preventScroll:true});document.querySelector('.friend-card-stack').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
}
document.getElementById('previous-note').addEventListener('click',()=>setFriendNote(friendNoteIndex-1));
document.getElementById('next-note').addEventListener('click',()=>setFriendNote(friendNoteIndex+1));
