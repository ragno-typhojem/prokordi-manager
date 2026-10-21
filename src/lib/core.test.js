import { find, findSlot, norm, addMin } from './util';
import { calculateConflicts, distribute, allowed } from './engine';
import { applyActions } from './ai';
import { parseAny, toStatePatch, splitText, detectKind } from './importer';

const state = () => ({
  activities: [
    { id: 'a1', name: 'Origami', isMust: false, boxCount: 2, allowedGrades: [] },
    { id: 'a2', name: 'Yaratıcı Drama', isMust: true, boxCount: 3, allowedGrades: [] },
    { id: 'a3', name: 'Kimya Deneyleri', isMust: false, boxCount: 2, allowedGrades: [5, 6, 7, 8] },
  ],
  volunteers: [
    { id: 'v1', name: 'Eda Nur Keklik', capabilities: ['a1', 'a2'] },
    { id: 'v2', name: 'Mehmet Çınar', capabilities: ['a2', 'a3'] },
    { id: 'v3', name: 'Ayşe Şimşek', capabilities: ['a1', 'a3'] },
  ],
  timeSlots: [
    { id: 't1', start: '09:00', end: '09:40', type: 'lesson' },
    { id: 't2', start: '09:40', end: '09:55', type: 'break' },
    { id: 't3', start: '09:55', end: '10:35', type: 'lesson' },
    { id: 't4', start: '10:35', end: '11:15', type: 'lesson' },
  ],
  classes: [
    { id: 'c1', name: '1-A', schedule: {} },
    { id: 'c2', name: '5-B', schedule: {} },
  ],
});

describe('util', () => {
  test('Türkçe normalize', () => {
    expect(norm('Şükrü ÖZÇİĞDEM')).toBe('sukru ozcigdem');
  });
  test('bulanık isim eşleşmesi', () => {
    const s = state();
    expect(find(s.volunteers, 'eda')?.id).toBe('v1');
    expect(find(s.volunteers, 'AYSE')?.id).toBe('v3');
    expect(find(s.activities, 'kimya')?.id).toBe('a3');
    expect(find(s.volunteers, 'zzzz')).toBeNull();
  });
  test('slot çözümleme: sıra / saat / metin', () => {
    const s = state();
    expect(findSlot(s.timeSlots, 2)?.id).toBe('t3');       // 2. DERS (mola sayılmaz)
    expect(findSlot(s.timeSlots, '3. ders')?.id).toBe('t4');
    expect(findSlot(s.timeSlots, '09:55')?.id).toBe('t3');
    expect(findSlot(s.timeSlots, '10:35-11:15')?.id).toBe('t4');
    expect(findSlot(s.timeSlots, 'ilk ders')?.id).toBe('t1');
    expect(findSlot(s.timeSlots, 'son ders')?.id).toBe('t4');
  });
  test('addMin', () => expect(addMin('09:40', 40)).toBe('10:20'));
});

describe('engine', () => {
  test('seviye kısıtı', () => {
    const [, , kimya] = state().activities;
    expect(allowed(kimya, 1)).toBe(false);
    expect(allowed(kimya, 6)).toBe(true);
  });

  test('dağıtım kısıtları çiğnemez', () => {
    const s = state();
    const classes = distribute(s);
    const conflicts = calculateConflicts({ ...s, classes });
    expect(conflicts.filter(w=>!['duplicate_act','idle_slot','balance'].includes(w.type))).toEqual([]);
    const filled = classes.reduce((n, c) => n + Object.keys(c.schedule).length, 0);
    expect(filled).toBeGreaterThan(0);
  });

  test('kilitli hücreye dokunmaz', () => {
    const s = state();
    s.classes[0].schedule.t1 = { activityId: 'a1', name: 'Origami', lead: 'Eda Nur Keklik', leadId: 'v1', isLocked: true };
    const out = distribute(s);
    expect(out[0].schedule.t1.isLocked).toBe(true);
    expect(out[0].schedule.t1.activityId).toBe('a1');
  });

  test('onlyEmpty mevcut atamayı korur', () => {
    const s = state();
    s.classes[0].schedule.t1 = { activityId: 'a1', name: 'Origami', lead: '-', leadId: 'none' };
    const out = distribute(s, { onlyEmpty: true });
    expect(out[0].schedule.t1.activityId).toBe('a1');
  });

  test('aynı gönüllü aynı saatte iki sınıfta olamaz', () => {
    const s = state();
    s.classes[0].schedule.t1 = { activityId: 'a2', name: 'Yaratıcı Drama', lead: 'Eda Nur Keklik', leadId: 'v1' };
    s.classes[1].schedule.t1 = { activityId: 'a2', name: 'Yaratıcı Drama', lead: 'Eda Nur Keklik', leadId: 'v1' };
    const w = calculateConflicts(s);
    expect(w.some((x) => x.type === 'conflict')).toBe(true);
  });

  test('kutu limiti slot bazında sayılır', () => {
    const s = state();
    s.activities[0].boxCount = 1;
    s.classes[0].schedule.t1 = { activityId: 'a1', name: 'Origami', lead: 'Eda Nur Keklik', leadId: 'v1' };
    s.classes[1].schedule.t1 = { activityId: 'a1', name: 'Origami', lead: 'Ayşe Şimşek', leadId: 'v3' };
    expect(calculateConflicts(s).some((x) => x.type === 'stock')).toBe(true);
    // farklı saatlerde aynı kutu tekrar kullanılabilir → uyarı yok
    const s2 = state(); s2.activities[0].boxCount = 1;
    s2.classes[0].schedule.t1 = { activityId: 'a1', name: 'Origami', lead: 'Eda Nur Keklik', leadId: 'v1' };
    s2.classes[1].schedule.t3 = { activityId: 'a1', name: 'Origami', lead: 'Ayşe Şimşek', leadId: 'v3' };
    expect(calculateConflicts(s2).some((x) => x.type === 'stock')).toBe(false);
  });
});

describe('reducer — doğal dil aksiyonları', () => {
  test('gönüllü ekleme isimden yetkinlik çözer', () => {
    const { state: next } = applyActions(state(), [
      { type: 'add_volunteer', name: 'Zeynep Ak', capabilities: ['origami', 'Kimya Deneyleri'] },
    ]);
    const z = next.volunteers.find((v) => v.name === 'Zeynep Ak');
    expect(z.capabilities.sort()).toEqual(['a1', 'a3']);
  });

  test('set_slot: yaklaşık isim + ders sırası', () => {
    const { state: next, log } = applyActions(state(), [
      { type: 'set_slot', class: '1-A', slot: 2, activity: 'origami', volunteer: 'eda' },
    ]);
    expect(next.classes[0].schedule.t3).toMatchObject({ activityId: 'a1', leadId: 'v1' });
    expect(log[0]).toContain('Origami');
  });

  test('set_slot bilinmeyen etkinliği kataloğa ekler', () => {
    const { state: next } = applyActions(state(), [
      { type: 'set_slot', class: '5-B', slot: '09:00', activity: 'Satranç' },
    ]);
    expect(next.activities.some((a) => a.name === 'Satranç')).toBe(true);
    expect(next.classes[1].schedule.t1.name).toBe('Satranç');
  });

  test('swap iki hücreyi takas eder', () => {
    const s = state();
    s.classes[0].schedule.t1 = { activityId: 'a1', name: 'Origami', lead: '-', leadId: 'none' };
    s.classes[1].schedule.t3 = { activityId: 'a2', name: 'Yaratıcı Drama', lead: '-', leadId: 'none' };
    const { state: n } = applyActions(s, [{ type: 'swap', classA: '1-A', slotA: 1, classB: '5-B', slotB: 2 }]);
    expect(n.classes[0].schedule.t1.name).toBe('Yaratıcı Drama');
    expect(n.classes[1].schedule.t3.name).toBe('Origami');
  });

  test('clear_schedule keepMust zorunluları bırakır', () => {
    const s = state();
    s.classes[0].schedule.t1 = { activityId: 'a2', name: 'Yaratıcı Drama', isMust: true, leadId: 'v1', lead: 'Eda Nur Keklik' };
    s.classes[0].schedule.t3 = { activityId: 'a1', name: 'Origami', isMust: false, leadId: 'v1', lead: 'Eda Nur Keklik' };
    const { state: n } = applyActions(s, [{ type: 'clear_schedule', keepMust: true }]);
    expect(Object.keys(n.classes[0].schedule)).toEqual(['t1']);
  });

  test('etkinlik silmek programı ve yetkinlikleri temizler', () => {
    const s = state();
    s.classes[0].schedule.t1 = { activityId: 'a1', name: 'Origami', leadId: 'v1', lead: 'Eda Nur Keklik' };
    const { state: n } = applyActions(s, [{ type: 'remove_activity', name: 'Origami' }]);
    expect(n.activities.some((a) => a.id === 'a1')).toBe(false);
    expect(n.volunteers.every((v) => !v.capabilities.includes('a1'))).toBe(true);
    expect(n.classes[0].schedule.t1).toBeUndefined();
  });

  test('girdi state mutasyona uğramaz', () => {
    const s = state();
    const snapshot = JSON.stringify(s);
    applyActions(s, [{ type: 'distribute' }, { type: 'add_class', name: '9-C' }]);
    expect(JSON.stringify(s)).toBe(snapshot);
  });

  test('bilinmeyen aksiyon çökmez', () => {
    const { log } = applyActions(state(), [{ type: 'saçmalık' }]);
    expect(log[0]).toContain('bilinmeyen');
  });

  test('çoklu emir sırayla uygulanır', () => {
    const { state: n } = applyActions(state(), [
      { type: 'add_class', name: '9-C' },
      { type: 'load_template' },
      { type: 'distribute' },
    ]);
    expect(n.classes.length).toBe(3);
    expect(n.timeSlots).toEqual(state().timeSlots); // existing times and cell identities are protected
    expect(calculateConflicts(n).filter(w=>!['duplicate_act','idle_slot','balance'].includes(w.type))).toEqual([]);
  });
});

describe('importer', () => {
  test('ayırıcıyı kendi bulur', () => {
    expect(splitText('a;b;c\nd;e;f')).toEqual([['a', 'b', 'c'], ['d', 'e', 'f']]);
    expect(splitText('a\tb\nc\td')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  test('tür tespiti', () => {
    expect(detectKind([['Ali'], ['Veli'], ['Ayşe']])).toBe('names');
    expect(detectKind([['1-A'], ['2-B']])).toBe('classes');
    expect(detectKind([
      ['Saat', '1-A', '2-B'],
      ['09:00-09:40', 'Origami (Eda)', 'Drama'],
      ['09:55-10:35', 'Drama', 'Origami'],
    ])).toBe('schedule');
  });

  test('isim listesi + yetkinlik sütunu', () => {
    const patch = toStatePatch(parseAny('Ali Kaya\tOrigami, Kimya Deneyleri\nVeli Su\tYaratıcı Drama'), state());
    const ali = patch.volunteers.find((v) => v.name === 'Ali Kaya');
    expect(ali.capabilities.sort()).toEqual(['a1', 'a3']);
    expect(patch._kind).toBe('gönüllü');
  });

  test('program tablosu: saat, sınıf, etkinlik(gönüllü) ve DERS YOK', () => {
    const text = [
      'Saat;1-A;5-B',
      '09:00-09:40;Origami (Eda Nur Keklik);Kimya Deneyleri (Mehmet Çınar)',
      '09:40-09:55;TENEFFÜS;TENEFFÜS',
      '09:55-10:35;Yaratıcı Drama;DERS YOK',
    ].join('\n');
    const patch = toStatePatch(parseAny(text), state());
    expect(patch._kind).toBe('program');
    expect(patch.timeSlots.map((s) => s.type)).toEqual(['lesson', 'break', 'lesson', 'lesson']);
    expect(patch.timeSlots.some(s=>s.id==='t4')).toBe(true); // unmatched original slot is retained
    const [t1, , t3] = patch.timeSlots;
    expect(patch.classes[0].schedule[t1.id]).toMatchObject({ activityId: 'a1', leadId: 'v1' });
    expect(patch.classes[1].schedule[t1.id]).toMatchObject({ activityId: 'a3', leadId: 'v2' });
    expect(patch.classes[1].schedule[t3.id].activityId).toBe('NO_CLASS');
    // mevcut sınıf kimlikleri korunur
    expect(patch.classes[0].id).toBe('c1');
  });

  test('bulk_import aksiyonu state\'e işler', () => {
    const { state: n } = applyActions(state(), [
      { type: 'bulk_import', text: 'Deniz Yıldız\nKerem Ateş' },
    ]);
    expect(n.volunteers.length).toBe(5);
  });
});
