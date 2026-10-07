/* Persistence: statistics, theme and last-used setup, stored in localStorage.
   Only anonymous counters are stored. Falls back to memory if storage is unavailable. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuizStorage = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const STATS_KEY = 'quizapp.stats.v1';
  const THEME_KEY = 'quizapp.theme';
  const SETTINGS_KEY = 'quizapp.settings.v1';

  function emptyStats() {
    return {
      quizzes: 0, questionsAnswered: 0, correct: 0, totalPoints: 0,
      bestScore: 0, bestAccuracy: 0, bestStreak: 0,
      byCategory: {}, byDifficulty: {}
    };
  }

  function bump(group, key, correct) {
    const g = group[key] || (group[key] = { answered: 0, correct: 0 });
    g.answered += 1;
    if (correct) g.correct += 1;
  }

  // Pure: returns { stats, records } without touching storage.
  function applyQuiz(stats, summary) {
    const s = JSON.parse(JSON.stringify(stats));
    const records = {
      score: summary.points > s.bestScore && summary.points > 0,
      accuracy: summary.accuracy > s.bestAccuracy,
      streak: summary.bestStreak > s.bestStreak
    };
    s.quizzes += 1;
    s.questionsAnswered += summary.total;
    s.correct += summary.correct;
    s.totalPoints += summary.points;
    s.bestScore = Math.max(s.bestScore, summary.points);
    s.bestAccuracy = Math.max(s.bestAccuracy, summary.accuracy);
    s.bestStreak = Math.max(s.bestStreak, summary.bestStreak);
    summary.results.forEach(function (r) {
      bump(s.byCategory, r.category, r.status === 'correct');
      bump(s.byDifficulty, r.difficulty, r.status === 'correct');
    });
    return { stats: s, records: records };
  }

  function createStore(storage) {
    const memory = {};
    function read(key) {
      try { const v = storage.getItem(key); return v === null || v === undefined ? (memory[key] || null) : v; }
      catch (e) { return memory[key] || null; }
    }
    function write(key, value) {
      memory[key] = value;
      try { storage.setItem(key, value); } catch (e) { /* storage blocked: keep in memory */ }
    }
    function remove(key) {
      delete memory[key];
      try { storage.removeItem(key); } catch (e) { /* ignore */ }
    }
    function readJSON(key) {
      try { return JSON.parse(read(key)); } catch (e) { return null; }
    }

    return {
      getStats: function () {
        const saved = readJSON(STATS_KEY);
        return saved && typeof saved === 'object' ? Object.assign(emptyStats(), saved) : emptyStats();
      },
      recordQuiz: function (summary) {
        const out = applyQuiz(this.getStats(), summary);
        write(STATS_KEY, JSON.stringify(out.stats));
        return out;
      },
      resetStats: function () { remove(STATS_KEY); },
      getTheme: function () {
        const t = read(THEME_KEY);
        return t === 'light' || t === 'dark' ? t : null;
      },
      setTheme: function (theme) { write(THEME_KEY, theme); },
      getSettings: function () {
        const s = readJSON(SETTINGS_KEY);
        return s && typeof s === 'object' ? s : {};
      },
      setSettings: function (settings) { write(SETTINGS_KEY, JSON.stringify(settings)); }
    };
  }

  return { createStore: createStore, applyQuiz: applyQuiz, emptyStats: emptyStats, STATS_KEY: STATS_KEY, THEME_KEY: THEME_KEY };
});
