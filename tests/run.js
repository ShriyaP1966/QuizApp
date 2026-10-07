/* Lightweight tests for the quiz logic. Run with: node tests/run.js */
const assert = require('node:assert/strict');
const E = require('../js/engine.js');
const S = require('../js/storage.js');
const QUESTIONS = require('../js/data.js');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}

// Deterministic RNG (mulberry32) so shuffles are reproducible.
function seeded(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Q = (difficulty, answer) => ({
  question: 'q', category: 'Science', difficulty: difficulty || 'Easy',
  options: ['A', 'B', 'C', 'D'], answer: answer || 'A', hint: 'h', explanation: 'e'
});
const newQuiz = (qs, t) => E.createQuiz(qs || [Q(), Q(), Q()], t || 20);

function fakeStorage() {
  const m = {};
  return {
    getItem: k => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: k => { delete m[k]; },
    dump: () => m
  };
}

console.log('Question data');
test('every question has 4 unique options including the answer, a hint and an explanation', () => {
  assert.ok(QUESTIONS.length >= 100);
  QUESTIONS.forEach(q => {
    assert.equal(q.options.length, 4, q.id);
    assert.equal(new Set(q.options).size, 4, q.id);
    assert.ok(q.options.includes(q.answer), q.id);
    assert.ok(q.hint && q.explanation, q.id);
    assert.ok(E.DIFFICULTIES.includes(q.difficulty), q.id);
  });
});
test('every category/difficulty combination has questions', () => {
  E.categoriesOf(QUESTIONS).forEach(c =>
    E.DIFFICULTIES.forEach(d => assert.ok(E.availableCount(QUESTIONS, { category: c, difficulty: d }) > 0, c + ' ' + d)));
});

console.log('Question selection');
test('filters by category and difficulty', () => {
  const sel = E.selectQuestions(QUESTIONS, { category: 'Science', difficulty: 'Hard', count: 5 }, seeded(1));
  assert.equal(sel.length, 5);
  sel.forEach(q => { assert.equal(q.category, 'Science'); assert.equal(q.difficulty, 'Hard'); });
});
test('"All" wildcards include every category and difficulty', () => {
  assert.equal(E.availableCount(QUESTIONS, { category: E.ALL, difficulty: E.ALL }), QUESTIONS.length);
});
test('never returns more questions than available, and has no duplicates', () => {
  const sel = E.selectQuestions(QUESTIONS, { category: 'Science', difficulty: 'Easy', count: 20 }, seeded(2));
  assert.equal(sel.length, E.availableCount(QUESTIONS, { category: 'Science', difficulty: 'Easy' }));
  assert.equal(new Set(sel.map(q => q.id)).size, sel.length);
});
test('count options are capped by availability', () => {
  assert.deepEqual(E.countOptions(6), [5]);
  assert.deepEqual(E.countOptions(18), [5, 10, 15]);
  assert.deepEqual(E.countOptions(108), [5, 10, 15, 20]);
  assert.deepEqual(E.countOptions(3), [3]);
  assert.deepEqual(E.countOptions(0), []);
});
test('shuffling is deterministic for a seed and preserves elements', () => {
  const a = E.shuffle([1, 2, 3, 4, 5, 6], seeded(7));
  const b = E.shuffle([1, 2, 3, 4, 5, 6], seeded(7));
  assert.deepEqual(a, b);
  assert.deepEqual(a.slice().sort(), [1, 2, 3, 4, 5, 6]);
});
test('shuffling does not mutate the input; different seeds give different orders', () => {
  const src = [1, 2, 3, 4, 5, 6, 7, 8];
  E.shuffle(src, seeded(1));
  assert.deepEqual(src, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.notDeepEqual(E.shuffle(src, seeded(1)), E.shuffle(src, seeded(2)));
});
test('answer options are shuffled but the correct answer is preserved', () => {
  const sel = E.selectQuestions(QUESTIONS, { category: 'Mathematics', difficulty: 'Easy', count: 6 }, seeded(3));
  sel.forEach(q => {
    assert.ok(q.options.includes(q.answer));
    const orig = QUESTIONS.find(o => o.id === q.id);
    assert.deepEqual(q.options.slice().sort(), orig.options.slice().sort());
  });
  assert.ok(sel.some(q => QUESTIONS.find(o => o.id === q.id).options.join() !== q.options.join()));
});
test('selecting does not mutate the question bank', () => {
  const before = JSON.stringify(QUESTIONS);
  E.selectQuestions(QUESTIONS, { category: E.ALL, difficulty: E.ALL, count: 20 }, seeded(4));
  assert.equal(JSON.stringify(QUESTIONS), before);
});

console.log('Answering and scoring');
test('correct answer is detected and scores base points for the difficulty', () => {
  [['Easy', 10], ['Medium', 20], ['Hard', 30]].forEach(([d, pts]) => {
    const s = newQuiz([Q(d)]);
    const r = E.answer(s, 'A', 3);
    assert.equal(r.status, 'correct');
    assert.equal(r.points, pts);
    assert.equal(s.score, pts);
  });
});
test('incorrect answer is detected, scores nothing, resets streak', () => {
  const s = newQuiz();
  E.answer(s, 'A', 1); E.next(s);
  const r = E.answer(s, 'B', 1);
  assert.equal(r.status, 'incorrect');
  assert.equal(r.points, 0);
  assert.equal(s.streak, 0);
  assert.equal(s.score, 10);
});
test('streak grows, adds a bonus, and the bonus is capped', () => {
  const s = newQuiz(Array.from({ length: 8 }, () => Q('Easy')));
  const pts = [];
  for (let i = 0; i < 8; i++) { pts.push(E.answer(s, 'A', 1).points); E.next(s); }
  assert.deepEqual(pts, [10, 12, 14, 16, 18, 20, 20, 20]);
  assert.equal(s.streak, 8);
  assert.equal(s.bestStreak, 8);
});
test('best streak survives a later reset', () => {
  const s = newQuiz([Q(), Q(), Q(), Q()]);
  E.answer(s, 'A', 1); E.next(s);
  E.answer(s, 'A', 1); E.next(s);
  E.answer(s, 'B', 1); E.next(s);
  E.answer(s, 'A', 1);
  assert.equal(s.streak, 1);
  assert.equal(s.bestStreak, 2);
});
test('an answer cannot be given twice for the same question', () => {
  const s = newQuiz();
  assert.ok(E.answer(s, 'A', 1));
  assert.equal(E.answer(s, 'A', 1), null);
  assert.equal(E.answer(s, 'B', 1), null);
  assert.equal(s.score, 10);
  assert.equal(s.results.length, 1);
});
test('unknown options are rejected', () => {
  const s = newQuiz();
  assert.equal(E.answer(s, 'Z', 1), null);
  assert.equal(s.results.length, 0);
});
test('next() does nothing until the question is answered', () => {
  const s = newQuiz();
  E.next(s);
  assert.equal(s.index, 0);
});

console.log('Timeout');
test('timeout scores nothing, resets streak, and marks the question unanswered', () => {
  const s = newQuiz();
  E.answer(s, 'A', 1); E.next(s);
  const r = E.timeout(s);
  assert.equal(r.status, 'timeout');
  assert.equal(r.selected, null);
  assert.equal(r.points, 0);
  assert.equal(s.streak, 0);
  assert.equal(s.score, 10);
  assert.equal(r.elapsed, 20);
});
test('answering after a timeout is rejected (no double scoring)', () => {
  const s = newQuiz();
  E.timeout(s);
  assert.equal(E.answer(s, 'A', 1), null);
  assert.equal(s.score, 0);
  assert.equal(s.results.length, 1);
});
test('timeout after an answer is ignored (timer race)', () => {
  const s = newQuiz();
  E.answer(s, 'A', 5);
  assert.equal(E.timeout(s), null);
  assert.equal(s.results.length, 1);
  assert.equal(s.results[0].status, 'correct');
});
test('repeated timeouts are only recorded once', () => {
  const s = newQuiz();
  E.timeout(s); E.timeout(s); E.timeout(s);
  assert.equal(s.results.length, 1);
});

console.log('Lifelines');
test('50/50 removes exactly two wrong options and never the answer', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const s = newQuiz([Q('Easy', 'C')]);
    const removed = E.useFiftyFifty(s, seeded(seed));
    assert.equal(removed.length, 2);
    assert.ok(!removed.includes('C'));
    assert.equal(new Set(removed).size, 2);
  }
});
test('50/50 can be used only once per quiz', () => {
  const s = newQuiz();
  assert.ok(E.useFiftyFifty(s));
  E.answer(s, 'A', 1); E.next(s);
  assert.equal(s.lifelines.fifty, 0);
  assert.equal(E.useFiftyFifty(s), null);
  assert.deepEqual(s.step.removed, []);
});
test('removed options cannot be selected', () => {
  const s = newQuiz([Q('Easy', 'A')]);
  const removed = E.useFiftyFifty(s, seeded(1));
  assert.equal(E.answer(s, removed[0], 1), null);
  assert.ok(E.answer(s, 'A', 1));
});
test('hint returns the current question’s own hint, once per quiz', () => {
  const qs = [Object.assign(Q(), { hint: 'first hint' }), Object.assign(Q(), { hint: 'second hint' })];
  const s = newQuiz(qs);
  assert.equal(E.useHint(s), 'first hint');
  assert.equal(E.useHint(s), null);
  E.answer(s, 'A', 1); E.next(s);
  assert.equal(E.useHint(s), null);
  assert.equal(s.lifelines.hint, 0);
});
test('lifelines are unavailable after answering or timing out', () => {
  const s = newQuiz();
  E.timeout(s);
  assert.equal(E.useFiftyFifty(s), null);
  assert.equal(E.useHint(s), null);
  assert.equal(s.lifelines.fifty, 1);
  assert.equal(s.lifelines.hint, 1);
});
test('lifeline use is recorded on the result and does not change points', () => {
  const s = newQuiz([Q('Easy')]);
  E.useHint(s); E.useFiftyFifty(s, seeded(1));
  const r = E.answer(s, 'A', 1);
  assert.ok(r.usedHint && r.usedFifty);
  assert.equal(r.points, 10);
});

console.log('Completion and results');
test('quiz finishes after the last question and ignores further input', () => {
  const s = newQuiz([Q(), Q()]);
  E.answer(s, 'A', 1);
  assert.equal(E.next(s), false);
  E.answer(s, 'B', 1);
  assert.equal(E.next(s), true);
  assert.equal(s.finished, true);
  assert.equal(E.currentQuestion(s), null);
  assert.equal(E.answer(s, 'A', 1), null);
  assert.equal(E.timeout(s), null);
  assert.equal(E.useHint(s), null);
});
test('empty quiz is immediately finished', () => {
  assert.equal(E.createQuiz([], 20).finished, true);
});
test('summary counts correct, incorrect and unanswered and computes accuracy', () => {
  const s = newQuiz([Q(), Q(), Q(), Q()], 30);
  E.answer(s, 'A', 4); E.next(s);
  E.answer(s, 'A', 6); E.next(s);
  E.answer(s, 'B', 2); E.next(s);
  E.timeout(s); E.next(s);
  const sum = E.summarize(s);
  assert.equal(sum.total, 4);
  assert.equal(sum.correct, 2);
  assert.equal(sum.incorrect, 1);
  assert.equal(sum.unanswered, 1);
  assert.equal(sum.accuracy, 50);
  assert.equal(sum.points, 22);
  assert.equal(sum.bestStreak, 2);
  assert.equal(sum.timeSeconds, 42);
  assert.equal(sum.results.length, 4);
});
test('performance messages follow the score bands', () => {
  assert.match(E.performanceMessage(100), /Excellent/);
  assert.match(E.performanceMessage(90), /Excellent/);
  assert.match(E.performanceMessage(89), /Great/);
  assert.match(E.performanceMessage(75), /Great/);
  assert.match(E.performanceMessage(74), /Good effort/);
  assert.match(E.performanceMessage(50), /Good effort/);
  assert.match(E.performanceMessage(49), /Keep practicing/);
  assert.match(E.performanceMessage(0), /Keep practicing/);
});
test('time formatting', () => {
  assert.equal(E.formatTime(0), '00:00');
  assert.equal(E.formatTime(102), '01:42');
  assert.equal(E.formatTime(-5), '00:00');
});
test('a full simulated quiz from real data ends consistently', () => {
  const qs = E.selectQuestions(QUESTIONS, { category: E.ALL, difficulty: E.ALL, count: 20 }, seeded(9));
  const s = E.createQuiz(qs, 10);
  let i = 0;
  while (!s.finished) {
    const q = E.currentQuestion(s);
    if (i % 3 === 0) E.timeout(s);
    else E.answer(s, i % 3 === 1 ? q.answer : q.options.find(o => o !== q.answer), 1);
    E.next(s); i++;
  }
  const sum = E.summarize(s);
  assert.equal(sum.total, 20);
  assert.equal(sum.correct + sum.incorrect + sum.unanswered, 20);
  assert.equal(sum.results.reduce((a, r) => a + r.points, 0), sum.points);
});

console.log('Statistics / localStorage');
const summaryOf = (correct, total, points, bestStreak, cat) => ({
  total, correct, points, bestStreak, accuracy: Math.round(correct / total * 100),
  results: Array.from({ length: total }, (_, i) => ({
    category: cat || 'Science', difficulty: 'Easy', status: i < correct ? 'correct' : 'incorrect'
  }))
});
test('fresh store returns empty stats', () => {
  const st = S.createStore(fakeStorage()).getStats();
  assert.equal(st.quizzes, 0);
  assert.deepEqual(st.byCategory, {});
});
test('recording a quiz updates totals and bests, and persists', () => {
  const storage = fakeStorage();
  const store = S.createStore(storage);
  store.recordQuiz(summaryOf(8, 10, 120, 4, 'Science'));
  const again = S.createStore(storage).getStats();
  assert.equal(again.quizzes, 1);
  assert.equal(again.questionsAnswered, 10);
  assert.equal(again.correct, 8);
  assert.equal(again.totalPoints, 120);
  assert.equal(again.bestScore, 120);
  assert.equal(again.bestAccuracy, 80);
  assert.equal(again.bestStreak, 4);
  assert.deepEqual(again.byCategory.Science, { answered: 10, correct: 8 });
  assert.deepEqual(again.byDifficulty.Easy, { answered: 10, correct: 8 });
});
test('bests only move up; totals accumulate; categories are tracked separately', () => {
  const store = S.createStore(fakeStorage());
  store.recordQuiz(summaryOf(8, 10, 120, 4, 'Science'));
  const out = store.recordQuiz(summaryOf(3, 10, 40, 2, 'History'));
  assert.deepEqual(out.records, { score: false, accuracy: false, streak: false });
  const st = store.getStats();
  assert.equal(st.quizzes, 2);
  assert.equal(st.bestScore, 120);
  assert.equal(st.bestAccuracy, 80);
  assert.equal(st.correct, 11);
  assert.equal(st.byCategory.History.correct, 3);
  assert.equal(st.byCategory.Science.correct, 8);
});
test('new records are reported', () => {
  const store = S.createStore(fakeStorage());
  store.recordQuiz(summaryOf(5, 10, 60, 2));
  const out = store.recordQuiz(summaryOf(9, 10, 150, 6));
  assert.deepEqual(out.records, { score: true, accuracy: true, streak: true });
});
test('reset clears statistics', () => {
  const store = S.createStore(fakeStorage());
  store.recordQuiz(summaryOf(5, 10, 60, 2));
  store.resetStats();
  assert.equal(store.getStats().quizzes, 0);
});
test('reset does not remove the theme preference', () => {
  const store = S.createStore(fakeStorage());
  store.setTheme('light');
  store.recordQuiz(summaryOf(5, 10, 60, 2));
  store.resetStats();
  assert.equal(store.getTheme(), 'light');
});
test('theme persistence accepts only light/dark', () => {
  const storage = fakeStorage();
  const store = S.createStore(storage);
  assert.equal(store.getTheme(), null);
  store.setTheme('dark');
  assert.equal(S.createStore(storage).getTheme(), 'dark');
  storage.setItem(S.THEME_KEY, 'purple');
  assert.equal(S.createStore(storage).getTheme(), null);
});
test('corrupt stored JSON falls back to empty stats', () => {
  const storage = fakeStorage();
  storage.setItem(S.STATS_KEY, '{not json');
  assert.equal(S.createStore(storage).getStats().quizzes, 0);
});
test('works when storage throws (private mode / blocked)', () => {
  const broken = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  const store = S.createStore(broken);
  store.recordQuiz(summaryOf(5, 10, 60, 2));
  assert.equal(store.getStats().quizzes, 1);
  store.setTheme('dark');
  assert.equal(store.getTheme(), 'dark');
  store.resetStats();
  assert.equal(store.getStats().quizzes, 0);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
