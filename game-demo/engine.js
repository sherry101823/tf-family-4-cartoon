(function (root) {
  'use strict';
  const ATTRS = ['唱功', '舞技', '演技', '魅力', '体能'];
  const PEOPLE = {
    '张函瑞': { title: '把声音，唱给更远的地方', role: '声乐', main: '唱功', stats: [45, 30, 35, 35, 30] },
    '王橹杰': { title: '每一次开麦，都是新的开始', role: '主唱', main: '唱功', stats: [45, 30, 30, 35, 30] },
    '张桂源': { title: '用每一个舞步，靠近聚光灯', role: '舞蹈', main: '舞技', stats: [30, 45, 30, 35, 30] },
    '左奇函': { title: '在舞台与镜头之间，找到自己', role: '串联', main: '魅力', stats: [35, 30, 35, 45, 30] }
  };
  const PHASES = [
    { name: '众里寻他千百度', subtitle: '初期 · 一切从练习室开始', years: '2021 — 2023', target: 60, fans: 80, bond: 30, show: '立夏 · 初次亮相', color: 'green' },
    { name: '衣带渐宽终不悔', subtitle: '中期 · 把热爱写进每一天', years: '2024 — 2025', target: 100, fans: 220, bond: 50, show: '肆意少年 · 成长舞台', color: 'blue' },
    { name: '灯火阑珊处', subtitle: '出道期 · 终于走到光里', years: '2026 · 假想出道', target: 150, fans: 500, bond: 70, show: '第肆束光 · 出道舞台', color: 'gold' }
  ];
  // [id, label, category, attribute gains, stress, fatigue, cost, gate]
  const ACTIONS = [
    ['breath', '气息练习', '声乐', { 唱功: 5, 体能: 2 }, 2, 3, 0],
    ['voice', '发声练习', '声乐', { 唱功: 8 }, 3, 4, 0],
    ['pitch', '音准训练', '声乐', { 唱功: 6, 魅力: 1 }, 2, 3, 0],
    ['dance', '基础律动', '舞蹈', { 舞技: 6, 体能: 2 }, 3, 4, 0],
    ['rhythm', '节奏练习', '舞蹈', { 舞技: 7, 唱功: 2 }, 3, 4, 0],
    ['lines', '台词练习', '表演', { 演技: 6, 魅力: 2 }, 2, 3, 0],
    ['expression', '表情训练', '表演', { 演技: 5, 魅力: 4 }, 2, 3, 0],
    ['posture', '形体练习', '形象', { 魅力: 6, 体能: 2 }, 2, 3, 0],
    ['core', '核心训练', '体能', { 体能: 8 }, 3, 5, 0],
    ['high', '高音突破', '进阶', { 唱功: 15, 体能: 5 }, 6, 8, 30, '唱功'],
    ['combo', '连舞训练', '进阶', { 舞技: 12, 体能: 5 }, 5, 7, 30, '舞技'],
    ['audition', '试镜表演', '进阶', { 演技: 12 }, 5, 6, 30, '演技'],
    ['redcarpet', '红毯走位', '进阶', { 魅力: 12, 演技: 5 }, 4, 5, 30, '魅力'],
    ['rest', '喝水休息', '恢复', {}, -5, -5, 0],
    ['diary', '写下心事', '恢复', { 魅力: 1 }, -7, -3, 0],
    ['greet', '录制问候', '互动', { 魅力: 2 }, 1, 2, 0],
    ['review', '看舞台回放', '互动', { 演技: 2, 唱功: 2 }, -2, 1, 0],
    ['rehearse', '共同排练', '团队', {}, 2, 4, 0],
    ['chat', '队友聊天', '团队', {}, -3, -2, 0]
  ].map(([id, label, category, gains, stress, fatigue, cost, gate]) => ({ id, label, category, gains, stress, fatigue, cost, gate }));
  const EVENTS = [
    { id: 'sports', day: 3, year: '2022', title: '夏日的第一次集结', source: '夏日运动会', text: '站在练习室之外，第一次发现：成长也可以发生在跑道上。今天，你想如何留下这份回忆？', options: [ { label: '认真参加体能挑战', hint: '全员体能 +5 · 疲劳 +2', gains: { 体能: 5 }, fatigue: 2 }, { label: '记录一段问候视频', hint: '人气 +20 · 全员魅力 +2', fans: 20, gains: { 魅力: 2 } } ] },
    { id: 'dopamine', day: 6, year: '2023', title: '舞台上的多巴胺', source: '《多巴胺快乐图鉴》', text: '灯光还没亮，心跳已经响了起来。看过舞台资料之后，你准备把最后的时间留给什么？', options: [ { label: '再听一次自己的声音', hint: '全员唱功 +6 · 压力 +2', gains: { 唱功: 6 }, stress: 2 }, { label: '把走位练到整齐', hint: '全员舞技 +6 · 疲劳 +2', gains: { 舞技: 6 }, fatigue: 2 } ] },
    { id: 'ost', day: 11, year: '2024', title: '镜头前，或麦克风前', source: '《危险的关系》与 OST', text: '作品让少年们走出了练习室。参考资料中，张函瑞与王橹杰参与 OST，张桂源与左奇函参演。培养路线，从这里写下自己的选择。', options: [ { label: '打磨一段情感演唱', hint: '音乐路线 · 全员唱功 +8 · 压力 +2', route: 'music', gains: { 唱功: 8 }, stress: 2 }, { label: '尝试一段镜头表演', hint: '影视路线 · 全员演技 +8 · 压力 +2', route: 'film', gains: { 演技: 8 }, stress: 2 } ] },
    { id: 'love', day: 14, year: '2025', title: '让热爱变得具体', source: '《热爱》《肆意少年》', text: '一次又一次的公演，把陌生的观众变成了熟悉的应援。有限的资源，是投入训练，还是与观众分享这一路？', options: [ { label: '争取一份训练支持', hint: '星币 +120 · 全员压力 +2', coins: 120, stress: 2 }, { label: '分享成长手记', hint: '人气 +35 · 口碑 +3', fans: 35, reputation: 3 } ] },
    { id: 'youth', day: 19, year: '2026', title: '少年时代的新一页', source: '《我们的少年时代2》项目', text: '提供的时间线记录了八名成员进入影视主演线。今天的培养选择，也可以让舞台表现与镜头表达互相滋养。', options: [ { label: '读懂角色的情绪', hint: '全员演技 +10 · 压力 +2', gains: { 演技: 10 }, stress: 2 }, { label: '为角色写一段旋律', hint: '全员唱功 +8 · 魅力 +3', gains: { 唱功: 8, 魅力: 3 } } ] },
    { id: 'quadrant', day: 22, year: '2026', title: '向第肆象限出发', source: '《突围Ⅱ 破局》《第肆象限》', text: '集训、访谈、舞台，都是一路走来的注脚。最后一次登场之前，你想对自己说些什么？', options: [ { label: '我们还可以更好', hint: '主项 +8 · 压力 +3 · 团体默契 +5', main: 8, stress: 3, bond: 5 }, { label: '已经很努力，先喘口气', hint: '全员压力 −5 · 疲劳 −5 · 口碑 +2', stress: -5, fatigue: -5, reputation: 2 } ] }
  ];
  const BEATS = [
    { id: 'entrance', label: '舞台登场', attr: '魅力', gate: 0, recommended: [45, 70, 100], fans: 10, coins: 50, slot: 'open' },
    { id: 'wave', label: '挥手问候', attr: '魅力', gate: 0, recommended: [40, 65, 90], fans: 8, coins: 30, slot: 'open' },
    { id: 'basic', label: '练习成果展示', attr: 'main', gate: 0, recommended: [60, 100, 150], fans: 15, coins: 80, slot: 'main' },
    { id: 'sing', label: '主歌演唱', attr: '唱功', gate: 50, recommended: [60, 100, 150], fans: 15, coins: 80, slot: 'main' },
    { id: 'chorus', label: '副歌爆发', attr: '唱功', gate: 100, recommended: [100, 120, 150], fans: 25, coins: 150, slot: 'main' },
    { id: 'highnote', label: '高音展示', attr: '唱功', gate: 150, recommended: [150, 150, 160], fans: 40, coins: 300, slot: 'main' },
    { id: 'solo', label: '舞蹈 solo', attr: '舞技', gate: 100, recommended: [100, 120, 150], fans: 30, coins: 200, slot: 'main' },
    { id: 'acting', label: '镜头独白', attr: '演技', gate: 50, recommended: [60, 100, 150], fans: 20, coins: 100, slot: 'main' },
    { id: 'bow', label: '谢幕鞠躬', attr: '魅力', gate: 0, recommended: [40, 65, 90], fans: 5, coins: 0, slot: 'close' },
    { id: 'heart', label: '比心回应', attr: '魅力', gate: 50, recommended: [50, 80, 100], fans: 20, coins: 100, slot: 'close' },
    { id: 'ending', label: 'ending pose', attr: '魅力', gate: 80, recommended: [80, 90, 110], fans: 20, coins: 100, slot: 'close' }
  ];
  const clamp = (x, min = 0, max = 200) => Math.max(min, Math.min(max, x));
  const round = x => Math.round(x * 10) / 10;
  const person = name => ({ name, stats: Object.fromEntries(ATTRS.map((k, i) => [k, PEOPLE[name].stats[i]])), stress: 0, fatigue: 0, exposure: 0 });
  function create(mode) {
    if (!['solo', 'group'].includes(mode)) throw Error('未知模式');
    return { version: 1, mode, phase: 0, day: 1, cursor: 0, people: (mode === 'solo' ? ['张函瑞'] : ['王橹杰', '张桂源', '左奇函']).map(person), coins: mode === 'solo' ? 300 : 900, fans: 0, reputation: 20, bond: 20, route: 'music', plan: Array.from({ length: 3 }, () => []), previousPlan: null, history: [], completedEvents: [], pending: null, shows: [], snapshots: [], seed: 931, randomDays: [], started: Date.now(), done: false };
  }
  function mainAttr(s, p) { return s.mode === 'solo' && s.route === 'film' ? '演技' : PEOPLE[p.name].main; }
  function modifier(x) { return x < 100 ? 1 : x < 150 ? 0.85 : 0.7; }
  function fatigued(x) { return x <= 5 ? 1 : x <= 10 ? 0.8 : 0.5; }
  function fatigueCost(p, x) { return x <= 0 ? x : Math.max(1, x - Math.min(3, Math.floor(p.stats['体能'] / 50))); }
  function status(p) { return p.stress >= 15 || p.fatigue >= 15; }
  function getAction(id) { return ACTIONS.find(a => a.id === id); }
  function lock(s, p, a) {
    if (!a) return '请选择日程';
    if (a.category === '团队' && s.mode !== 'group') return '仅团体模式';
    if (status(p) && !['rest', 'diary', 'chat'].includes(a.id)) return '状态过高，本格需要恢复';
    if (a.gate && (s.phase === 0 || p.stats[a.gate] < 100)) return `中期且${a.gate}达到 100 后解锁`;
    if (a.cost > s.coins) return '星币不足，可选择免费基础训练';
    return '';
  }
  function preview(s, p, a) {
    const gains = { ...a.gains };
    if (a.id === 'rehearse') gains[mainAttr(s, p)] = 4;
    return { gains: Object.fromEntries(Object.entries(gains).map(([k, v]) => [k, round(v * modifier(p.stats[k]) * fatigued(p.fatigue))])), stress: a.stress, fatigue: fatigueCost(p, a.fatigue), cost: a.cost };
  }
  function log(s, text, kind = 'day') { s.history.unshift({ day: s.day, text, kind }); }
  function assign(s, slot, index, id) {
    if (s.pending || s.done || slot < s.cursor) return;
    if (s.day % 8 === 0 && slot === 2) return;
    const a = getAction(id);
    if (!a) return;
    const row = s.plan[slot];
    if (a.category === '团队') s.plan[slot] = s.people.map(() => id);
    else {
      if (row.some(x => getAction(x)?.category === '团队')) s.plan[slot] = s.people.map(() => null);
      s.plan[slot][index] = id;
    }
  }
  function apply(s, p, a) {
    const v = preview(s, p, a);
    for (const [k, x] of Object.entries(v.gains)) p.stats[k] = round(clamp(p.stats[k] + x));
    p.stress = round(clamp(p.stress + v.stress, 0, 99)); p.fatigue = round(clamp(p.fatigue + v.fatigue, 0, 99)); s.coins -= v.cost;
    if (a.id === 'greet') { s.fans += s.mode === 'group' ? 3 : 8; p.exposure += 8; }
    return v;
  }
  function execute(s) {
    if (s.pending || s.done) return { error: '请先完成当前事件' };
    if (s.day % 8 === 0 && s.cursor === 2) {
      if (s.people.some(status)) {
        // A missed show still advances the chapter; the player is never trapped.
        s.people.forEach(p => apply(s, p, getAction('rest')));
        const result = { phase: s.phase, day: s.day, name: PHASES[s.phase].show, score: 0, missed: true, fans: 0, coins: 0, reasons: ['状态过高，本次舞台改为恢复日程。'], picks: {} };
        s.shows.push(result); s.reputation = clamp(s.reputation - 10, 0, 100); s.cursor++;
        s.pending = { type: 'result', result }; log(s, '未能参加阶段舞台：先把状态恢复好。', 'show');
        return { result, missed: true };
      }
      s.pending = { type: 'show' }; return { show: true };
    }
    const row = s.plan[s.cursor];
    if (row.length !== s.people.length || s.people.some((_, i) => !getAction(row[i]))) return { error: '请为每位成员安排这一时段的日程' };
    // Validate projected costs across all participants before mutating any member.
    let remaining = s.coins;
    for (let i = 0; i < s.people.length; i++) {
      const a = getAction(row[i]); const reason = lock(s, s.people[i], a);
      if (reason) return { error: `${s.people[i].name}：${reason}` };
      remaining -= a.cost;
    }
    if (remaining < 0) return { error: '团队共用星币不足，请减少高级课程' };
    const feedback = s.people.map((p, i) => ({ name: p.name, action: getAction(row[i]).label, ...apply(s, p, getAction(row[i])) }));
    if (row[0] === 'rehearse') s.bond = clamp(s.bond + 6, 0, 100);
    if (row[0] === 'chat') s.bond = clamp(s.bond + 3, 0, 100);
    log(s, feedback.map(x => `${x.name} · ${x.action}`).join(' / ')); s.cursor++;
    if (s.cursor === 3) endDay(s);
    return { feedback };
  }
  function random(s) { s.seed = (Math.imul(1664525, s.seed) + 1013904223) >>> 0; return s.seed / 4294967296; }
  function endDay(s) {
    const e = EVENTS.find(e => e.day === s.day && !s.completedEvents.includes(e.id));
    if (e) { s.pending = { type: 'event', id: e.id }; return; }
    if (s.day % 2 === 0 && s.day % 8 !== 0 && !s.randomDays.includes(s.day) && random(s) < 0.32) {
      s.randomDays.push(s.day); s.pending = { type: 'random', variant: s.mode === 'group' ? 'team' : 'teacher' }; return;
    }
    nextDay(s);
  }
  function nextDay(s) {
    s.previousPlan = s.plan.map(row => row.slice()); s.plan = Array.from({ length: 3 }, () => []); s.cursor = 0;
    if (s.day === 24) { s.done = true; return; }
    s.day++; s.phase = Math.floor((s.day - 1) / 8);
  }
  function eventById(id) { return EVENTS.find(e => e.id === id); }
  function chooseEvent(s, index) {
    if (s.pending?.type !== 'event' || ![0, 1].includes(index)) return;
    const e = eventById(s.pending.id); const o = e.options[index];
    if (o.route) s.route = o.route;
    for (const p of s.people) {
      for (const [k, x] of Object.entries(o.gains || {})) p.stats[k] = round(clamp(p.stats[k] + x));
      if (o.main) { const k = mainAttr(s, p); p.stats[k] = round(clamp(p.stats[k] + o.main)); }
      p.stress = clamp(p.stress + (o.stress || 0), 0, 99); p.fatigue = clamp(p.fatigue + (o.fatigue || 0), 0, 99);
    }
    s.coins += o.coins || 0; s.fans += o.fans || 0; s.reputation = clamp(s.reputation + (o.reputation || 0), 0, 100);
    if (s.mode === 'group') s.bond = clamp(s.bond + (o.bond || 0), 0, 100);
    log(s, `${e.title}：${o.label}`, 'event'); s.completedEvents.push(e.id); s.pending = null; nextDay(s);
  }
  function chooseRandom(s, index) {
    if (s.pending?.type !== 'random' || ![0, 1].includes(index)) return;
    if (index === 0) {
      s.people.forEach(p => { const k = mainAttr(s, p); p.stats[k] = round(clamp(p.stats[k] + 3)); p.stress = clamp(p.stress + 1, 0, 99); });
      if (s.mode === 'group') s.bond = clamp(s.bond + 3, 0, 100);
      log(s, s.mode === 'group' ? '彼此分享练习心得，舞台更靠近了一点。' : '请教老师之后，找到了新的练习方向。', 'event');
    } else {
      s.people.forEach(p => { p.stress = clamp(p.stress - 3, 0, 99); p.fatigue = clamp(p.fatigue - 2, 0, 99); }); log(s, '留一点时间给自己，明天再出发。', 'event');
    }
    s.pending = null; nextDay(s);
  }
  function readiness(s, p, beat) {
    const k = beat.attr === 'main' ? mainAttr(s, p) : beat.attr;
    return clamp(p.stats[k] / beat.recommended[s.phase] * 100, 0, 100);
  }
  function evaluate(s, picks, tapBonus = 0) {
    const open = BEATS.find(b => b.id === picks.open && b.slot === 'open');
    const close = BEATS.find(b => b.id === picks.close && b.slot === 'close');
    if (!open || !close) throw Error('请完整选择开场和收尾');
    const mids = s.people.map((p, i) => {
      const b = BEATS.find(b => b.id === picks.mains[i] && b.slot === 'main');
      if (!b) throw Error('请为每人选择主表现');
      const k = b.attr === 'main' ? mainAttr(s, p) : b.attr;
      if (p.stats[k] < b.gate) throw Error(`${p.name}的${k}未达到动作门槛`);
      return b;
    });
    if (s.people.some(status)) throw Error('状态过高，需先恢复');
    for (const p of s.people) for (const b of [open, close]) if (p.stats[b.attr] < b.gate) throw Error(`${p.name}的${b.attr}未达到动作门槛`);
    const avg = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
    const opening = avg(s.people.map(p => readiness(s, p, open)));
    const closing = avg(s.people.map(p => readiness(s, p, close)));
    const individual = s.people.map((p, i) => readiness(s, p, mids[i]));
    const main = s.mode === 'solo' ? individual[0] : avg(individual) * 0.7 + Math.min(...individual) * 0.15 + s.bond * 0.15;
    const penalty = avg(s.people.map(p => (p.fatigue <= 5 ? 0 : p.fatigue <= 10 ? 5 : 10)));
    const bonus = clamp(tapBonus, 0, 5); const score = Math.round(clamp(opening * 0.2 + main * 0.6 + closing * 0.2 - penalty + bonus, 0, 100));
    const quality = score >= 85 ? 1.25 : score >= 60 ? 1 : 0.4;
    const scale = s.phase + 1;
    const fans = Math.round((open.fans + avg(mids.map(b => b.fans)) + close.fans + 40 * scale) * quality);
    const coins = Math.round((open.coins + avg(mids.map(b => b.coins)) + close.coins + 50 * scale) * quality * (s.mode === 'group' ? 1.5 : 1));
    return { phase: s.phase, day: s.day, name: PHASES[s.phase].show, score, fans, coins, missed: false, picks: JSON.parse(JSON.stringify(picks)), reasons: [`开场 ${Math.round(opening)} × 20%`, `主表现 ${Math.round(main)} × 60%`, `收尾 ${Math.round(closing)} × 20%`, `疲劳扣分 −${round(penalty)}`, `互动加分 +${bonus}`], individual: individual.map(round) };
  }
  function perform(s, picks, bonus) {
    if (s.pending?.type !== 'show') throw Error('本场演出已结算或尚未开放');
    const result = evaluate(s, picks, bonus);
    s.coins += result.coins; s.fans += result.fans; s.reputation = clamp(s.reputation + (result.score >= 85 ? 10 : result.score >= 60 ? 5 : -10), 0, 100);
    s.people.forEach(p => { p.stress = clamp(p.stress + 3, 0, 99); p.fatigue = clamp(p.fatigue + fatigueCost(p, 5), 0, 99); p.exposure += result.fans; });
    s.shows.push(result); s.cursor = 3; s.pending = { type: 'result', result };
    log(s, `${result.name} · ${result.score} 分 · 人气 +${result.fans}`, 'show'); return result;
  }
  function finishResult(s) {
    if (s.pending?.type !== 'result') return;
    s.snapshots.push({ phase: s.phase, stats: s.people.map(p => ({ ...p.stats })), fans: s.fans, bond: s.bond }); s.pending = null; nextDay(s);
  }
  function ending(s) {
    const avg = s.shows.reduce((n, x) => n + x.score, 0) / Math.max(1, s.shows.length);
    const healthy = s.people.every(p => p.stress < 15 && p.fatigue < 15);
    const final = s.shows.at(-1)?.score || 0;
    if (avg >= 85 && final >= 85 && healthy && (s.mode === 'solo' || s.bond >= 70)) return { title: '聚光灯下', subtitle: '你让努力，有了被看见的形状。', rank: 'S' };
    if (avg >= 60 && final >= 60) return { title: s.mode === 'group' ? '并肩成长' : '找到自己的声音', subtitle: '舞台只是起点，你已经走出了自己的路。', rank: 'A' };
    return { title: '下一次舞台', subtitle: '这一次的练习，也会成为下一次的光。', rank: 'B' };
  }
  function autoPlan(s) {
    // Conservative playable default, not an automatic advancement or reward.
    const projected = JSON.parse(JSON.stringify(s));
    for (let slot = s.cursor; slot < 3; slot++) {
      if (s.day % 8 === 0 && slot === 2) break;
      const shared = s.mode === 'group' && slot === 0 && s.day % 2 === 1;
      const teamAction = projected.people.every(p => !status(p) && p.fatigue <= 7 && p.stress <= 9) ? 'rehearse' : 'chat';
      for (let i = 0; i < s.people.length; i++) {
        const p = projected.people[i]; const k = mainAttr(projected, p);
        let id;
        if (shared) id = teamAction;
        else if (status(p) || p.fatigue > 8 || p.stress > 10 || (s.day % 8 === 0 && slot === 1 && (p.fatigue > 3 || p.stress > 8))) id = 'rest';
        else if (slot === 0 && s.day % 2 === 0 && p.stats['魅力'] < [50, 75, 95][s.phase]) id = 'posture';
        else if (slot === 2 && s.day % 3 === 1) id = 'greet';
        else {
          const base = { 唱功: 'voice', 舞技: 'rhythm', 演技: 'lines', 魅力: 'posture' }[k];
          const advanced = { 唱功: 'high', 舞技: 'combo', 演技: 'audition', 魅力: 'redcarpet' }[k];
          id = s.phase > 0 && p.stats[k] >= 100 && projected.coins >= 30 && p.fatigue < 6 && p.stress < 7 ? advanced : base;
        }
        s.plan[slot][i] = id; apply(projected, p, getAction(id));
      }
    }
  }
  function validSave(s, mode) {
    if (!s || s.version !== 1 || s.mode !== mode || !Number.isInteger(s.day) || s.day < 1 || s.day > 24 || !Number.isInteger(s.cursor) || s.cursor < 0 || s.cursor > 3 || s.phase !== Math.floor((s.day - 1) / 8)) return false;
    const expected = mode === 'solo' ? ['张函瑞'] : ['王橹杰', '张桂源', '左奇函'];
    if (!Array.isArray(s.people) || s.people.length !== expected.length || !Array.isArray(s.plan) || s.plan.length !== 3 || !s.plan.every(Array.isArray)) return false;
    if (!['coins','fans','reputation','bond','seed'].every(k => Number.isFinite(s[k]) && s[k] >= 0)) return false;
    if (!['history','shows','snapshots','completedEvents','randomDays'].every(k => Array.isArray(s[k]))) return false;
    if (s.pending && !['show','result','event','random'].includes(s.pending.type)) return false;
    if (s.pending?.type === 'event' && !eventById(s.pending.id)) return false;
    return s.people.every((p,i) => p.name === expected[i] && ATTRS.every(k => Number.isFinite(p.stats?.[k]) && p.stats[k] >= 0 && p.stats[k] <= 200) && Number.isFinite(p.stress) && Number.isFinite(p.fatigue));
  }
  const api = { ATTRS, PEOPLE, PHASES, ACTIONS, EVENTS, BEATS, create, mainAttr, getAction, lock, preview, assign, execute, chooseEvent, chooseRandom, evaluate, perform, finishResult, ending, autoPlan, validSave, status };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GameEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
