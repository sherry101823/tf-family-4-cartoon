/* UI shell. All numerical settlement lives in engine.js. */
(() => {
  'use strict';
  const E = window.GameEngine;
  const app = document.querySelector('#app'), modal = document.querySelector('#modal');
  const times = ['上午', '下午', '晚上'];
  const symbols = { 唱功: '♫', 舞技: '◇', 演技: '◉', 魅力: '✧', 体能: '↗' };
  const KEY = 'fourth-light-v1-';
  let state = null, selected = 0, busy = false, performing = false, timer = null;
  let reduceMotion = false, storageOK = true;
  try { reduceMotion = localStorage.getItem(KEY + 'motion') === 'reduced'; localStorage.setItem(KEY + 'check', '1'); localStorage.removeItem(KEY + 'check'); } catch (_) { storageOK = false; }
  const esc = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function image(name, phase, kind) {
    const dirs = ['01_素描小头像', '02_彩绘素描半身立绘', '03_像素小人'];
    const era = ['01_小时候或刚公开', '02_中期', '03_2026年8月五公'][phase];
    const suffix = ['素描小头像', '彩绘素描半身立绘', '像素小人'][kind];
    return '../' + ['TF家族四代_三时期卡通形象', name, dirs[kind], `${name}_${era}_${suffix}.png`].map(encodeURIComponent).join('/');
  }
  function load(mode) {
    try { const s = JSON.parse(localStorage.getItem(KEY + mode)); return E.validSave(s, mode) ? s : null; } catch (_) { return null; }
  }
  function save() {
    if (!state) return;
    try { localStorage.setItem(KEY + state.mode, JSON.stringify(state)); } catch (_) { storageOK = false; }
  }
  function toast(text) {
    const el = document.querySelector('#toast'); el.textContent = text; el.classList.add('visible');
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('visible'), 3200);
  }
  function open(html, className = '') { if (modal.open) modal.close(); modal.className = className; modal.innerHTML = html; modal.showModal(); }
  function close() { if (modal.open) modal.close(); }
  const mini = (text, cls = '') => `<span class="eyebrow ${cls}">${text}</span>`;
  function shell(content, home = false) {
    document.body.dataset.phase = state ? E.PHASES[state.phase].color : 'green';
    document.body.classList.toggle('reduced', reduceMotion);
    app.innerHTML = `<header class="topbar"><button class="brand" data-act="home"><span class="brand-mark">肆</span><span>第肆束光<small>THE FOURTH LIGHT</small></span></button><nav><span class="nav-note">一份关于热爱的成长手记</span><button class="quiet" data-act="help">玩法指南</button><button class="quiet motion" data-act="motion" aria-pressed="${reduceMotion}">${reduceMotion ? '动画：简约' : '动画：轻盈'}</button></nav></header>${content}<footer><span>从练习室，到聚光灯下。</span><span>根据所提供资料改编 · 能力与出道结局为游戏设定</span></footer>`;
    app.querySelectorAll('img').forEach(img => { img.addEventListener('error', () => { img.style.visibility = 'hidden'; img.parentElement.classList.add('image-failed'); img.parentElement.dataset.fallback = img.alt + ' · 图片未加载'; }, { once: true }); });
  }
  function home() {
    if (timer) clearInterval(timer); performing = false; busy = false; close(); state = null; selected = 0;
    const solo = load('solo'), group = load('group');
    shell(`<main class="landing"><div class="hero-copy">${mini('GROWTH JOURNAL / 01')}<h1>还未亮起的灯，<br>也值得<span>奔赴。</span></h1><p>把每一段练习、每一次登场，写成自己的成长故事。<br>选择一位少年，或陪伴三个人一起走向舞台。</p><div class="hero-rule"><span>三段成长</span><i></i><span>24 日手记</span><i></i><span>两种陪伴</span></div></div><div class="hero-art"><div class="orbit"></div><img src="${image('张函瑞', 2, 1)}" alt="张函瑞出道期游戏立绘"><span class="art-note">从青涩，到闪耀<br><b>每一步都算数。</b></span><span class="hero-star">✧</span></div><section class="mode-grid"><article class="mode-card"><div class="mode-top">${mini('01 / SOLO')}<span class="pill">个人成长</span></div><h2>一个人的光</h2><p>张函瑞 · 在歌声与镜头之间，找到自己的声音。</p><div class="face-row"><img src="${image('张函瑞', 0, 0)}" alt="张函瑞头像"><span>独立日程 · 路线选择 · 成长记录</span></div><div class="mode-buttons"><button class="primary" data-act="start" data-mode="solo">写下第一天 <span>↗</span></button>${solo ? `<button class="secondary" data-act="continue" data-mode="solo">${solo.done ? '查看结局' : `继续 · 第 ${solo.day} 日`}</button>` : ''}</div></article><article class="mode-card group-card"><div class="mode-top">${mini('02 / TRIO')}<span class="pill">并肩同行</span></div><h2>三个人的舞台</h2><p>王橹杰、张桂源、左奇函 · 不同的光，汇成同一束。</p><div class="face-row trio">${['王橹杰', '张桂源', '左奇函'].map(n => `<img src="${image(n, 0, 0)}" alt="${n}头像">`).join('')}<span>个人培养 · 岗位分工 · 团队默契</span></div><div class="mode-buttons"><button class="primary" data-act="start" data-mode="group">一起出发 <span>↗</span></button>${group ? `<button class="secondary" data-act="continue" data-mode="group">${group.done ? '查看结局' : `继续 · 第 ${group.day} 日`}</button>` : ''}</div></article></section><div class="chapter-preview">${E.PHASES.map((p,i) => `<div><span>0${i+1}</span><b>${p.name}</b><small>${['初期 · 寻找', '中期 · 坚持', '出道期 · 抵达'][i]}</small></div>`).join('')}</div>${!storageOK ? '<p class="storage-warning">当前浏览器限制本地存档，请通过本地 HTTP 服务打开以保存进度。</p>' : ''}</main>`, true);
  }
  function gainText(v) { return Object.entries(v.gains).map(([k,x]) => `${k} +${x}`).join(' · ') || '留一点时间，恢复状态'; }
  function actionHint(s, p, a) {
    const v = E.preview(s,p,a);
    const extra = a.id === 'greet' ? ` · 人气 +${s.mode === 'group' ? 3 : 8}` : a.id === 'rehearse' ? ' · 默契 +6' : a.id === 'chat' ? ' · 默契 +3' : '';
    return `${gainText(v)}${extra}；压力 ${v.stress >= 0 ? '+' : ''}${v.stress}，疲劳 ${v.fatigue >= 0 ? '+' : ''}${v.fatigue}${v.cost ? `，星币 −${v.cost}` : ''}`;
  }
  function phaseSteps() {
    return `<div class="phase-steps">${E.PHASES.map((p,i) => `<div class="phase-step ${state.phase === i ? 'current' : state.phase > i ? 'completed' : ''}"><span>${state.phase > i ? '✓' : `0${i+1}`}</span><div><strong>${p.name}</strong><small>${p.subtitle.split(' · ')[0]}</small></div></div>`).join('')}</div>`;
  }
  function render() {
    if (!state) { home(); return; }
    if (state.done) { ending(); return; }
    const s = state, p = s.people[selected], phase = E.PHASES[s.phase];
    const progress = (s.day - 1) * 3 + s.cursor;
    shell(`<main class="dashboard">${phaseSteps()}<div class="day-heading"><div>${mini(`${phase.years} / CHAPTER 0${s.phase+1}`)}<h1>${phase.name}<span class="heading-dot">.</span></h1><p>${phase.subtitle.split(' · ')[1]}</p></div><div class="day-counter"><span>DAY</span><strong>${String(s.day).padStart(2,'0')}<small>/ 24</small></strong><div class="tiny-track"><i style="width:${progress/72*100}%"></i></div></div></div><div class="workspace"><section class="character-panel panel">${s.mode === 'group' ? `<div class="member-tabs" role="tablist" aria-label="查看成员">${s.people.map((x,i) => `<button role="tab" aria-selected="${selected===i}" class="${selected===i?'active':''}" data-act="member" data-index="${i}">${x.name}</button>`).join('')}</div>` : `<div class="card-heading">${mini('YOUR ARTIST')}<span class="pill">单人养成</span></div>`}<div class="portrait-frame"><img class="portrait" src="${image(p.name,s.phase,1)}" alt="${p.name} · 第 ${s.phase+1} 阶段立绘"><span class="portrait-sticker">${['FIRST LIGHT', 'KEEP GROWING', 'IN THE SPOTLIGHT'][s.phase]}</span><button class="character-touch" data-act="touch" aria-label="与${p.name}互动">✧ 和他聊聊</button></div><div class="character-name"><h2>${p.name}</h2><span>${s.mode==='group'?E.PEOPLE[p.name].role:'培养方向：'+(s.route==='music'?'音乐':'影视')}</span></div><p class="character-quote">「${E.PEOPLE[p.name].title}」</p><div class="condition-row">${condition('压力',p.stress)}${condition('疲劳',p.fatigue)}</div>${E.status(p)?'<p class="danger-note">状态超过 15，下一格请安排恢复。</p>':''}<div class="pixel-corner"><img id="active-pixel" src="${image(p.name,s.phase,2)}" alt="${p.name}像素形象"><div><b>${p.fatigue>10?'先歇一会儿吧。':p.stress>10?'慢一点，也没关系。':'今天，也想认真练习。'}</b><small>点击角色，听一句此刻的心情</small></div></div></section><section class="schedule-panel panel"><div class="card-heading"><div>${mini('TODAY’S PLAN')}<h2>把今天，安排好</h2></div><span class="pill">${s.mode==='group'?'三人共同成长':'三段日程'}</span></div><div class="plan-tools"><button class="text-button" data-act="auto">✧ 建议日程</button><button class="text-button" data-act="copy" ${!s.previousPlan?'disabled':''}>复制昨天</button><button class="text-button" data-act="rest">${s.mode==='group'?'全员':'今日'}休息</button></div><div class="schedule-list">${times.map((t,slot)=>scheduleRow(t,slot)).join('')}</div><div class="execution-bar"><p>${s.day%8===0?'今天有阶段演出，请预留体力。':'计划可以随时修改，已执行的时段会锁定。'}</p><button class="primary execute" data-act="execute" ${busy?'disabled':''}>${busy?'正在执行…':s.day%8===0&&s.cursor===2?'进入阶段舞台':'执行'+times[s.cursor]+'日程'} <span>→</span></button></div><div class="scene-strip"><span class="scene-title">${s.mode==='group'?'OUR PRACTICE ROOM':'PRACTICE ROOM'}</span><div class="practice-floor">${s.people.map(x=>`<div class="pixel-actor"><img src="${image(x.name,s.phase,2)}" alt="${x.name}练习室像素形象"><span>${x.name}</span></div>`).join('')}</div><span class="scene-caption">每一次重复，都在靠近舞台。</span></div></section><aside class="right-column"><section class="panel stats-panel"><div class="card-heading">${mini('GROWTH / '+p.name)}<span class="stat-limit">0 — 200</span></div>${E.ATTRS.map(k=>`<div class="stat-row"><div><span>${symbols[k]} ${k}</span><b>${p.stats[k].toFixed(1)}</b></div><div class="stat-track"><i style="width:${p.stats[k]/200*100}%"></i><span style="left:${phase.target/2}%"></span></div></div>`).join('')}<div class="resource-grid"><div><small>星币</small><b>${s.coins}<span>◈</span></b></div><div><small>${s.mode==='group'?'团体人气':'人气'}</small><b>${s.fans}<span>✧</span></b></div><div><small>口碑</small><b>${s.reputation}<span>/100</span></b></div>${s.mode==='group'?`<div><small>默契</small><b>${s.bond}<span>/100</span></b></div>`:''}</div></section><section class="panel goals-panel">${mini('THIS CHAPTER')}<h3>下一束光</h3><div class="goal-item"><span class="goal-check ${p.stats[E.mainAttr(s,p)]>=phase.target?'checked':''}">✓</span><div><b>${E.mainAttr(s,p)}达到 ${phase.target}</b><small>当前 ${p.stats[E.mainAttr(s,p)].toFixed(1)} · 阶段成长参考</small></div></div><div class="goal-item"><span class="goal-check ${s.fans>=phase.fans?'checked':''}">✓</span><div><b>人气达到 ${phase.fans}</b><small>互动和演出让努力被看见</small></div></div>${s.mode==='group'?`<div class="goal-item"><span class="goal-check ${s.bond>=phase.bond?'checked':''}">✓</span><div><b>默契达到 ${phase.bond}</b><small>共同排练与队友聊天</small></div></div>`:''}<div class="upcoming"><span>第 ${(s.phase+1)*8} 日 / 阶段演出</span><b>${phase.show}</b></div></section></aside></div><section class="journal panel"><div class="card-heading"><div>${mini('LITTLE MOMENTS')}<h2>成长不是无声的</h2></div><button class="text-button" data-act="journal">查看完整手记 ↗</button></div><div class="journal-entries">${s.history.length?s.history.slice(0,3).map(x=>`<div><span>DAY ${String(x.day).padStart(2,'0')}</span><p>${esc(x.text)}</p></div>`).join(''):'<div><span>DAY 01</span><p>新的练习室，新的第一天。故事从你安排的第一段日程开始。</p></div>'}</div></section><div class="save-note">${storageOK?'● 已自动保存 · 两种模式独立存档':'本地存档不可用，请使用本地 HTTP 打开'}<button class="text-button" data-act="restart">重新开始</button></div></main>`);
  }
  function condition(label,value) { return `<div class="condition"><span>${label}<b class="${value>=15?'danger':''}">${value} / 15</b></span><div class="condition-track"><i class="${value>=11?'warn':''}" style="width:${Math.min(value/15*100,100)}%"></i></div></div>`; }
  function scheduleRow(t,slot) {
    const s=state, finished=slot<s.cursor, current=slot===s.cursor, show=s.day%8===0&&slot===2;
    return `<div class="schedule-row ${finished?'finished':''} ${current?'current':''}"><div class="time-label"><span>0${slot+1}</span><b>${t}</b><small>${finished?'已完成':show?'公演':current?'即将执行':'待安排'}</small></div><div class="schedule-people">${show?`<div class="show-booking"><span>✦</span><div><b>${E.PHASES[s.phase].show}</b><small>三段节目 · ${s.mode==='group'?'岗位分工 · ':''}舞台互动 · 成果结算</small></div></div>`:s.people.map((p,i)=>{
      const a=E.getAction(s.plan[slot][i]);
      const reason=a&&!finished?E.lock(s,p,a):'';
      return `<button class="schedule-pick ${reason?'invalid':''}" data-act="pick" data-slot="${slot}" data-index="${i}" ${finished?'disabled':''}><span class="pick-person">${s.mode==='group'?p.name:'我的日程'}<small>${finished?'✓':reason?'需调整':'↗'}</small></span><b>${a?a.label:'选择一个行动'}</b><small>${reason|| (a?gainText(E.preview(s,p,a)):'训练、恢复或互动')}</small></button>`;
    }).join('')}</div></div>`;
  }
  function picker(slot,index) {
    const p=state.people[index];
    open(`<div class="modal-heading">${mini(`DAY ${state.day} / ${times[slot]}`)}<button class="close" data-act="close" aria-label="关闭">×</button><h2>为${p.name}安排日程</h2><p>行动前的疲劳会影响训练收益；达到 15 后先恢复。</p></div><div class="action-grid">${E.ACTIONS.filter(a=>state.mode==='group'||a.category!=='团队').map(a=>{
      const reason=E.lock(state,p,a);
      return `<button class="action-card ${reason?'locked':''}" data-act="choose" data-id="${a.id}" data-slot="${slot}" data-index="${index}" ${reason?'disabled':''}><span class="action-category">${a.category}${a.category==='团队'?' · 全员同一格':''}</span><b>${a.label}${a.cost?`<small>◈ ${a.cost}</small>`:''}</b><p>${esc(reason||actionHint(state,p,a))}</p></button>`;
    }).join('')}</div>`, 'picker-modal');
  }
  function pending() {
    if (!state?.pending) return;
    const p=state.pending;
    if (p.type==='event') {
      const e=E.EVENTS.find(x=>x.id===p.id);
      open(`<div class="event-art"><img src="${image(state.people[0].name,state.phase,0)}" alt="事件角色头像"><span>成长的另一面</span></div><div class="event-content">${mini(`资料背景 / ${e.year} · ${e.source}`)}<h2>${e.title}</h2><p>${e.text}</p><div class="event-options">${e.options.map((o,i)=>`<button data-act="event" data-index="${i}"><b>${o.label} <span>↗</span></b><small>${o.hint}</small></button>`).join('')}</div><small class="fiction-note">事件选项、收益与对话为游戏改编。</small></div>`, 'event-modal');
    } else if(p.type==='random') {
      open(`<div class="modal-heading">${mini('A LITTLE MOMENT')}<h2>${state.mode==='group'?'队友递来一本练习笔记':'老师停下脚步，听完了这一遍'}</h2><p>${state.mode==='group'?'把一个人发现的小窍门，变成三个人的进步。':'有时，进步只需要一点新的视角。'}</p></div><div class="event-options padded"><button data-act="random" data-index="0"><b>分享心得，认真请教 ↗</b><small>全员主项 +3 · 压力 +1${state.mode==='group'?' · 默契 +3':''}</small></button><button data-act="random" data-index="1"><b>今天先把自己照顾好 ↗</b><small>全员压力 −3 · 疲劳 −2</small></button></div>`, 'small-modal');
    } else if(p.type==='show') showSetup();
    else if(p.type==='result') showResult(p.result);
  }
  function showSetup() {
    const s=state;
    const options=(slot,p)=>E.BEATS.filter(b=>b.slot===slot).map(b=>{
      const attr=b.attr==='main'?E.mainAttr(s,p):b.attr;
      const blocked=slot==='main'?p.stats[attr]<b.gate:s.people.some(x=>x.stats[attr]<b.gate);
      return `<option value="${b.id}" ${blocked?'disabled':''}>${b.label}${b.gate?` · ${attr}≥${b.gate}`:''}${blocked?'（未达标）':''}</option>`;
    }).join('');
    open(`<div class="modal-heading">${mini(`CHAPTER 0${s.phase+1} / LIVE STAGE`)}<h2>${E.PHASES[s.phase].show}</h2><p>让练习变成一次被看见的登场。节目可以自由选择，评分主要由培养结果决定。</p></div><div class="show-form"><label><span>01 / 开场</span><select id="show-open">${options('open',s.people[0])}</select></label><div class="show-main-label">02 / 主表现${s.mode==='group'?' · 为每位成员安排岗位':''}</div>${s.people.map((p,i)=>`<label class="member-program"><span>${p.name}${s.mode==='group'?' · '+E.PEOPLE[p.name].role:''}</span><select id="show-main-${i}">${options('main',p)}</select></label>`).join('')}<label><span>03 / 收尾</span><select id="show-close">${options('close',s.people[0])}</select></label><div class="show-preview" id="show-preview"></div><p class="muted">阶段演出占今晚一格。全场压力 +3、疲劳 +5（体能可减耗）；奖励结算一次。</p><button class="primary full" data-act="perform">亮起聚光灯 <span>✧</span></button></div>`, 'show-modal');
    updatePreview();
  }
  function getPicks() { return { open:document.querySelector('#show-open').value, close:document.querySelector('#show-close').value, mains:state.people.map((_,i)=>document.querySelector(`#show-main-${i}`).value) }; }
  function updatePreview() {
    try {
      const r=E.evaluate(state,getPicks(),0);
      document.querySelector('#show-preview').innerHTML=`<span>预计舞台评分</span><b>${r.score}<small>/100</small></b><span>人气 +${r.fans} · 星币 +${r.coins}<br><small>互动最多额外 +5 分</small></span>`;
    } catch(err) { document.querySelector('#show-preview').textContent=err.message; }
  }
  function runShow() {
    if(performing) return;
    let picks; try { picks=getPicks(); E.evaluate(state,picks,0); } catch(err) { toast(err.message); return; }
    performing=true;
    open(`<div class="live-stage"><div class="spotlight a"></div><div class="spotlight b"></div><span class="live-label">LIVE / ${esc(E.PHASES[state.phase].show)}</span><h2>这一刻，你在光里。</h2><div class="live-actors">${state.people.map(p=>`<div><img src="${image(p.name,state.phase,2)}" alt="${p.name}舞台像素形象"><span>${p.name}</span></div>`).join('')}</div><div class="stage-floor"></div><div class="sparkles">✧ &nbsp; · &nbsp; ✧ &nbsp; · &nbsp; ✧</div><div class="tap-zone"><span id="live-count">为他们点亮应援 · 4 秒</span><button class="tap-button" data-act="tap">✦ 点亮应援 <b id="tap-num">0 / 5</b></button><small>每次应援 +1 分，最多 +5；也可以直接完成。</small><button class="stage-skip" data-act="skip-show">完成演出 →</button></div></div>`, 'live-modal');
    let taps=0, seconds=4;
    const settle=()=>{
      if(!performing) return;
      performing=false; if(timer) clearInterval(timer); timer=null;
      try { E.perform(state,picks,taps); save(); render(); pending(); } catch(err) { toast(err.message); pending(); }
    };
    runShow.tap=()=>{ if(taps>=5||!performing) return; taps++; document.querySelector('#tap-num').textContent=`${taps} / 5`; document.querySelector('.tap-button').classList.remove('popped'); void document.querySelector('.tap-button').offsetWidth; document.querySelector('.tap-button').classList.add('popped'); };
    runShow.settle=settle;
    timer=setInterval(()=>{ seconds--; const label=document.querySelector('#live-count'); if(label)label.textContent=`为他们点亮应援 · ${seconds} 秒`; if(seconds<=0)settle(); },1000);
  }
  function showResult(r) {
    const s=state;
    const average=s.people.reduce((n,p)=>n+p.stats[E.mainAttr(s,p)],0)/s.people.length;
    open(`<div class="result-top">${mini('THE STAGE REMEMBERS')}<span class="result-score">${r.score}<small>/100</small></span><h2>${r.missed?'先休息，舞台会等你。':r.score>=85?'这束光，终于被看见。':r.score>=60?'再靠近一点点。':'下一次，会更从容。'}</h2><p>${r.name}</p></div><div class="result-content"><div class="result-rewards"><div><small>新增人气</small><b>+${r.fans}</b></div><div><small>获得星币</small><b>+${r.coins}</b></div><div><small>阶段主项均值</small><b>${average.toFixed(1)}</b></div></div><div class="score-reasons">${r.reasons.map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="evolution-row">${s.people.map(p=>`<div><img src="${image(p.name,s.phase,0)}" alt="${p.name}阶段回顾"><b>${p.name}</b><small>${E.mainAttr(s,p)} ${p.stats[E.mainAttr(s,p)].toFixed(1)}</small></div>`).join('')}</div><p class="muted">${s.phase<2?'阶段考核不会阻止成长。下一章将解锁新的形象与机会。':'这是游戏内的假想出道舞台，成长还会继续。'}</p><button class="primary full" data-act="finish-result">${s.phase<2?'翻开下一章':'收下这份成长手记'} <span>→</span></button></div>`, 'result-modal');
  }
  function ending() {
    const s=state, e=E.ending(s);
    shell(`<main class="ending-page">${mini('THE FOURTH LIGHT / FINAL JOURNAL')}<div class="ending-title"><span class="ending-rank">${e.rank}</span><h1>${e.title}</h1><p>${e.subtitle}</p></div><div class="ending-cast">${s.people.map(p=>`<div><img src="${image(p.name,2,1)}" alt="${p.name}最终立绘"><b>${p.name}</b></div>`).join('')}</div><div class="ending-summary panel"><div><small>走过的日子</small><b>24 <span>日</span></b></div><div><small>积累的人气</small><b>${s.fans}</b></div><div><small>最终口碑</small><b>${s.reputation}</b></div>${s.mode==='group'?`<div><small>团队默契</small><b>${s.bond}</b></div>`:''}</div><section class="panel final-growth"><div class="card-heading"><div>${mini('BEFORE / AFTER')}<h2>每一步，都留下了痕迹</h2></div><button class="text-button" data-act="journal">查看成长手记 ↗</button></div><div class="growth-grid">${s.people.map(p=>`<div><h3>${p.name}</h3>${E.ATTRS.map((k,i)=>`<div class="final-stat"><span>${k}</span><div><i class="before" style="width:${E.PEOPLE[p.name].stats[i]/2}%"></i><i class="after" style="width:${p.stats[k]/2}%"></i></div><b>${E.PEOPLE[p.name].stats[i]} → ${p.stats[k].toFixed(1)}</b></div>`).join('')}</div>`).join('')}</div></section><div class="final-shows">${s.shows.map(r=>`<article class="panel">${mini(`CHAPTER 0${r.phase+1}`)}<h3>${r.name}</h3><strong>${r.score}<small>/100</small></strong><p>${r.missed?'恢复也是成长的一部分。':r.score>=85?'被看见的一次闪耀。':r.score>=60?'值得记录的一次进步。':'为下一次舞台积累。'}</p></article>`).join('')}</div><p class="ending-note">人物能力、培养对话、团体编制与出道结局均为游戏设定。<br>背景资料采用用户提供的 2021–2026 时间线；三时期素材按游戏阶段展示。</p><div class="ending-buttons"><button class="primary" data-act="restart">再写一份新的故事 ↗</button><button class="secondary" data-act="home">体验另一种陪伴</button></div></main>`);
  }
  function help() {
    open(`<div class="modal-heading">${mini('HOW TO PLAY')}<button class="close" data-act="close" aria-label="关闭">×</button><h2>一点一点，走到光里</h2><p>先安排日程，再执行每一格。24 日之后，收下你的成长手记。</p></div><div class="help-content"><div><span>01</span><p><b>练习让能力成长</b><br>唱功、舞技、演技、魅力、体能影响不同的舞台表现。鼠标点击日程卡可以查看精确收益与费用。</p></div><div><span>02</span><p><b>努力，也需要恢复</b><br>疲劳 0–5 / 6–10 / 11–14 时，训练效率为 100% / 80% / 50%。疲劳或压力达到 15 后，本格必须恢复。休息不花星币，但占用时间。</p></div><div><span>03</span><p><b>舞台是练习的回声</b><br>第 8、16、24 日晚有阶段演出。选择开场、主表现与收尾，应援最多 +5 分；分数由属性准备度、疲劳和团体默契决定。</p></div><div><span>04</span><p><b>三个人，一起靠近</b><br>团体分别安排三人的日程，星币共用。共同排练或队友聊天占全员同一格。演出看平均表现、最低准备度和默契。</p></div><div><span>05</span><p><b>每一次选择都被记录</b><br>第 11 日事件选择音乐/影视方向；单人主项随路线变化。阶段目标为参考，不会卡住章节。过劳缺席会得到恢复结算，仍可继续。</p></div><p class="muted">音乐/影视路线、角色能力、事件收益与三人组合是游戏设定。页面不播放原作品音视频。档案按两种模式独立自动保存在当前浏览器，清除浏览器数据会移除存档。</p></div>`, 'help-modal');
  }
  function confirmStart(mode, existing) {
    if(!existing) { begin(mode); return; }
    open(`<div class="modal-heading">${mini('NEW JOURNAL')}<button class="close" data-act="close" aria-label="关闭">×</button><h2>重新写下第一天？</h2><p>这会覆盖${mode==='solo'?'单人':'团体'}模式的现有存档，另一种模式会保留。</p></div><div class="confirm-buttons"><button class="secondary" data-act="close">保留当前故事</button><button class="primary" data-act="confirm-start" data-mode="${mode}">开始新的故事</button></div>`, 'small-modal');
  }
  function begin(mode,saved) { close(); state=saved||E.create(mode); selected=0; save(); render(); pending(); if(!saved)toast('故事开始了。试试“建议日程”，也可以亲自安排。'); }
  async function execute() {
    if(busy||!state) return;
    const result=E.execute(state);
    if(result.error){toast(result.error); return;}
    save(); busy=true;
    if(result.feedback){
      document.querySelectorAll('.pixel-actor, #active-pixel').forEach(x=>x.classList.add('training'));
      const p=result.feedback.find(x=>x.name===state.people[selected].name)||result.feedback[0];
      toast(`${p.name} · ${p.action}：${gainText(p)}`);
      await new Promise(r=>setTimeout(r,reduceMotion?0:450));
    }
    busy=false; render(); pending();
  }
  app.addEventListener('click',dispatch); modal.addEventListener('click',dispatch);
  modal.addEventListener('change',event=>{if(event.target.tagName==='SELECT'&&state?.pending?.type==='show')updatePreview();});
  modal.addEventListener('cancel',event=>{ if(state?.pending || performing)event.preventDefault(); });
  document.addEventListener('click',event=>{ if(event.target===modal&&!state?.pending&&!performing)close(); });
  function dispatch(event) {
    const b=event.target.closest('[data-act]'); if(!b||b.disabled)return;
    const act=b.dataset.act;
    if(busy&&act!=='motion')return;
    switch(act){
      case 'home': save(); home(); break;
      case 'help': help(); break;
      case 'motion': reduceMotion=!reduceMotion; try{localStorage.setItem(KEY+'motion',reduceMotion?'reduced':'full');}catch(_){} render(); break;
      case 'start': confirmStart(b.dataset.mode,load(b.dataset.mode)); break;
      case 'confirm-start': begin(b.dataset.mode); break;
      case 'continue': { const s=load(b.dataset.mode); if(s)begin(b.dataset.mode,s); else toast('存档不可用，请开始新的故事。'); break; }
      case 'restart': confirmStart(state.mode,true); break;
      case 'close': close(); break;
      case 'member': selected=Number(b.dataset.index); render(); break;
      case 'pick': picker(Number(b.dataset.slot),Number(b.dataset.index)); break;
      case 'choose': E.assign(state,Number(b.dataset.slot),Number(b.dataset.index),b.dataset.id); close(); save(); render(); break;
      case 'auto': E.autoPlan(state); save(); render(); toast('已安排剩余时段；执行前仍会检查状态。'); break;
      case 'copy': if(state.previousPlan){ for(let t=state.cursor;t<3;t++){if(state.day%8===0&&t===2)continue;state.plan[t]=state.previousPlan[t].filter(x=>E.getAction(x)).slice();}save();render();toast('已复制，请留意今天的状态和课程费用。');}break;
      case 'rest': for(let t=state.cursor;t<3;t++)if(!(state.day%8===0&&t===2))state.plan[t]=state.people.map(()=>'rest');save();render();break;
      case 'execute': execute();break;
      case 'event': E.chooseEvent(state,Number(b.dataset.index));close();save();render();pending();break;
      case 'random': E.chooseRandom(state,Number(b.dataset.index));close();save();render();pending();break;
      case 'perform': runShow();break;
      case 'tap': runShow.tap?.();break;
      case 'skip-show': runShow.settle?.();break;
      case 'finish-result': E.finishResult(state);close();save();render();pending();if(!state.done)toast('下一章开始了，新的形象已解锁。');break;
      case 'touch': { const p=state.people[selected]; const phrases=E.status(p)?['今天想先歇一会儿。','慢一点，明天会更好。']:['再练一次，这次一定更好。','谢谢你陪我走到这里。','今天的努力，也会被记得。'];toast(`${p.name}：「${phrases[Math.floor(Math.random()*phrases.length)]}」`);document.querySelector('#active-pixel')?.classList.add('training');setTimeout(()=>document.querySelector('#active-pixel')?.classList.remove('training'),700);break; }
      case 'journal': open(`<div class="modal-heading">${mini('GROWTH JOURNAL')}<button class="close" data-act="close" aria-label="关闭">×</button><h2>那些一点一滴的成长</h2><p>每一次练习，每一个选择，都被记住了。</p></div><div class="full-journal">${state.history.map(x=>`<div><span>DAY ${x.day}</span><p>${esc(x.text)}</p></div>`).join('')||'<p>手记从第一段日程开始。</p>'}</div>`,'journal-modal');break;
    }
  }
  window.addEventListener('pagehide',save);
  home();
})();
