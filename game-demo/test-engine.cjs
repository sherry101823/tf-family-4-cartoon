const assert = require('node:assert/strict');
const test = require('node:test');
const E = require('./engine.js');

function simulate(mode, strategy = 'balanced', route = 'music') {
  const s = E.create(mode);
  const results = [];
  let guard = 0;
  while (!s.done && guard++ < 400) {
    if (s.pending?.type === 'event') {
      const e = E.EVENTS.find(x => x.id === s.pending.id);
      E.chooseEvent(s, e.id === 'ost' ? (route === 'film' ? 1 : 0) : e.id === 'love' ? 1 : e.id === 'quadrant' ? 1 : 1);
    } else if (s.pending?.type === 'random') E.chooseRandom(s, 1);
    else if (s.pending?.type === 'show') {
      const available = (slot,p) => E.BEATS.filter(b => b.slot === slot && s.people.every(q => q.stats[b.attr === 'main' ? E.mainAttr(s,q) : b.attr] >= b.gate));
      const picks = { open: 'entrance', close: available('close',s.people[0]).at(-1).id, mains: s.people.map(p => {
        const k = E.mainAttr(s,p);
        const candidates = E.BEATS.filter(b => b.slot === 'main' && (b.attr === 'main' || b.attr === k) && p.stats[b.attr === 'main' ? k : b.attr] >= b.gate);
        return candidates.sort((a,b) => b.fans - a.fans)[0].id;
      }) };
      results.push(E.perform(s,picks,3));
    } else if(s.pending?.type === 'result') E.finishResult(s);
    else {
      if(strategy === 'balanced') E.autoPlan(s);
      else for (let slot=s.cursor;slot<3;slot++) for(let i=0;i<s.people.length;i++) E.assign(s,slot,i, E.status(s.people[i]) ? 'rest' : strategy === 'overwork' ? 'core' : 'rest');
      const r = E.execute(s);
      if(r.error) {
        // After an earlier slot, a preplanned next action can need replacement.
        s.plan[s.cursor]=s.people.map(p=>E.status(p)?'rest': 'rest');
        assert.equal(E.execute(s).error,undefined,r.error);
      }
    }
  }
  assert.ok(s.done,'24 days must finish');
  assert.equal(s.shows.length,3);
  assert.equal(s.snapshots.length,3);
  assert.ok(E.validSave(JSON.parse(JSON.stringify(s)),mode));
  return s;
}

test('overspending is rejected before any member is mutated', () => {
  const s=E.create('group');s.phase=1;s.day=9;s.coins=50;
  s.people.forEach(p=>{p.stats['唱功']=100;});s.plan[0]=s.people.map(()=>'high');
  const before=JSON.stringify(s);assert.match(E.execute(s).error,/星币/);assert.equal(JSON.stringify(s),before);
});
test('fatigue at 15 blocks training but a free recovery consumes one time slot',()=>{
  const s=E.create('solo');s.people[0].fatigue=15;s.plan[0]=['voice'];
  assert.match(E.execute(s).error,/恢复/);s.plan[0]=['rest'];
  E.execute(s);assert.equal(s.people[0].fatigue,10);assert.equal(s.cursor,1);assert.equal(s.coins,300);
});
test('shared actions occupy the same slot for every member',()=>{
  const s=E.create('group');E.assign(s,0,1,'rehearse');assert.deepEqual(s.plan[0],['rehearse','rehearse','rehearse']);
  E.execute(s);assert.equal(s.bond,26);assert.equal(s.people[1].stats['舞技'],49);
  E.assign(s,1,0,'chat');E.assign(s,1,2,'voice');assert.deepEqual(s.plan[1],[null,null,'voice']);
});
test('preview uses pre-action fatigue and pressure is only applied once',()=>{
  const s=E.create('solo');s.day=9;s.phase=1;s.people[0].stats['演技']=100;s.people[0].fatigue=8;s.plan[0]=['audition'];
  const v=E.preview(s,s.people[0],E.getAction('audition'));assert.equal(v.gains['演技'],8.2);
  E.execute(s);assert.equal(s.people[0].stats['演技'],108.2);assert.equal(s.people[0].stress,5);
});
test('a performance can only settle once and chapter completion can only run once',()=>{
  const s=E.create('solo');s.day=8;s.cursor=2;s.pending={type:'show'};
  const picks={open:'entrance',close:'bow',mains:['basic']};E.perform(s,picks,99);
  const coins=s.coins;assert.throws(()=>E.perform(s,picks,5));assert.equal(s.coins,coins);assert.equal(s.shows.length,1);
  E.finishResult(s);E.finishResult(s);assert.equal(s.day,9);assert.equal(s.snapshots.length,1);
});
test('missed stage causes recovery and does not trap the chapter',()=>{
  const s=E.create('group');s.day=8;s.cursor=2;s.people[1].stress=17;
  E.execute(s);assert.equal(s.pending.type,'result');assert.equal(s.pending.result.missed,true);
  E.finishResult(s);assert.equal(s.day,9);assert.equal(s.phase,1);
});
test('solo music, solo film and trio finish full journeys with balanced schedules',()=>{
  for(const [mode,route] of [['solo','music'],['solo','film'],['group','music']]){
    const s=simulate(mode,'balanced',route);const avg=s.shows.reduce((x,r)=>x+r.score,0)/3;
    console.log(JSON.stringify({mode,route,scores:s.shows.map(r=>r.score),ending:E.ending(s).title,fans:s.fans,coins:s.coins,bond:s.bond,stats:s.people.map(p=>p.stats)}));
    assert.ok(avg>=60,`${mode}/${route}: balanced play should produce a passing ending`);
  }
});
test('rest-only and overwork have meaningfully different results',()=>{
  const balanced=simulate('solo'),rest=simulate('solo','rest'),overwork=simulate('solo','overwork');
  assert.equal(E.ending(rest).rank,'B');assert.equal(E.ending(overwork).rank,'B');
  assert.ok(balanced.fans>rest.fans);assert.ok(balanced.people[0].stats['唱功']>overwork.people[0].stats['唱功']);
});
test('malformed saves are rejected',()=>{
  assert.equal(E.validSave({},'solo'),false);const s=E.create('solo');s.people[0].stats['唱功']=NaN;assert.equal(E.validSave(s,'solo'),false);
});
