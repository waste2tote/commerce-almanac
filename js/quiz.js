// ============================================================
// Games page: Quiz (MCQ), Flashcards, Matching Game
// ============================================================

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------- Mode switching ---------------- */

function initModeSwitch() {
  const buttons = document.querySelectorAll(".mode-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".game-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(btn.dataset.panel).classList.add("active");
    });
  });
}

/* ================= QUIZ (MCQ) ================= */

const QUIZ_LENGTH = 10;
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function buildQuizQuestions() {
  const pool = shuffle(TERMS).slice(0, QUIZ_LENGTH);
  quizQuestions = pool.map(correctTerm => {
    const sameCategory = TERMS.filter(t => t.category === correctTerm.category && t.term !== correctTerm.term);
    const otherPool = sameCategory.length >= 3 ? sameCategory : TERMS.filter(t => t.term !== correctTerm.term);
    const distractors = shuffle(otherPool).slice(0, 3);
    const options = shuffle([correctTerm, ...distractors]);
    return {
      term: correctTerm.term,
      category: correctTerm.category,
      correctDefinition: correctTerm.definition,
      options: options.map(o => o.definition),
    };
  });
}

function startQuiz() {
  buildQuizQuestions();
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  renderQuizQuestion();
}

function renderQuizScoreboard() {
  document.getElementById("quizScoreboard").innerHTML = `
    Question <span>${Math.min(quizIndex + 1, QUIZ_LENGTH)} / ${QUIZ_LENGTH}</span>
    &nbsp;·&nbsp; Score <span>${quizScore}</span>`;
}

function renderQuizQuestion() {
  renderQuizScoreboard();
  const stage = document.getElementById("quizStage");

  if (quizIndex >= QUIZ_LENGTH) {
    stage.innerHTML = `
      <div class="quiz-card quiz-end">
        <p class="eyebrow">Round complete</p>
        <div class="big-score">${quizScore} / ${QUIZ_LENGTH}</div>
        <p>${quizScoreMessage(quizScore)}</p>
        <button class="btn btn-primary" id="quizRestart">Start a new round</button>
      </div>`;
    document.getElementById("quizRestart").addEventListener("click", startQuiz);
    return;
  }

  const q = quizQuestions[quizIndex];
  const catInfo = CATEGORIES.find(c => c.id === q.category);
  quizAnswered = false;

  stage.innerHTML = `
    <div class="quiz-card">
      <span class="quiz-tag">${catInfo ? catInfo.label : q.category}</span>
      <p class="quiz-q">Which definition matches <strong>${q.term}</strong>?</p>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `<button class="quiz-opt" data-i="${i}">${opt}</button>`).join("")}
      </div>
      <p class="quiz-feedback" id="quizFeedback"></p>
      <div class="quiz-next" id="quizNextWrap"></div>
    </div>`;

  stage.querySelectorAll(".quiz-opt").forEach(btn => {
    btn.addEventListener("click", () => handleQuizAnswer(btn, q));
  });
}

function quizScoreMessage(score) {
  const pct = score / QUIZ_LENGTH;
  if (pct === 1) return "A perfect ledger — every entry balanced.";
  if (pct >= 0.7) return "Strong showing. A few terms worth a second look.";
  if (pct >= 0.4) return "A fair pass through the almanac — worth another round.";
  return "Early days. Try the flashcards, then come back for another round.";
}

function handleQuizAnswer(btn, q) {
  if (quizAnswered) return;
  quizAnswered = true;
  const chosen = q.options[Number(btn.dataset.i)];
  const correct = chosen === q.correctDefinition;
  if (correct) quizScore++;

  document.querySelectorAll(".quiz-opt").forEach(b => {
    b.disabled = true;
    if (b.textContent === q.correctDefinition) b.classList.add("correct");
    else if (b === btn) b.classList.add("wrong");
  });

  const feedback = document.getElementById("quizFeedback");
  feedback.textContent = correct ? "Correct." : `Not quite — the correct definition is highlighted.`;
  feedback.className = "quiz-feedback " + (correct ? "good" : "bad");

  document.getElementById("quizNextWrap").innerHTML =
    `<button class="btn btn-primary" id="quizNextBtn">${quizIndex + 1 === QUIZ_LENGTH ? "See result" : "Next question"}</button>`;
  document.getElementById("quizNextBtn").addEventListener("click", () => {
    quizIndex++;
    renderQuizQuestion();
  });
  renderQuizScoreboard();
}

/* ================= FLASHCARDS ================= */

let flashDeck = [];
let flashIndex = 0;
let flashSeenCount = 0;

function buildFlashDeck() {
  flashDeck = shuffle(TERMS);
  flashIndex = 0;
  flashSeenCount = 0;
}

function renderFlashcard() {
  const term = flashDeck[flashIndex];
  const catInfo = CATEGORIES.find(c => c.id === term.category);
  const card = document.getElementById("flashcard");
  card.classList.remove("flipped");
  document.getElementById("flashFront").innerHTML = `<span class="flash-term">${term.term}</span>`;
  document.getElementById("flashBack").innerHTML = `
    <span class="fb-tag">${catInfo ? catInfo.label : term.category}</span>
    <span>${term.definition}</span>`;
  document.getElementById("flashCounter").textContent = `Card ${flashIndex + 1} of ${flashDeck.length}`;
}

function initFlashcards() {
  buildFlashDeck();
  renderFlashcard();

  document.getElementById("flashcard").addEventListener("click", () => {
    document.getElementById("flashcard").classList.toggle("flipped");
  });

  document.getElementById("flashNext").addEventListener("click", () => {
    flashIndex = (flashIndex + 1) % flashDeck.length;
    renderFlashcard();
  });

  document.getElementById("flashPrev").addEventListener("click", () => {
    flashIndex = (flashIndex - 1 + flashDeck.length) % flashDeck.length;
    renderFlashcard();
  });

  document.getElementById("flashShuffle").addEventListener("click", () => {
    buildFlashDeck();
    renderFlashcard();
  });
}

/* ================= MATCHING GAME ================= */

const MATCH_PAIRS = 6;
let matchTerms = [];
let selectedTerm = null;
let selectedDef = null;
let matchedCount = 0;

function buildMatchRound() {
  matchTerms = shuffle(TERMS).slice(0, MATCH_PAIRS);
  matchedCount = 0;
  selectedTerm = null;
  selectedDef = null;
  renderMatchRound();
}

function renderMatchRound() {
  const termCol = document.getElementById("matchTerms");
  const defCol = document.getElementById("matchDefs");

  const shuffledTerms = shuffle(matchTerms);
  const shuffledDefs = shuffle(matchTerms);

  termCol.innerHTML = shuffledTerms.map(t =>
    `<button class="match-item" data-term="${t.term}" data-role="term">${t.term}</button>`
  ).join("");

  defCol.innerHTML = shuffledDefs.map(t =>
    `<button class="match-item" data-term="${t.term}" data-role="def">${t.definition}</button>`
  ).join("");

  document.querySelectorAll(".match-item").forEach(el => {
    el.addEventListener("click", () => handleMatchClick(el));
  });

  updateMatchStatus();
}

function updateMatchStatus() {
  document.getElementById("matchStatus").textContent =
    `${matchedCount} of ${MATCH_PAIRS} pairs matched`;
}

function handleMatchClick(el) {
  if (el.classList.contains("matched")) return;
  const role = el.dataset.role;

  if (role === "term") {
    if (selectedTerm) selectedTerm.classList.remove("selected");
    selectedTerm = el;
    el.classList.add("selected");
  } else {
    if (selectedDef) selectedDef.classList.remove("selected");
    selectedDef = el;
    el.classList.add("selected");
  }

  if (selectedTerm && selectedDef) {
    if (selectedTerm.dataset.term === selectedDef.dataset.term) {
      selectedTerm.classList.add("matched");
      selectedDef.classList.add("matched");
      selectedTerm.classList.remove("selected");
      selectedDef.classList.remove("selected");
      selectedTerm = null;
      selectedDef = null;
      matchedCount++;
      updateMatchStatus();
      if (matchedCount === MATCH_PAIRS) {
        document.getElementById("matchStatus").innerHTML =
          `All ${MATCH_PAIRS} pairs matched. <button class="btn btn-outline" id="matchNewRound">New round</button>`;
        document.getElementById("matchNewRound").addEventListener("click", buildMatchRound);
      }
    } else {
      const t = selectedTerm, d = selectedDef;
      t.classList.add("shake");
      d.classList.add("shake");
      setTimeout(() => {
        t.classList.remove("selected", "shake");
        d.classList.remove("selected", "shake");
      }, 320);
      selectedTerm = null;
      selectedDef = null;
    }
  }
}

/* ================= Init ================= */

document.addEventListener("DOMContentLoaded", () => {
  initModeSwitch();
  startQuiz();
  initFlashcards();
  buildMatchRound();
});
