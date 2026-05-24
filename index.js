/* ── Notice bar dismiss → nav shift ── */
(function(){
  const notice = document.getElementById('topNotice');
  const nav    = document.getElementById('mainNav');
  if(!notice || !nav) return;

  function syncNav(){
    nav.style.top = notice.offsetHeight + 'px';
  }
  syncNav();

  const btn = notice.querySelector('button');
  btn.addEventListener('click', ()=>{
    notice.style.display = 'none';
    nav.style.top = '0';
  });
  window.addEventListener('resize', syncNav);
})();

/* ── Wave animation ── */
(function(){
  const canvas = document.getElementById('waveCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, t=0;

  function resize(){
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function draw(){
    ctx.clearRect(0,0,w,h);
    const waves = [
      {amp:22, freq:0.012, speed:0.018, y:0.45, color:'rgba(46,125,170,0.5)'},
      {amp:16, freq:0.018, speed:0.025, y:0.55, color:'rgba(46,125,170,0.35)'},
      {amp:12, freq:0.024, speed:0.012, y:0.65, color:'rgba(200,223,240,0.2)'},
    ];

    waves.forEach(wave => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for(let x=0; x<=w; x+=2){
        const y = wave.y * h + Math.sin(x * wave.freq + t * wave.speed * 60) * wave.amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.fill();
    });

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Card toggle ── */
function toggleCard(el){
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.card').forEach(c => {
    c.classList.remove('open');
    const btn = c.querySelector('.card-toggle');
    if(btn) btn.textContent = '展開詳情 ▾';
  });
  if(!isOpen){
    el.classList.add('open');
    const btn = el.querySelector('.card-toggle');
    if(btn) btn.textContent = '收合 ▴';
    // smooth scroll card into view after transition settles
    setTimeout(()=>{
      el.scrollIntoView({behavior:'smooth', block:'nearest'});
    }, 120);
  }
}

/* ── Scroll to card ── */
function scrollToCard(id){
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if(!card) return;
  document.getElementById('cards').scrollIntoView({behavior:'smooth'});
  setTimeout(()=>{
    card.scrollIntoView({behavior:'smooth', block:'center'});
    // open the card
    document.querySelectorAll('.card').forEach(c=>c.classList.remove('open'));
    card.classList.add('open');
    const btn = card.querySelector('.card-toggle');
    if(btn) btn.textContent = '收合 ▴';
  }, 400);
}

/* ── Risk bar animate on scroll ── */
const riskObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.querySelectorAll('.risk-fill').forEach(fill=>{
        const w = fill.dataset.width;
        fill.style.width = w + '%';
      });
      riskObserver.unobserve(entry.target);
    }
  });
}, {threshold: 0.3});

const riskBars = document.getElementById('riskBars');
if(riskBars) riskObserver.observe(riskBars);

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add('visible');
  });
}, {threshold: 0.12});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ── Map logic ── */
let currentExhibitId = null;

const exhibitData = {
  1: { title: '拼板舟', tao: 'tatala', id: 'NUTC-IM-2026-001' },
  2: { title: '飛魚季儀式', tao: 'alibangbang', id: 'NUTC-IM-2026-002' },
  3: { title: '芋頭農耕系統', tao: 'soli', id: 'NUTC-IM-2026-003' },
  4: { title: '傳統地下屋', tao: 'vahay', id: 'NUTC-IM-2026-004' },
  5: { title: '傳統禮裝', tao: 'walis・nagol', id: 'NUTC-IM-2026-005' }
};

function showMapCard(id, event) {
  event.stopPropagation();
  currentExhibitId = id;
  const data = exhibitData[id];
  const popup = document.getElementById('mapPopup');
  
  document.getElementById('popupTitle').textContent = data.title;
  document.getElementById('popupTao').textContent = '（' + data.tao + '）';
  document.getElementById('popupId').textContent = 'dc:identifier ' + data.id;
  
  popup.style.display = 'block';
  
  // Position popup above the marker
  const marker = event.currentTarget;
  const container = document.querySelector('.map-container');
  const containerRect = container.getBoundingClientRect();
  const markerRect = marker.getBoundingClientRect();
  
  const left = markerRect.left - containerRect.left + (markerRect.width / 2) - (popup.offsetWidth / 2);
  const top = markerRect.top - containerRect.top - popup.offsetHeight - 15;
  
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
}

function scrollToCurrentCard() {
  if (currentExhibitId) {
    scrollToCard(currentExhibitId);
    document.getElementById('mapPopup').style.display = 'none';
  }
}

// Hide popup when clicking outside
document.addEventListener('click', () => {
  const popup = document.getElementById('mapPopup');
  if (popup) popup.style.display = 'none';
});

if (document.getElementById('mapPopup')) {
  document.getElementById('mapPopup').addEventListener('click', (e) => e.stopPropagation());
}
