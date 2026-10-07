/* UI controller: renders screens and wires user input to the engine and storage. */
(function () {
  'use strict';

  const E = window.QuizEngine;
  const store = window.QuizStorage.createStore(safeLocalStorage());
  const QUESTIONS = window.QUIZ_QUESTIONS;

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const LOW_SECONDS = 5;
  const RING_LENGTH = 2 * Math.PI * 52;

  const $ = function (id) { return document.getElementById(id); };
  const screens = ['setup', 'quiz', 'results', 'review'];

  let config = null;      // { category, difficulty, count, time } used for the running quiz
  let quiz = null;        // engine state
  let summary = null;     // summary of the last completed quiz
  let timer = { id: null, startedAt: 0, limit: 0 };
  const confirmTimers = new WeakMap();

  function safeLocalStorage() {
    try { return window.localStorage; } catch (e) { return { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} }; }
  }

  /* ---------- helpers ---------- */
  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function show(name) {
    screens.forEach(function (s) { $('screen-' + s).hidden = s !== name; });
    $('brandBtn').disabled = name === 'quiz'; // leave a running quiz via Quit, not by accident
    const headings = { setup: 'setupTitle', quiz: 'questionText', results: 'resultsTitle', review: 'reviewTitle' };
    const h = $(headings[name]);
    if (h) h.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function replay(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth; // restart the CSS animation
    node.classList.add(cls);
  }

  // Two-step confirmation without blocking dialogs: first click arms the button.
  function confirmClick(btn, armedLabel, action) {
    btn.addEventListener('click', function () {
      if (btn.classList.contains('confirming')) {
        clearTimeout(confirmTimers.get(btn));
        disarm(btn);
        action();
        return;
      }
      btn.dataset.label = btn.textContent;
      btn.textContent = armedLabel;
      btn.classList.add('confirming');
      confirmTimers.set(btn, setTimeout(function () { disarm(btn); }, 3500));
    });
  }
  function disarm(btn) {
    if (btn.dataset.label) btn.textContent = btn.dataset.label;
    btn.classList.remove('confirming');
  }

  /* ---------- theme ---------- */
  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    const dark = theme === 'dark';
    $('themeBtn').setAttribute('aria-pressed', String(!dark));
    $('themeBtn').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    $('themeIcon').textContent = dark ? '☀️' : '🌙';
    $('themeText').textContent = dark ? 'Light' : 'Dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0f1729' : '#f1f4fc');
    if (persist) store.setTheme(theme);
  }

  /* ---------- setup screen ---------- */
  function fillSelect(select, items, selected) {
    select.innerHTML = '';
    items.forEach(function (it) {
      const o = document.createElement('option');
      o.value = it.value; o.textContent = it.label;
      if (String(it.value) === String(selected)) o.selected = true;
      select.appendChild(o);
    });
  }

  function currentSetup() {
    return {
      category: $('categorySelect').value,
      difficulty: $('difficultySelect').value,
      count: parseInt($('countSelect').value, 10),
      time: parseInt($('timeSelect').value, 10)
    };
  }

  function refreshCounts(preferred) {
    const s = currentSetup();
    const available = E.availableCount(QUESTIONS, { category: s.category, difficulty: s.difficulty });
    const opts = E.countOptions(available);
    const keep = preferred !== undefined ? preferred : s.count;
    const pick = opts.indexOf(keep) !== -1 ? keep : (opts.indexOf(10) !== -1 ? 10 : opts[opts.length - 1]);
    fillSelect($('countSelect'), opts.map(function (n) { return { value: n, label: String(n) }; }), pick);
    $('availableNote').textContent = available + ' question' + (available === 1 ? '' : 's') + ' available for this selection.';
    $('startBtn').disabled = available === 0;
  }

  function initSetup() {
    const saved = store.getSettings();
    const cats = E.categoriesOf(QUESTIONS);
    const catItems = [{ value: E.ALL, label: 'All categories' }].concat(cats.map(function (c) { return { value: c, label: c }; }));
    const diffItems = E.DIFFICULTIES.map(function (d) { return { value: d, label: d }; }).concat([{ value: E.ALL, label: 'Mixed (all levels)' }]);
    const timeItems = E.TIME_OPTIONS.map(function (t) { return { value: t, label: t + ' seconds' }; });

    fillSelect($('categorySelect'), catItems, cats.indexOf(saved.category) !== -1 ? saved.category : E.ALL);
    fillSelect($('difficultySelect'), diffItems, [].concat(E.DIFFICULTIES, [E.ALL]).indexOf(saved.difficulty) !== -1 ? saved.difficulty : 'Medium');
    fillSelect($('timeSelect'), timeItems, E.TIME_OPTIONS.indexOf(saved.time) !== -1 ? saved.time : 20);
    fillSelect($('countSelect'), [], '');
    refreshCounts(saved.count);

    $('categorySelect').addEventListener('change', function () { refreshCounts(); });
    $('difficultySelect').addEventListener('change', function () { refreshCounts(); });
    $('setupForm').addEventListener('submit', function (e) {
      e.preventDefault();
      startQuiz(currentSetup());
    });
  }

  /* ---------- statistics panel ---------- */
  function renderStats() {
    const st = store.getStats();
    const has = st.quizzes > 0;
    $('statsEmpty').hidden = has;
    $('statsBody').hidden = !has;
    $('resetStatsBtn').hidden = !has;
    if (!has) return;

    const overall = st.questionsAnswered ? Math.round((st.correct / st.questionsAnswered) * 100) : 0;
    const tiles = [
      ['Quizzes completed', st.quizzes],
      ['Questions answered', st.questionsAnswered],
      ['Correct answers', st.correct],
      ['Overall accuracy', overall + '%'],
      ['Best score', st.bestScore + ' pts'],
      ['Best accuracy', st.bestAccuracy + '%'],
      ['Best streak', '🔥 ' + st.bestStreak],
      ['Total points', st.totalPoints]
    ];
    const grid = $('statGrid');
    grid.innerHTML = '';
    tiles.forEach(function (t) {
      const box = el('div', 'stat');
      box.appendChild(el('dt', '', t[0]));
      box.appendChild(el('dd', '', String(t[1])));
      grid.appendChild(box);
    });

    const bars = $('categoryBars');
    bars.innerHTML = '';
    Object.keys(st.byCategory).forEach(function (c) {
      const g = st.byCategory[c];
      const pct = g.answered ? Math.round((g.correct / g.answered) * 100) : 0;
      const li = el('li');
      const label = el('div', 'bar-label');
      label.appendChild(el('span', '', c));
      label.appendChild(el('span', '', pct + '% (' + g.correct + '/' + g.answered + ')'));
      const track = el('div', 'bar-track');
      const fill = el('div', 'bar-fill');
      fill.style.width = pct + '%';
      track.appendChild(fill);
      li.appendChild(label); li.appendChild(track);
      bars.appendChild(li);
    });
  }

  /* ---------- quiz flow ---------- */
  function startQuiz(cfg) {
    const questions = E.selectQuestions(QUESTIONS, { category: cfg.category, difficulty: cfg.difficulty, count: cfg.count });
    if (!questions.length) return;
    config = cfg;
    store.setSettings(cfg);
    quiz = E.createQuiz(questions, cfg.time);
    summary = null;
    show('quiz');
    renderQuestion();
  }

  function stopTimer() {
    if (timer.id) { clearInterval(timer.id); timer.id = null; }
  }

  function secondsLeft() {
    const left = timer.limit - (Date.now() - timer.startedAt) / 1000;
    return Math.max(0, Math.ceil(left - 0.0001));
  }

  function renderTimer() {
    const left = secondsLeft();
    const low = left <= LOW_SECONDS;
    $('timerValue').textContent = String(left);
    $('timer').classList.toggle('low', low && !quiz.step.answered);
    const fill = $('timerFill');
    const exact = Math.max(0, timer.limit - (Date.now() - timer.startedAt) / 1000);
    fill.style.width = (exact / timer.limit) * 100 + '%';
    fill.classList.toggle('low', low);
    fill.classList.toggle('mid', !low && left <= timer.limit / 2);
    return left;
  }

  function startTimer() {
    stopTimer();
    timer.limit = quiz.timePerQuestion;
    timer.startedAt = Date.now();
    $('timerAnnounce').textContent = '';
    renderTimer();
    timer.id = setInterval(function () {
      const left = renderTimer();
      if (left === LOW_SECONDS) $('timerAnnounce').textContent = LOW_SECONDS + ' seconds left';
      if (left <= 0) handleTimeout();
    }, 200);
  }

  function updateHud() {
    const total = quiz.questions.length;
    const shown = Math.min(quiz.index + 1, total);
    $('qCount').textContent = 'Question ' + shown + ' / ' + total;
    $('scoreValue').textContent = String(quiz.score);
    $('streakValue').textContent = String(quiz.streak);
    $('streakChip').classList.toggle('hot', quiz.streak >= 3);
    // Progress counts questions completed so far.
    const done = quiz.results.length;
    $('progressFill').style.width = (done / total) * 100 + '%';
    const bar = $('progressBar');
    bar.setAttribute('aria-valuemax', String(total));
    bar.setAttribute('aria-valuenow', String(done));
    bar.setAttribute('aria-valuetext', done + ' of ' + total + ' questions completed');
  }

  function updateLifelines() {
    const answered = quiz.step.answered;
    const f = quiz.lifelines.fifty, h = quiz.lifelines.hint;
    $('fiftyBtn').disabled = answered || f < 1;
    $('hintBtn').disabled = answered || h < 1;
    $('fiftyUses').textContent = f < 1 ? '(used)' : '×' + f;
    $('hintUses').textContent = h < 1 ? '(used)' : '×' + h;
    $('fiftyBtn').setAttribute('aria-label', f < 1 ? '50/50 lifeline, already used' : '50/50 lifeline, ' + f + ' remaining');
    $('hintBtn').setAttribute('aria-label', h < 1 ? 'Hint lifeline, already used' : 'Hint lifeline, ' + h + ' remaining');
  }

  function renderQuestion() {
    const q = E.currentQuestion(quiz);
    const qt = $('questionText');
    qt.textContent = q.question;
    replay(qt, 'question-enter');
    $('qCategory').textContent = q.category;
    $('qDifficulty').textContent = q.difficulty;
    $('hintBox').hidden = true;
    $('feedback').hidden = true;
    $('feedback').className = 'feedback';
    $('nextBtn').hidden = true;

    const box = $('options');
    box.innerHTML = '';
    q.options.forEach(function (opt, i) {
      const b = el('button', 'option');
      b.type = 'button';
      b.dataset.index = String(i);
      b.dataset.value = opt;
      b.appendChild(el('span', 'option-letter', LETTERS[i]));
      b.appendChild(el('span', 'option-text', opt));
      b.appendChild(el('span', 'option-mark'));
      b.setAttribute('aria-label', 'Option ' + LETTERS[i] + ': ' + opt);
      b.addEventListener('click', function () { handleAnswer(opt); });
      box.appendChild(b);
    });
    replay(box, 'question-enter');

    updateHud();
    updateLifelines();
    startTimer();
  }

  function optionButtons() { return Array.prototype.slice.call($('options').querySelectorAll('.option')); }

  function revealResult(result) {
    optionButtons().forEach(function (b) {
      const v = b.dataset.value;
      const mark = b.querySelector('.option-mark');
      b.disabled = true;
      b.classList.add('dim');
      if (v === result.answer) {
        b.classList.add('correct');
        mark.textContent = '✓ Correct';
      } else if (v === result.selected) {
        b.classList.add('wrong');
        mark.textContent = '✗ Your answer';
      }
    });

    const fb = $('feedback');
    fb.hidden = false;
    let title, body;
    if (result.status === 'correct') {
      fb.classList.add('ok');
      title = '✅ Correct! +' + result.points + ' points';
      body = result.explanation;
    } else if (result.status === 'incorrect') {
      fb.classList.add('no');
      title = '❌ Incorrect';
      body = 'The correct answer is “' + result.answer + '”. ' + result.explanation;
    } else {
      fb.classList.add('time');
      title = '⏰ Time’s up!';
      body = 'The correct answer is “' + result.answer + '”. ' + result.explanation;
    }
    $('feedbackTitle').textContent = title;
    $('feedbackBody').textContent = body;
    replay(fb, 'question-enter');

    const last = quiz.index >= quiz.questions.length - 1;
    const next = $('nextBtn');
    next.textContent = last ? 'See results' : 'Next →';
    next.hidden = false;

    updateHud();
    updateLifelines();
    replay($('scoreValue').parentNode, 'bump');
    if (result.status === 'correct' && quiz.streak > 1) replay($('streakChip'), 'bump');
    next.focus();
  }

  function handleAnswer(option) {
    if (!quiz || quiz.step.answered) return;
    stopTimer();
    const elapsed = (Date.now() - timer.startedAt) / 1000;
    const result = E.answer(quiz, option, elapsed);
    if (result) revealResult(result);
  }

  function handleTimeout() {
    if (!quiz || quiz.step.answered) return;
    stopTimer();
    renderTimer();
    const result = E.timeout(quiz);
    if (result) revealResult(result);
  }

  function handleFifty() {
    const removed = E.useFiftyFifty(quiz);
    if (!removed) return;
    optionButtons().forEach(function (b) {
      if (removed.indexOf(b.dataset.value) !== -1) {
        b.disabled = true;
        b.classList.add('removed');
        b.querySelector('.option-mark').textContent = 'Removed';
      }
    });
    updateLifelines();
  }

  function handleHint() {
    const text = E.useHint(quiz);
    if (!text) return;
    $('hintText').textContent = text;
    $('hintBox').hidden = false;
    updateLifelines();
  }

  function handleNext() {
    if (!quiz || !quiz.step.answered) return;
    if (E.next(quiz)) finishQuiz();
    else renderQuestion();
  }

  function finishQuiz() {
    stopTimer();
    summary = E.summarize(quiz);
    const out = store.recordQuiz(summary);
    renderResults(out.records);
    renderStats();
    show('results');
    // Animate the ring after the screen is visible.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $('ringFg').style.strokeDashoffset = String(RING_LENGTH * (1 - summary.accuracy / 100));
      });
    });
  }

  function goHome() {
    stopTimer();
    quiz = null;
    refreshCounts();
    renderStats();
    show('setup');
  }

  /* ---------- results & review ---------- */
  function renderResults(records) {
    $('resultScore').textContent = summary.correct + ' / ' + summary.total;
    $('resultPct').textContent = summary.accuracy + '%';
    $('resultMessage').textContent = summary.message;
    const ring = $('ringFg');
    ring.style.transition = 'none';
    ring.style.strokeDashoffset = String(RING_LENGTH);
    void ring.getBoundingClientRect();
    ring.style.transition = '';

    const notes = [];
    if (records.score) notes.push('New best score');
    if (records.accuracy) notes.push('New best accuracy');
    if (records.streak) notes.push('New best streak');
    $('recordNote').hidden = notes.length === 0;
    $('recordNote').textContent = notes.length ? '🏆 ' + notes.join(' · ') + '!' : '';

    const rows = [
      ['Points', summary.points],
      ['Accuracy', summary.accuracy + '%'],
      ['Correct', summary.correct],
      ['Incorrect', summary.incorrect],
      ['Unanswered', summary.unanswered],
      ['Best streak', '🔥 ' + summary.bestStreak],
      ['Time', E.formatTime(summary.timeSeconds)]
    ];
    const grid = $('resultGrid');
    grid.innerHTML = '';
    rows.forEach(function (r) {
      const box = el('div', 'stat');
      box.appendChild(el('dt', '', r[0]));
      box.appendChild(el('dd', '', String(r[1])));
      grid.appendChild(box);
    });
  }

  function renderReview() {
    const onlyMistakes = $('mistakesOnly').checked;
    const list = $('reviewList');
    list.innerHTML = '';
    let shown = 0;
    summary.results.forEach(function (r, i) {
      if (onlyMistakes && r.status === 'correct') return;
      shown++;
      const cls = r.status === 'correct' ? 'ok' : r.status === 'incorrect' ? 'no' : 'time';
      const label = r.status === 'correct' ? '✓ Correct' : r.status === 'incorrect' ? '✗ Incorrect' : '⏰ Time ran out';
      const li = el('li', 'review-item ' + cls);
      li.appendChild(el('p', 'review-status', 'Question ' + (i + 1) + ' · ' + label));
      li.appendChild(el('p', 'review-q', r.question));
      const yours = el('p', 'review-line');
      yours.appendChild(el('b', '', 'Your answer: '));
      yours.appendChild(document.createTextNode(r.selected === null ? 'No answer (time ran out)' : r.selected));
      li.appendChild(yours);
      if (r.status !== 'correct') {
        const right = el('p', 'review-line');
        right.appendChild(el('b', '', 'Correct answer: '));
        right.appendChild(document.createTextNode(r.answer));
        li.appendChild(right);
      }
      if (r.explanation) li.appendChild(el('p', 'review-expl', r.explanation));
      list.appendChild(li);
    });
    $('reviewEmpty').hidden = shown !== 0;
  }

  function playAgain() {
    const cfg = config || currentSetup();
    const available = E.availableCount(QUESTIONS, cfg);
    startQuiz(Object.assign({}, cfg, { count: Math.min(cfg.count, available) }));
  }

  /* ---------- keyboard ---------- */
  function onKeydown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if ($('screen-quiz').hidden || !quiz) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'SELECT' || tag === 'INPUT') return;

    if (!quiz.step.answered) {
      const idx = '1234'.indexOf(e.key);
      const letter = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
      const i = idx !== -1 ? idx : letter;
      if (i !== -1) {
        const b = optionButtons()[i];
        if (b && !b.disabled) { e.preventDefault(); handleAnswer(b.dataset.value); }
      }
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
      e.preventDefault();
      handleNext();
    }
  }

  /* ---------- init ---------- */
  function init() {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);
    $('themeBtn').addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
    $('brandBtn').addEventListener('click', function () {
      goHome();
    });

    initSetup();
    renderStats();

    $('fiftyBtn').addEventListener('click', handleFifty);
    $('hintBtn').addEventListener('click', handleHint);
    $('nextBtn').addEventListener('click', handleNext);
    confirmClick($('quitBtn'), 'Click again to quit', goHome);
    confirmClick($('restartBtn'), 'Click again to restart', function () { startQuiz(config); });
    confirmClick($('resetStatsBtn'), 'Click again to erase', function () { store.resetStats(); renderStats(); });

    $('reviewBtn').addEventListener('click', function () { $('mistakesOnly').checked = false; renderReview(); show('review'); });
    $('playAgainBtn').addEventListener('click', playAgain);
    $('homeBtn').addEventListener('click', goHome);
    $('mistakesOnly').addEventListener('change', renderReview);
    $('backToResultsBtn').addEventListener('click', function () { show('results'); });
    $('reviewPlayAgainBtn').addEventListener('click', playAgain);
    $('reviewHomeBtn').addEventListener('click', goHome);

    document.addEventListener('keydown', onKeydown);
    show('setup');
    window.scrollTo(0, 0);
  }

  init();
})();
