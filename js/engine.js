/* Quiz engine: question selection, state, scoring, streaks, lifelines, results.
   Pure logic with no DOM access, so it runs in the browser and in Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuizEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const ALL = 'All';
  const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
  const COUNT_OPTIONS = [5, 10, 15, 20];
  const TIME_OPTIONS = [10, 20, 30];

  // Scoring: base points by difficulty, plus +2 per correct answer already in the
  // current streak (capped at +10). Wrong answers and timeouts score nothing.
  const BASE_POINTS = { Easy: 10, Medium: 20, Hard: 30 };
  const STREAK_STEP = 2;
  const STREAK_MAX_BONUS = 10;

  const LIFELINES = { fifty: 1, hint: 1 };

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function categoriesOf(questions) {
    const seen = [];
    questions.forEach(function (q) { if (seen.indexOf(q.category) === -1) seen.push(q.category); });
    return seen;
  }

  function filterQuestions(questions, cfg) {
    return questions.filter(function (q) {
      return (!cfg.category || cfg.category === ALL || q.category === cfg.category) &&
             (!cfg.difficulty || cfg.difficulty === ALL || q.difficulty === cfg.difficulty);
    });
  }

  function availableCount(questions, cfg) {
    return filterQuestions(questions, cfg).length;
  }

  // Question counts the user may pick: never more than the number available.
  function countOptions(available) {
    if (available <= 0) return [];
    const opts = COUNT_OPTIONS.filter(function (n) { return n <= available; });
    return opts.length ? opts : [available];
  }

  // Pick `count` random questions (clamped to what is available) with shuffled options.
  function selectQuestions(questions, cfg, rng) {
    const pool = filterQuestions(questions, cfg);
    const n = Math.max(0, Math.min(cfg.count || pool.length, pool.length));
    return shuffle(pool, rng).slice(0, n).map(function (q) {
      return Object.assign({}, q, { options: shuffle(q.options, rng) });
    });
  }

  function createQuiz(questions, timePerQuestion) {
    return {
      questions: questions,
      timePerQuestion: timePerQuestion,
      index: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      lifelines: { fifty: LIFELINES.fifty, hint: LIFELINES.hint },
      results: [],
      step: { answered: false, removed: [], hintShown: false, fiftyUsed: false },
      finished: questions.length === 0
    };
  }

  function currentQuestion(state) {
    return state.finished ? null : state.questions[state.index];
  }

  function pointsFor(question, streakBefore) {
    const bonus = Math.min(streakBefore * STREAK_STEP, STREAK_MAX_BONUS);
    return BASE_POINTS[question.difficulty] + bonus;
  }

  function record(state, status, selected, elapsed) {
    const q = currentQuestion(state);
    const correct = status === 'correct';
    const points = correct ? pointsFor(q, state.streak) : 0;
    state.streak = correct ? state.streak + 1 : 0;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.score += points;
    state.step.answered = true;
    const result = {
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      options: q.options,
      selected: selected,
      answer: q.answer,
      status: status,
      points: points,
      elapsed: Math.min(Math.max(elapsed, 0), state.timePerQuestion),
      explanation: q.explanation,
      usedFifty: state.step.fiftyUsed,
      usedHint: state.step.hintShown
    };
    state.results.push(result);
    return result;
  }

  // Returns the result, or null if the answer was rejected (already answered,
  // quiz over, unknown option, or option removed by 50/50). This guard is what
  // prevents double scoring after a timeout or a double click.
  function answer(state, option, elapsed) {
    if (state.finished || state.step.answered) return null;
    const q = currentQuestion(state);
    if (q.options.indexOf(option) === -1 || state.step.removed.indexOf(option) !== -1) return null;
    return record(state, option === q.answer ? 'correct' : 'incorrect', option, elapsed);
  }

  function timeout(state) {
    if (state.finished || state.step.answered) return null;
    return record(state, 'timeout', null, state.timePerQuestion);
  }

  // Removes two wrong options. Returns the removed options, or null if unavailable.
  function useFiftyFifty(state, rng) {
    if (state.finished || state.step.answered || state.lifelines.fifty < 1) return null;
    const q = currentQuestion(state);
    const wrong = q.options.filter(function (o) { return o !== q.answer; });
    const removed = shuffle(wrong, rng).slice(0, Math.min(2, wrong.length - 1));
    state.lifelines.fifty -= 1;
    state.step.fiftyUsed = true;
    state.step.removed = removed;
    return removed;
  }

  // Returns the hint for the current question, or null if unavailable.
  function useHint(state) {
    if (state.finished || state.step.answered || state.lifelines.hint < 1) return null;
    state.lifelines.hint -= 1;
    state.step.hintShown = true;
    return currentQuestion(state).hint;
  }

  // Advance after the current question has been answered. Returns true when the quiz is over.
  function next(state) {
    if (state.finished || !state.step.answered) return state.finished;
    state.index += 1;
    state.step = { answered: false, removed: [], hintShown: false, fiftyUsed: false };
    if (state.index >= state.questions.length) state.finished = true;
    return state.finished;
  }

  function performanceMessage(pct) {
    if (pct >= 90) return 'Excellent!';
    if (pct >= 75) return 'Great job!';
    if (pct >= 50) return 'Good effort!';
    return 'Keep practicing — you’ll get there!';
  }

  function summarize(state) {
    const total = state.questions.length;
    const count = function (s) { return state.results.filter(function (r) { return r.status === s; }).length; };
    const correct = count('correct');
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const seconds = state.results.reduce(function (sum, r) { return sum + r.elapsed; }, 0);
    return {
      total: total,
      correct: correct,
      incorrect: count('incorrect'),
      unanswered: total - correct - count('incorrect'),
      accuracy: accuracy,
      points: state.score,
      bestStreak: state.bestStreak,
      timeSeconds: Math.round(seconds),
      message: performanceMessage(accuracy),
      results: state.results
    };
  }

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  return {
    ALL: ALL, DIFFICULTIES: DIFFICULTIES, COUNT_OPTIONS: COUNT_OPTIONS, TIME_OPTIONS: TIME_OPTIONS,
    BASE_POINTS: BASE_POINTS, STREAK_STEP: STREAK_STEP, STREAK_MAX_BONUS: STREAK_MAX_BONUS, LIFELINES: LIFELINES,
    shuffle: shuffle, categoriesOf: categoriesOf, filterQuestions: filterQuestions,
    availableCount: availableCount, countOptions: countOptions, selectQuestions: selectQuestions,
    createQuiz: createQuiz, currentQuestion: currentQuestion, pointsFor: pointsFor,
    answer: answer, timeout: timeout, useFiftyFifty: useFiftyFifty, useHint: useHint, next: next,
    summarize: summarize, performanceMessage: performanceMessage, formatTime: formatTime
  };
});
