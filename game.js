(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = 448;
  const GRAVITY = 1450;

  const levels = [
    {
      name: 'Fase 1 — Campo ensolarado', theme: 0, width: 2700, time: 38,
      obstacles: [
        {x:390,w:36,h:43,type:'crate'}, {x:610,w:52,h:30,type:'spike'}, {x:830,w:36,h:43,type:'crate'},
        {x:1040,w:52,h:30,type:'spike'}, {x:1240,w:36,h:43,type:'crate'}, {x:1455,w:52,h:30,type:'spike'},
        {x:1660,w:38,h:43,type:'crate'}, {x:1845,w:52,h:30,type:'spike'}, {x:2085,w:36,h:43,type:'crate'},
        {x:2310,w:52,h:30,type:'spike'}
      ],
      coins: [[260,398],[300,350],[340,398],[520,398],[560,355],[720,398],[770,350],[930,398],[980,355],[1130,398],[1170,350],[1360,398],[1400,355],[1560,398],[1600,350],[1760,398],[1800,355],[1990,398],[2030,350],[2205,398],[2250,355],[2440,398],[2480,350]],
      boosts: [ {x:720,y:406}, {x:1510,y:406}, {x:2180,y:406} ],
      shields: [ {x:1740,y:388} ], timeOrbs: [{x:900,y:326},{x:2020,y:326}], checkpoints: [980,1780], drones: []
    },
    {
      name: 'Fase 2 — Desfiladeiro quente', theme: 1, width: 2920, time: 36,
      obstacles: [
        {x:360,w:52,h:30,type:'spike'}, {x:540,w:36,h:43,type:'crate'}, {x:760,w:52,h:30,type:'spike'},
        {x:950,w:36,h:43,type:'crate'}, {x:1120,w:52,h:30,type:'spike'}, {x:1335,w:52,h:30,type:'spike'},
        {x:1550,w:36,h:43,type:'crate'}, {x:1760,w:52,h:30,type:'spike'}, {x:1950,w:36,h:43,type:'crate'},
        {x:2145,w:52,h:30,type:'spike'}, {x:2350,w:36,h:43,type:'crate'}, {x:2560,w:52,h:30,type:'spike'}
      ],
      coins: [[235,398],[275,350],[315,398],[435,398],[650,398],[695,350],[870,398],[910,350],[1030,398],[1230,398],[1270,350],[1450,398],[1490,350],[1660,398],[1700,350],[1860,398],[1900,350],[2050,398],[2090,350],[2260,398],[2300,350],[2460,398],[2500,350],[2710,398],[2750,350]],
      boosts: [ {x:650,y:406}, {x:1435,y:406}, {x:2260,y:406}, {x:2690,y:406} ],
      shields: [ {x:2050,y:388} ], timeOrbs: [{x:700,y:326},{x:1610,y:326},{x:2440,y:326}], checkpoints: [900,1690,2380],
      drones: [ {x:860,y:315,w:42,h:42,range:42,speed:2.25,phase:0.8}, {x:1840,y:316,w:42,h:42,range:38,speed:2.6,phase:2.0} ]
    },
    {
      name: 'Fase 3 — Noite neon', theme: 2, width: 3150, time: 34,
      obstacles: [
        {x:350,w:36,h:43,type:'crate'}, {x:510,w:52,h:30,type:'spike'}, {x:700,w:52,h:30,type:'spike'},
        {x:900,w:36,h:43,type:'crate'}, {x:1080,w:52,h:30,type:'spike'}, {x:1260,w:36,h:43,type:'crate'},
        {x:1460,w:52,h:30,type:'spike'}, {x:1640,w:52,h:30,type:'spike'}, {x:1835,w:36,h:43,type:'crate'},
        {x:2020,w:52,h:30,type:'spike'}, {x:2210,w:36,h:43,type:'crate'}, {x:2400,w:52,h:30,type:'spike'},
        {x:2600,w:36,h:43,type:'crate'}, {x:2810,w:52,h:30,type:'spike'}
      ],
      coins: [[220,398],[260,350],[400,398],[440,350],[610,398],[650,350],[810,398],[850,350],[1000,398],[1040,350],[1180,398],[1220,350],[1380,398],[1420,350],[1560,398],[1600,350],[1760,398],[1800,350],[1940,398],[1980,350],[2130,398],[2170,350],[2320,398],[2360,350],[2520,398],[2560,350],[2720,398],[2760,350],[2940,398],[2980,350]],
      boosts: [ {x:610,y:406}, {x:1190,y:406}, {x:1740,y:406}, {x:2310,y:406}, {x:2910,y:406} ],
      shields: [ {x:1520,y:388}, {x:2620,y:388} ], timeOrbs: [{x:640,y:326},{x:1360,y:326},{x:2120,y:326},{x:2760,y:326}], checkpoints: [850,1580,2300],
      drones: [ {x:790,y:312,w:42,h:42,range:45,speed:2.5,phase:0.3}, {x:1770,y:306,w:44,h:44,range:50,speed:2.8,phase:1.7}, {x:2490,y:310,w:42,h:42,range:40,speed:2.3,phase:2.5} ]
    }
  ];

  const difficultySettings = {
    easy:   { timeMultiplier: 1.28, speedMultiplier: 1.04, hazardMultiplier: 0.78, lives: 4 },
    normal: { timeMultiplier: 1,    speedMultiplier: 1,    hazardMultiplier: 1,    lives: 3 },
    hard:   { timeMultiplier: 0.80, speedMultiplier: 1.08, hazardMultiplier: 1.28, lives: 2 }
  };
  let difficulty = readStorage('cct-difficulty', 'normal');
  if (!difficultySettings[difficulty]) difficulty = 'normal';

  const keys = Object.create(null);
  function readStorage(key, fallback) { try { const value = localStorage.getItem(key); return value === null ? fallback : value; } catch (_) { return fallback; } }
  function writeStorage(key, value) { try { localStorage.setItem(key, String(value)); } catch (_) {} }
  let soundEnabled = readStorage('cct-sound', 'on') !== 'off';
  let audioContext = null;
  let bestScore = Math.max(0, Number(readStorage('cct-best-score', '0')) || 0);
  function playSfx(kind) {
    if (!soundEnabled) return;
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      if (!audioContext) audioContext = new AudioCtor();
      if (audioContext.state === 'suspended') audioContext.resume();
      const sounds = {
        coin: [740, 1120, .10, 'sine'], jump: [300, 470, .09, 'triangle'], checkpoint: [410, 830, .24, 'sine'], time: [520, 1320, .23, 'triangle'],
        boost: [220, 720, .20, 'sawtooth'], shield: [520, 950, .22, 'sine'],
        dash: [170, 440, .11, 'triangle'], hit: [180, 75, .20, 'square'],
        finish: [520, 980, .36, 'triangle'], fail: [300, 95, .35, 'sawtooth']
      };
      const [startHz, endHz, duration, type] = sounds[kind] || sounds.coin;
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(startHz, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endHz), now + duration);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.12, now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(now); oscillator.stop(now + duration + .02);
    } catch (_) { /* Som é opcional; o jogo continua se o navegador bloquear áudio. */ }
  }
  const player = { x: 70, y: GROUND_Y - 48, w: 32, h: 48, vy: 0, onGround: true, face: 1, invuln: 0, boost: 0, shield: 0, dashTime: 0, dashCooldown: 0, coyote: 0, runFrame: 0 };
  let state = 'menu';
  let levelIndex = 0;
  let score = 0;
  let coinsCollected = 0;
  let lives = 3;
  let timeLeft = levels[0].time;
  let cameraX = 0;
  let lastTime = 0;
  let particles = [];
  let jumpBuffer = 0;
  let gameClock = 0;
  let cameraShake = 0;
  let lastCheckpointX = 35;
  let coinCombo = 0;
  let comboTimer = 0;
  let floatingTexts = [];
  let checkpoints = [];

  const $ = id => document.getElementById(id);
  const overlay = $('overlay');
  const mainButton = $('main-button');
  const activeLevel = () => levels[levelIndex];
  let collectibles = null;

  function resetLevel() {
    const level = activeLevel();
    player.x = 70;
    player.y = GROUND_Y - player.h;
    player.vy = 0;
    player.onGround = true;
    player.face = 1;
    player.invuln = 0;
    player.boost = 0;
    player.shield = 0;
    player.dashTime = 0;
    player.dashCooldown = 0;
    player.coyote = 0;
    player.jumpCount = 0;
    player.runFrame = 0;
    gameClock = 0;
    cameraShake = 0;
    cameraX = 0;
    lastCheckpointX = 35;
    coinCombo = 0;
    comboTimer = 0;
    floatingTexts = [];
    checkpoints = (level.checkpoints || []).map(x => ({ x, activated: false }));
    timeLeft = level.time * difficultySettings[difficulty].timeMultiplier;
    collectibles = {
      coins: level.coins.map(([x,y]) => ({x,y,r:10,collected:false,phase:Math.random()*6})),
      boosts: level.boosts.map(b => ({...b,w:24,h:30,collected:false,phase:Math.random()*6})),
      shields: (level.shields || []).map(b => ({...b,w:27,h:27,collected:false,phase:Math.random()*6})),
      timeOrbs: (level.timeOrbs || []).map(b => ({...b,w:28,h:28,collected:false,phase:Math.random()*6}))
    };
    $('stage-name').textContent = level.name;
    updateHud();
  }

  function updateHud() {
    $('time').textContent = formatTime(timeLeft);
    $('time').style.color = timeLeft <= 10 ? '#ff7d91' : '#f4f7fb';
    $('score').textContent = String(score).padStart(6, '0');
    if (score > bestScore) { bestScore = score; writeStorage('cct-best-score', bestScore); }
    $('best-score').textContent = String(bestScore).padStart(6, '0');
    $('lives').textContent = lives > 0 ? Array.from({length: lives}, () => '♥').join(' ') : '—';
    $('stage').textContent = `${String(levelIndex + 1).padStart(2,'0')} / 03`;
  }

  function formatTime(value) {
    const t = Math.max(0, Math.ceil(value));
    return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
  }

  function syncGameButtons() {
    const button = $('pause-button');
    if (state === 'playing') { button.disabled = false; button.textContent = 'Ⅱ Pausar'; }
    else if (state === 'paused') { button.disabled = false; button.textContent = '▶ Continuar'; }
    else { button.disabled = true; button.textContent = 'Ⅱ Pausar'; }
    $('audio-button').textContent = soundEnabled ? '🔊 Som: ligado' : '🔇 Som: desligado';
    $('audio-button').setAttribute('aria-pressed', String(soundEnabled));
  }

  function showOverlay({symbol='🏁', kicker='', title='', copy='', button='Continuar', action=()=>{}, hint=true, chooseDifficulty=false}) {
    $('overlay-symbol').textContent = symbol;
    $('overlay-kicker').textContent = kicker;
    $('overlay-title').textContent = title;
    $('overlay-copy').textContent = copy;
    mainButton.innerHTML = `${button} <span aria-hidden="true">→</span>`;
    $('overlay').classList.remove('hidden');
    $('overlay').style.pointerEvents = 'auto';
    $('overlay').dataset.action = 'ready';
    mainButton.onclick = action;
    const hintEl = document.querySelector('.key-hint');
    hintEl.style.display = hint ? 'block' : 'none';
    $('difficulty-picker').style.display = chooseDifficulty ? 'grid' : 'none';
    syncGameButtons();
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
    overlay.style.pointerEvents = 'none';
    syncGameButtons();
  }

  function resumeGame() { state = 'playing'; hideOverlay(); }
  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      showOverlay({symbol:'Ⅱ', kicker:'PAUSA', title:'Tempo para respirar', copy:'A corrida está pausada. Quando estiver pronto, continue de onde parou.', button:'Continuar corrida', action:resumeGame});
    } else if (state === 'paused') resumeGame();
  }

  function startGame() {
    levelIndex = 0;
    score = 0;
    coinsCollected = 0;
    lives = difficultySettings[difficulty].lives;
    particles = [];
    floatingTexts = [];
    jumpBuffer = 0;
    resetLevel();
    state = 'playing';
    hideOverlay();
  }

  function startNextLevel() {
    levelIndex++;
    if (levelIndex >= levels.length) {
      state = 'won';
      showOverlay({
        symbol: '🏆', kicker: 'MISSÃO CUMPRIDA', title: 'Você venceu a corrida!',
        copy: `Você completou as 3 fases, coletou ${coinsCollected} moedas e fez ${score} pontos. Excelente corrida!`,
        button: 'Jogar novamente', action: startGame
      });
      return;
    }
    resetLevel();
    state = 'playing';
    hideOverlay();
  }

  function finishLevel() {
    playSfx('finish');
    const bonus = Math.ceil(timeLeft) * 25;
    score += bonus;
    updateHud();
    if (levelIndex === levels.length - 1) {
      state = 'won';
      showOverlay({
        symbol: '🏆', kicker: 'MISSÃO CUMPRIDA', title: 'Você venceu a corrida!',
        copy: `Você completou as 3 fases, coletou ${coinsCollected} moedas e fez ${score} pontos. Bônus de chegada: ${bonus} pontos!`,
        button: 'Jogar novamente', action: startGame
      });
    } else {
      state = 'levelcomplete';
      showOverlay({
        symbol: '🏁', kicker: `FASE ${levelIndex + 1} CONCLUÍDA`, title: 'Boa corrida!',
        copy: `Destino alcançado! Você ganhou ${bonus} pontos de bônus pelo tempo restante. Prepare-se para o próximo percurso.`,
        button: 'Próxima fase', action: startNextLevel
      });
    }
  }

  function loseLife(obstacle) {
    if (player.invuln > 0 || state !== 'playing') return;
    lives--;
    playSfx('hit');
    cameraShake = .24;
    player.invuln = 1.45;
    player.vy = -210;
    player.x = lastCheckpointX > 35 ? lastCheckpointX : Math.max(35, obstacle.x - player.w - 95);
    player.y = GROUND_Y - player.h;
    player.boost = 0;
    addBurst(player.x + player.w/2, player.y + player.h/2, '#ff7c76', 14);
    updateHud();
    if (lives <= 0) {
      state = 'gameover';
      showOverlay({
        symbol: '💥', kicker: 'FIM DE JOGO', title: 'Suas vidas acabaram',
        copy: `Você fez ${score} pontos e coletou ${coinsCollected} moedas. Tente de novo e observe o tempo dos pulos.`,
        button: 'Tentar novamente', action: startGame
      });
    }
  }

  function addBurst(x,y,color,count) {
    for(let i=0;i<count;i++) {
      const a=Math.random()*Math.PI*2, speed=45+Math.random()*180;
      particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-35,life:.35+Math.random()*.5,max:.8,color,size:2+Math.random()*4});
    }
  }

  function addFloatingText(x, y, text, color='#fff2bd') {
    floatingTexts.push({ x, y, text, color, life: 1.05, max: 1.05 });
  }

  function overlaps(a,b) {
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  function obstacleRect(obstacle, time) {
    if (obstacle.type === 'drone') {
      return { x: obstacle.x, y: obstacle.y + Math.sin(time * obstacle.speed * difficultySettings[difficulty].hazardMultiplier + obstacle.phase) * obstacle.range, w: obstacle.w, h: obstacle.h };
    }
    return { x: obstacle.x, y: GROUND_Y - obstacle.h, w: obstacle.w, h: obstacle.h };
  }

  function update(dt) {
    if (state === 'paused') return;
    if (state !== 'playing') { updateParticles(dt); return; }
    gameClock += dt;
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHud();
      state = 'gameover';
      playSfx('fail');
      showOverlay({symbol:'⌛',kicker:'TEMPO ESGOTADO',title:'A corrida terminou!',copy:`Você chegou a ${score} pontos e coletou ${coinsCollected} moedas. Tente novamente, use as investidas e aproveite os escudos.`,button:'Correr novamente',action:startGame});
      return;
    }

    const left = keys.ArrowLeft || keys.a || keys.A;
    const right = keys.ArrowRight || keys.d || keys.D;
    const speed = (player.boost > 0 ? 430 : 265) * difficultySettings[difficulty].speedMultiplier;
    if (player.dashTime > 0) {
      player.x += player.face * 590 * dt;
      player.dashTime = Math.max(0, player.dashTime - dt);
      if (Math.random() < .75) particles.push({x:player.x+player.w/2,y:player.y+player.h*.65,vx:-player.face*(30+Math.random()*120),vy:(Math.random()-.5)*100,life:.18+Math.random()*.15,max:.33,color:'#7defff',size:2+Math.random()*3});
    } else {
      if (left) { player.x -= speed*dt; player.face = -1; }
      if (right) { player.x += speed*dt; player.face = 1; player.runFrame += dt*13; }
    }

    player.coyote = player.onGround ? .11 : Math.max(0, player.coyote - dt);
    if (jumpBuffer > 0) {
      if (player.onGround || player.coyote > 0) {
        player.vy = -575;
        player.onGround = false;
        player.coyote = 0;
        player.jumpCount = 1;
        jumpBuffer = 0;
        playSfx('jump');
        addBurst(player.x+player.w/2, GROUND_Y-3, '#e5f5a1', 5);
      } else if (player.jumpCount < 2) {
        player.vy = -525;
        player.jumpCount = 2;
        jumpBuffer = 0;
        playSfx('jump');
        addBurst(player.x+player.w/2, player.y+player.h, '#8cefff', 9);
        addFloatingText(player.x+player.w/2, player.y-8, 'SALTO DUPLO!', '#9bf2ff');
      }
    }
    jumpBuffer = Math.max(0, jumpBuffer - dt);

    player.vy += GRAVITY*dt;
    player.y += player.vy*dt;
    if (player.y+player.h >= GROUND_Y) {
      player.y = GROUND_Y-player.h;
      player.vy = 0;
      player.onGround = true;
      player.jumpCount = 0;
    } else player.onGround = false;

    player.x = Math.max(0, Math.min(player.x, activeLevel().width-player.w));
    player.invuln = Math.max(0, player.invuln-dt);
    player.boost = Math.max(0, player.boost-dt);
    player.shield = Math.max(0, player.shield-dt);
    player.dashCooldown = Math.max(0, player.dashCooldown-dt);
    cameraShake = Math.max(0, cameraShake-dt);

    const level = activeLevel();
    for (const checkpoint of checkpoints) {
      if (!checkpoint.activated && player.x + player.w * .5 >= checkpoint.x) {
        checkpoint.activated = true;
        lastCheckpointX = Math.max(35, checkpoint.x - 55);
        score += 150;
        addBurst(checkpoint.x, GROUND_Y - 56, '#b3ff9b', 15);
        addFloatingText(checkpoint.x, GROUND_Y - 105, 'CHECKPOINT +150', '#d7ff9e');
        playSfx('checkpoint');
        updateHud();
      }
    }
    const allHazards = level.obstacles.concat(level.drones || []);
    for (const obstacle of allHazards) {
      const box = obstacleRect(obstacle, gameClock);
      if (overlaps(player, box)) {
        if (player.shield > 0) {
          player.shield = 0;
          player.invuln = .85;
          player.x = Math.max(35, obstacle.x - player.w - 20);
          addBurst(player.x+player.w/2, player.y+player.h/2, '#78f2e3', 18);
          playSfx('shield');
        } else loseLife(obstacle);
        break;
      }
    }
    if (state !== 'playing') return;

    for (const coin of collectibles.coins) {
      if (!coin.collected && overlaps(player, {x:coin.x-coin.r,y:coin.y-coin.r,w:coin.r*2,h:coin.r*2})) {
        coin.collected = true;
        coinCombo = comboTimer > 0 ? Math.min(coinCombo + 1, 5) : 1;
        comboTimer = 2.1;
        const coinPoints = 100 + Math.max(0, coinCombo - 1) * 25;
        score += coinPoints; coinsCollected++;
        addBurst(coin.x,coin.y,'#ffcf57',8);
        addFloatingText(coin.x, coin.y - 14, `+${coinPoints}${coinCombo > 1 ? ` COMBO x${coinCombo}` : ''}`, '#fff0a0');
        playSfx('coin'); updateHud();
      }
    }
    for (const boost of collectibles.boosts) {
      if (!boost.collected && overlaps(player, boost)) {
        boost.collected = true; player.boost = 4.3; score += 50;
        addBurst(boost.x+12,boost.y+12,'#72e9ff',12); addFloatingText(boost.x+12,boost.y-8,'TURBO +50','#a9f7ff'); playSfx('boost'); updateHud();
      }
    }
    for (const shield of collectibles.shields) {
      if (!shield.collected && overlaps(player, shield)) {
        shield.collected = true; player.shield = 6; score += 75;
        addBurst(shield.x+13,shield.y+13,'#78f2e3',15); addFloatingText(shield.x, shield.y-8, 'ESCUDO +75', '#a8fff4'); playSfx('shield'); updateHud();
      }
    }
    for (const orb of collectibles.timeOrbs) {
      if (!orb.collected && overlaps(player, orb)) {
        orb.collected = true;
        timeLeft += 6;
        score += 200;
        addBurst(orb.x+orb.w/2,orb.y+orb.h/2,'#ffdca0',16);
        addFloatingText(orb.x, orb.y-8, '+6 SEGUNDOS!', '#fff0b5');
        playSfx('time');
        updateHud();
      }
    }
    comboTimer = Math.max(0, comboTimer - dt);
    if (comboTimer <= 0) coinCombo = 0;

    const targetCamera = Math.max(0, Math.min(level.width-W, player.x-260));
    cameraX += (targetCamera-cameraX)*Math.min(1,dt*7);
    updateParticles(dt);
    updateHud();
    if (player.x + player.w >= level.width-85) finishLevel();
  }

  function updateParticles(dt) {
    particles = particles.filter(p => p.life > 0);
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=380*dt;p.life-=dt;}
    floatingTexts = floatingTexts.filter(t => t.life > 0);
    for (const t of floatingTexts) { t.y -= 28 * dt; t.life -= dt; }
  }

  function roundedRect(x,y,w,h,r,fill,stroke) {
    ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
    if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
  }

  function drawBackground(level, time=0) {
    const theme=level.theme;
    let skyTop,skyBottom,hill1,hill2,sun;
    if(theme===0){skyTop='#6cc8d5';skyBottom='#d2f0ca';hill1='#72b98a';hill2='#438466';sun='#fff1a1';}
    else if(theme===1){skyTop='#e88164';skyBottom='#f8c17f';hill1='#b95f52';hill2='#743c4c';sun='#ffe0a0';}
    else{skyTop='#101a42';skyBottom='#342e69';hill1='#202e57';hill2='#172240';sun='#b3f7f0';}
    const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,skyTop);grad.addColorStop(1,skyBottom);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    // Sun / moon and a few atmospheric shapes.
    ctx.globalAlpha=.9;ctx.fillStyle=sun;ctx.beginPath();ctx.arc(theme===2?780:790,theme===1?130:105,theme===2?28:35,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    if(theme !== 2) {
      for (let i=0;i<5;i++) {
        const cx = ((i*245 - cameraX*.18 + time*(theme===1?5:9)) % (W+180) + W+180) % (W+180) - 90;
        const cy = 70 + (i%3)*48;
        ctx.globalAlpha = theme===1 ? .20 : .38; ctx.fillStyle = theme===1 ? '#fff1d8' : '#f8fff1';
        ctx.beginPath(); ctx.ellipse(cx,cy,31,11,0,0,Math.PI*2); ctx.ellipse(cx+20,cy-6,22,14,0,0,Math.PI*2); ctx.ellipse(cx+39,cy,28,10,0,0,Math.PI*2); ctx.fill();
      } ctx.globalAlpha=1;
    }
    if(theme===2){for(let i=0;i<48;i++){const x=((i*139-cameraX*.12)%W+W)%W;const y=25+(i*47%230);ctx.fillStyle=i%3?'#d5f4ff':'#8ef3e1';ctx.globalAlpha=.25+(i%4)*.13;ctx.fillRect(x,y,2,2);}ctx.globalAlpha=1;}
    drawHills(hill1,310,.12,level.width);drawHills(hill2,370,.22,level.width);
    // Background landmarks move slower than the player.
    for(let i=0;i<14;i++){
      const wx=i*245+80; const x=wx-cameraX*.45;
      if(x < -100 || x > W+100) continue;
      if(theme===0){
        ctx.fillStyle='#2c755f';ctx.beginPath();ctx.arc(x,365,32,0,Math.PI*2);ctx.fill();ctx.fillRect(x-5,365,10,55);
        ctx.fillStyle='#377f67';ctx.beginPath();ctx.arc(x+23,375,24,0,Math.PI*2);ctx.fill();
      } else if(theme===1){
        ctx.fillStyle='#87494b';ctx.beginPath();ctx.moveTo(x-40,390);ctx.lineTo(x-12,305);ctx.lineTo(x+12,390);ctx.fill();ctx.beginPath();ctx.moveTo(x+5,390);ctx.lineTo(x+40,325);ctx.lineTo(x+65,390);ctx.fill();
      } else {
        ctx.fillStyle='#182743';ctx.fillRect(x-25,295,42,95);ctx.fillRect(x+20,328,34,62);ctx.fillStyle='#66ded5';for(let j=0;j<5;j++)ctx.fillRect(x-17+j%2*18,310+j*13,6,8);
      }
    }
    // Far finish-area structures hint at progression.
    const endX=level.width-cameraX*.35;
    if(endX>-100&&endX<W+100){ctx.fillStyle=theme===2?'#3de8d1':'#f6f0cb';ctx.globalAlpha=.3;ctx.fillRect(endX-55,250,12,140);ctx.fillRect(endX+25,250,12,140);ctx.fillRect(endX-65,250,115,10);ctx.globalAlpha=1;}
  }

  function drawHills(color,base,parallax,worldWidth){
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,base);
    for(let x=-80;x<=W+100;x+=110){const world=x+cameraX*parallax;const y=base+Math.sin(world*.006)*28+Math.cos(world*.013)*13;ctx.lineTo(x,y);}
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  }

  function drawGround(level){
    const theme=level.theme;
    const ground=theme===0?'#315e50':theme===1?'#593b46':'#101d35';
    const top=theme===0?'#b8d878':theme===1?'#efb16c':'#4de3d1';
    ctx.fillStyle=ground;ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
    ctx.fillStyle=top;ctx.fillRect(0,GROUND_Y,W,6);
    ctx.save();ctx.beginPath();ctx.rect(0,GROUND_Y+6,W,H-GROUND_Y-6);ctx.clip();
    const start=Math.floor(cameraX/42)*42;
    for(let wx=start;wx<cameraX+W+42;wx+=42){const x=wx-cameraX;ctx.fillStyle=theme===2?(Math.floor(wx/42)%2?'#203455':'#192c49'):(Math.floor(wx/42)%2?'#00000012':'#ffffff0c');ctx.fillRect(x,GROUND_Y+10,40,18);ctx.fillRect(x+7,GROUND_Y+31,25,13);}
    // Subtle grass / cracks.
    for(let wx=Math.floor(cameraX/75)*75;wx<cameraX+W;wx+=75){const x=wx-cameraX;ctx.strokeStyle=theme===2?'#55e8d344':'#172c274d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,GROUND_Y+7);ctx.lineTo(x+5,GROUND_Y+13);ctx.lineTo(x+2,GROUND_Y+20);ctx.stroke();}
    ctx.restore();
  }

  function drawObstacle(obstacle,time=0){
    const rect = obstacleRect(obstacle,time);
    const x=rect.x-cameraX,y=rect.y;
    if(x < -80 || x > W+80) return;
    if(obstacle.type==='drone'){
      const cx=x+rect.w/2, cy=y+rect.h/2, radius=Math.min(rect.w,rect.h)*.38;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(time*1.6);
      ctx.shadowColor='#ff65b5';ctx.shadowBlur=16;ctx.fillStyle='#ff65b5';
      ctx.beginPath();for(let i=0;i<20;i++){const a=i*Math.PI/10;const r=i%2===0?radius+6:radius-3;const px=Math.cos(a)*r,py=Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();ctx.shadowBlur=0;
      ctx.fillStyle='#3a204b';ctx.beginPath();ctx.arc(0,0,radius*.75,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff2fa';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.restore();
    }else if(obstacle.type==='crate'){
      roundedRect(x,y,obstacle.w,obstacle.h,5,'#a85c3c','#633a32');
      ctx.strokeStyle='#e3a16c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+5,y+5);ctx.lineTo(x+obstacle.w-5,y+obstacle.h-5);ctx.moveTo(x+obstacle.w-5,y+5);ctx.lineTo(x+5,y+obstacle.h-5);ctx.stroke();
      ctx.fillStyle='#f0b17a';ctx.fillRect(x+3,y+3,obstacle.w-6,4);
    }else{
      ctx.fillStyle='#ff7776';ctx.beginPath();ctx.moveTo(x,y+obstacle.h);ctx.lineTo(x+obstacle.w*.25,y+2);ctx.lineTo(x+obstacle.w*.5,y+obstacle.h);ctx.lineTo(x+obstacle.w*.75,y+2);ctx.lineTo(x+obstacle.w,y+obstacle.h);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#8d454c';ctx.lineWidth=2;ctx.stroke();
    }
  }

  function drawCoin(coin, time){
    if(coin.collected) return;
    const x=coin.x-cameraX, y=coin.y+Math.sin(time*5+coin.phase)*3;
    if(x < -30 || x > W+30) return;
    ctx.save();ctx.translate(x,y);const squash=.7+.3*Math.abs(Math.sin(time*7+coin.phase));ctx.scale(squash,1);
    ctx.fillStyle='#e99930';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff0a3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#fff5bd';ctx.fillRect(-1.5,-5,3,10);ctx.restore();
  }

  function drawBoost(boost,time){
    if(boost.collected)return;
    const x=boost.x-cameraX,y=boost.y+Math.sin(time*5+boost.phase)*4;
    if(x<-40||x>W+40)return;
    ctx.save();ctx.shadowColor='#6beeff';ctx.shadowBlur=16;roundedRect(x,y,boost.w,boost.h,7,'#174b70','#8cefff');ctx.shadowBlur=0;
    ctx.fillStyle='#8cefff';ctx.beginPath();ctx.moveTo(x+14,y+4);ctx.lineTo(x+7,y+17);ctx.lineTo(x+13,y+17);ctx.lineTo(x+10,y+26);ctx.lineTo(x+19,y+13);ctx.lineTo(x+14,y+13);ctx.closePath();ctx.fill();ctx.restore();
  }

  function drawShield(shield,time){
    if(shield.collected)return;
    const x=shield.x-cameraX,y=shield.y+Math.sin(time*4+shield.phase)*4;
    if(x<-40||x>W+40)return;
    ctx.save();ctx.shadowColor='#78f2e3';ctx.shadowBlur=15;ctx.fillStyle='#174d57';ctx.strokeStyle='#9bfff0';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x+shield.w/2,y);ctx.lineTo(x+shield.w-2,y+6);ctx.lineTo(x+shield.w-5,y+19);ctx.lineTo(x+shield.w/2,y+shield.h);ctx.lineTo(x+5,y+19);ctx.lineTo(x+2,y+6);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.strokeStyle='#d7fff9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+8,y+13);ctx.lineTo(x+12,y+17);ctx.lineTo(x+19,y+9);ctx.stroke();ctx.restore();
  }

  function drawTimeOrb(orb, time){
    if (orb.collected) return;
    const x = orb.x - cameraX, y = orb.y + Math.sin(time*4+orb.phase)*4;
    if (x < -40 || x > W+40) return;
    ctx.save();
    ctx.shadowColor = '#ffd978'; ctx.shadowBlur = 18;
    const cx=x+orb.w/2, cy=y+orb.h/2;
    ctx.fillStyle='#704b24'; ctx.strokeStyle='#ffe9a2'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,orb.w/2,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.strokeStyle='#fff2c7'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2); ctx.moveTo(cx,cy); ctx.lineTo(cx,cy-5); ctx.moveTo(cx,cy); ctx.lineTo(cx+4,cy+2); ctx.stroke();
    ctx.restore();
  }

  function drawCheckpoint(checkpoint, time){
    const x=checkpoint.x-cameraX;
    if (x < -35 || x > W+35) return;
    const active=checkpoint.activated;
    ctx.save();
    if(active){ctx.shadowColor='#baff82';ctx.shadowBlur=15;}
    ctx.fillStyle=active?'#d9ff9d':'#d4dfef';
    ctx.fillRect(x,GROUND_Y-64,5,64);
    ctx.fillStyle=active?'#9cf36b':'#8d9bb0';
    ctx.beginPath();ctx.moveTo(x+5,GROUND_Y-62);ctx.lineTo(x+37,GROUND_Y-52);ctx.lineTo(x+5,GROUND_Y-40);ctx.closePath();ctx.fill();
    if(active){ctx.fillStyle='#eaffbf';ctx.beginPath();ctx.arc(x+5,GROUND_Y-65,4+Math.sin(time*7)*1.2,0,Math.PI*2);ctx.fill();}
    ctx.font='800 8px DM Sans, sans-serif'; ctx.textAlign='center'; ctx.fillStyle=active?'#eaffbf':'#e8edf5'; ctx.fillText(active?'SALVO':'CHECKPOINT',x+20,GROUND_Y-72); ctx.textAlign='start';
    ctx.restore();
  }

  function drawPlayer(time){
    const x=player.x-cameraX,y=player.y;
    if(player.invuln>0&&Math.floor(time*18)%2===0)return;
    const running=player.onGround&&(keys.ArrowRight||keys.d||keys.D||keys.ArrowLeft||keys.a||keys.A);
    const legSwing=running?Math.sin(player.runFrame)*5:0;
    ctx.save();ctx.translate(x+player.w/2,y+player.h/2);if(player.face<0)ctx.scale(-1,1);
    // Shadow
    ctx.globalAlpha=.2;ctx.fillStyle='#07101a';ctx.beginPath();ctx.ellipse(0,player.h/2+3,20,5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    // Legs and sneakers
    ctx.fillStyle='#24334c';ctx.fillRect(-10,10,8,15+Math.max(0,legSwing));ctx.fillRect(3,10,8,15-Math.max(0,legSwing));
    ctx.fillStyle='#f4f6e9';ctx.fillRect(-12,23+Math.max(0,legSwing),12,5);ctx.fillRect(2,23-Math.max(0,legSwing),12,5);
    // Body
    roundedRect(-13,-9,26,24,6,player.boost>0?'#64ddea':'#d8f06d','#263b38');
    ctx.fillStyle='#526c40';ctx.fillRect(-8,-3,16,4);
    // Backpack
    roundedRect(-17,-7,7,15,3,'#db8f53','#6e483a');
    // Head and hair
    ctx.fillStyle='#f1bd91';ctx.beginPath();ctx.arc(0,-17,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#503b39';ctx.beginPath();ctx.arc(-1,-21,12,Math.PI,Math.PI*2);ctx.lineTo(11,-16);ctx.lineTo(5,-17);ctx.lineTo(1,-22);ctx.lineTo(-6,-17);ctx.lineTo(-11,-17);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1d2738';ctx.fillRect(4,-17,3,3);
    // Scarf flick
    ctx.fillStyle=player.boost>0?'#aaf9ff':'#ff985e';ctx.beginPath();ctx.moveTo(-7,-8);ctx.lineTo(-21,-3+Math.sin(time*12)*2);ctx.lineTo(-11,1);ctx.closePath();ctx.fill();
    if(player.boost>0){ctx.globalAlpha=.5;ctx.strokeStyle='#8af4ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,27+Math.sin(time*18)*2,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }

  function drawGoal(level){
    const x=level.width-85-cameraX;
    if(x < -100 || x > W+100)return;
    ctx.fillStyle='#e7f0ef';ctx.fillRect(x,GROUND_Y-95,7,95);
    ctx.fillStyle='#d9f66f';ctx.beginPath();ctx.moveTo(x+7,GROUND_Y-95);ctx.lineTo(x+58,GROUND_Y-78);ctx.lineTo(x+7,GROUND_Y-60);ctx.closePath();ctx.fill();
    ctx.font='800 10px DM Sans, sans-serif';ctx.textAlign='center';ctx.fillStyle=level.theme===2?'#8cf9ec':'#fff';ctx.fillText('CHEGADA',x+23,GROUND_Y-107);
    ctx.textAlign='start';
  }

  function draw(time){
    const level=activeLevel();
    ctx.clearRect(0,0,W,H);
    ctx.save();
    if(cameraShake>0)ctx.translate((Math.random()-.5)*cameraShake*24,(Math.random()-.5)*cameraShake*18);
    drawBackground(level, time);
    drawGround(level);
    for(const obstacle of level.obstacles)drawObstacle(obstacle,time);
    for(const drone of (level.drones || []))drawObstacle(drone,time);
    if(collectibles){
      for(const coin of collectibles.coins)drawCoin(coin,time);
      for(const boost of collectibles.boosts)drawBoost(boost,time);
      for(const shield of collectibles.shields)drawShield(shield,time);
      for(const orb of collectibles.timeOrbs)drawTimeOrb(orb,time);
    }
    for(const checkpoint of checkpoints) drawCheckpoint(checkpoint,time);
    drawGoal(level);
    drawPlayer(time);
    for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x-cameraX,p.y,p.size,p.size);}ctx.globalAlpha=1;
    for (const t of floatingTexts) { ctx.globalAlpha=Math.min(1,t.life/.22); ctx.font='900 12px DM Sans, sans-serif'; ctx.textAlign='center'; ctx.lineWidth=3; ctx.strokeStyle='#08111dcc'; ctx.strokeText(t.text,t.x-cameraX,t.y); ctx.fillStyle=t.color; ctx.fillText(t.text,t.x-cameraX,t.y); } ctx.globalAlpha=1; ctx.textAlign='start';
    if(state==='playing'){
      roundedRect(18,18,142,26,7,'#0c172add','#35465b');
      ctx.fillStyle=player.dashCooldown<=0?'#d9f66f':'#acbad0';ctx.font='800 10px DM Sans,sans-serif';
      ctx.fillText(player.dashCooldown<=0?'ϟ DASH PRONTO':`ϟ DASH ${player.dashCooldown.toFixed(1)}s`,29,35);
      if(coinCombo>1 && comboTimer>0){roundedRect(W/2-75,18,150,28,8,'#382b12dd','#ffd467');ctx.fillStyle='#ffe59b';ctx.font='900 11px DM Sans,sans-serif';ctx.textAlign='center';ctx.fillText(`COMBO x${coinCombo}  +${(coinCombo-1)*25}`,W/2,36);ctx.textAlign='start';}
      if(player.boost>0){roundedRect(W-162,18,138,30,8,'#0c2334dd','#5ce7ed');ctx.fillStyle='#8cf4ff';ctx.font='800 11px DM Sans,sans-serif';ctx.fillText(`ϟ TURBO ${player.boost.toFixed(1)}s`,W-149,37);}
      if(player.shield>0){roundedRect(W-162,54,138,25,7,'#123b3add','#78f2e3');ctx.fillStyle='#a8fff4';ctx.font='800 10px DM Sans,sans-serif';ctx.fillText(`◇ ESCUDO ${player.shield.toFixed(1)}s`,W-149,70);}
      const progress=Math.min(1,player.x/(level.width-85));roundedRect(18,H-18,W-36,5,3,'#ffffff2b',null);roundedRect(18,H-18,(W-36)*progress,5,3,level.theme===2?'#56efda':'#d9f66f',null);
    }
    ctx.restore();
  }

  function frame(timestamp){
    const now=timestamp/1000;
    const dt=lastTime?Math.min(.033,now-lastTime):0;
    lastTime=now;
    update(dt);
    draw(now);
    requestAnimationFrame(frame);
  }

  function setKey(key, value){
    if(key==='Space') key=' ';
    keys[key]=value;
    if(value && (key===' '||key==='ArrowUp'||key==='w'||key==='W'))jumpBuffer=.14;
  }
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','ArrowUp',' ','Space'].includes(e.key))e.preventDefault();
    if((e.key==='Escape'||e.key.toLowerCase()==='p')&&!e.repeat){e.preventDefault();togglePause();return;}
    if(e.key==='Shift'&&!e.repeat&&state==='playing'&&player.dashCooldown<=0){
      player.dashTime=.18;player.dashCooldown=1.35;playSfx('dash');
      addBurst(player.x+player.w/2,player.y+player.h/2,'#7defff',9);
    }
    if(!e.repeat)setKey(e.key,true);
  });
  window.addEventListener('keyup',e=>setKey(e.key,false));
  window.addEventListener('blur',()=>{for(const k of Object.keys(keys))keys[k]=false;jumpBuffer=0;if(state==='playing')togglePause();});
  document.querySelectorAll('[data-key]').forEach(button=>{
    const key=button.dataset.key;
    const down=e=>{
      e.preventDefault();
      if(key==='Shift'){
        if(state==='playing'&&player.dashCooldown<=0){player.dashTime=.18;player.dashCooldown=1.35;playSfx('dash');addBurst(player.x+player.w/2,player.y+player.h/2,'#7defff',9);}
      }else setKey(key,true);
    };
    const up=e=>{e.preventDefault();if(key!=='Shift')setKey(key,false);};
    button.addEventListener('contextmenu',e=>e.preventDefault());
    button.addEventListener('pointerdown',down);
    button.addEventListener('pointerup',up);
    button.addEventListener('pointercancel',up);
    button.addEventListener('pointerleave',up);
  });

  $('difficulty-select').value = difficulty;
  $('difficulty-select').addEventListener('change', () => {
    difficulty = $('difficulty-select').value;
    writeStorage('cct-difficulty', difficulty);
  });

  $('pause-button').addEventListener('click', togglePause);
  $('audio-button').addEventListener('click', () => { soundEnabled = !soundEnabled; writeStorage('cct-sound', soundEnabled ? 'on' : 'off'); syncGameButtons(); if(soundEnabled)playSfx('coin'); });

  resetLevel();
  showOverlay({
    symbol:'🏁', kicker:'PRONTO PARA O DESAFIO?', title:'Chegue antes do tempo acabar!',
    copy:'Corra contra o cronômetro, use o salto duplo, pegue relógios para ganhar +6 segundos e ative bandeiras de checkpoint. Raios dão turbo, escudos bloqueiam impactos e Shift ativa a investida.',
    button:'Começar corrida', action:startGame, chooseDifficulty:true
  });
  requestAnimationFrame(frame);
})();
