const wordBank = {
  sinonimos: [
    { word: "mamá", answer: "madre", options: ["madre", "papá", "hijo", "tía"] },
    { word: "rápido", answer: "veloz", options: ["lento", "veloz", "quieto", "bajo"] },
    { word: "feliz", answer: "contento", options: ["triste", "contento", "enojado", "cansado"] },
    { word: "bonito", answer: "hermoso", options: ["feo", "hermoso", "duro", "vacío"] },
    { word: "grande", answer: "enorme", options: ["pequeño", "mínimo", "enorme", "corto"] },
    { word: "limpio", answer: "aseado", options: ["sucio", "aseado", "oscuro", "roto"] },
    { word: "amigo", answer: "compañero", options: ["enemigo", "compañero", "extraño", "rival"] },
    { word: "frío", answer: "helado", options: ["caliente", "tibio", "helado", "seco"] },
    { word: "nuevo", answer: "reciente", options: ["viejo", "reciente", "antiguo", "dañado"] },
    { word: "alto", answer: "elevado", options: ["bajo", "elevado", "pequeño", "corto"] }
  ],
  antonimos: [
    { word: "rápido", answer: "lento", options: ["veloz", "ligero", "lento", "pronto"] },
    { word: "grande", answer: "pequeño", options: ["enorme", "pequeño", "gigante", "amplio"] },
    { word: "feliz", answer: "triste", options: ["contento", "alegre", "triste", "animado"] },
    { word: "limpio", answer: "sucio", options: ["aseado", "claro", "sucio", "ordenado"] },
    { word: "alto", answer: "bajo", options: ["elevado", "grande", "bajo", "largo"] },
    { word: "frío", answer: "caliente", options: ["helado", "caliente", "fresco", "congelado"] },
    { word: "nuevo", answer: "viejo", options: ["reciente", "moderno", "viejo", "actual"] },
    { word: "día", answer: "noche", options: ["mañana", "tarde", "noche", "sol"] },
    { word: "encender", answer: "apagar", options: ["prender", "iluminar", "apagar", "activar"] },
    { word: "entrada", answer: "salida", options: ["puerta", "ingreso", "salida", "pasillo"] }
  ],
  oraciones: [
    { word: "Ordena la oración", answer: "La panda come bambú", options: ["La panda come bambú", "Panda la bambú come", "Come la bambú panda", "Bambú come la panda"] },
    { word: "Elige la oración simple", answer: "El niño lee un cuento.", options: ["El niño lee un cuento.", "Rápido mesa azul.", "La escuela porque sí.", "Bonito corre papel."] },
    { word: "Completa: La niña ____ una flor.", answer: "dibuja", options: ["dibuja", "grande", "ayer", "verde"] },
    { word: "Completa: El perro ____ en el patio.", answer: "juega", options: ["juega", "feliz", "casa", "bonito"] },
    { word: "Elige la oración correcta", answer: "Mi mamá cocina sopa.", options: ["Mi mamá cocina sopa.", "Cocina sopa mi.", "Mamá mi sopa.", "Sopa cocina mi."] },
    { word: "Completa: Panchita ____ palabras.", answer: "aprende", options: ["aprende", "alto", "silla", "verde"] }
  ]
};

const instructions = {
  sinonimos: "Elige el sinónimo correcto.",
  antonimos: "Elige el antónimo correcto.",
  oraciones: "Elige la oración o palabra correcta."
};

const modeButtons = document.querySelectorAll(".mode-button");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const timerEl = document.getElementById("timer");
const bestScoreEl = document.getElementById("bestScore");
const progressBar = document.getElementById("progressBar");
const instructionEl = document.getElementById("gameInstruction");
const questionText = document.getElementById("questionText");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const startGameBtn = document.getElementById("startGame");
const nextQuestionBtn = document.getElementById("nextQuestion");
const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spinButton");
const spinResult = document.getElementById("spinResult");
const spinChallenge = document.getElementById("spinChallenge");

let currentMode = "sinonimos";
let currentQuestion = null;
let score = 0;
let level = 1;
let questionCount = 0;
let answered = false;
let timer = 45;
let timerInterval = null;
let bestScore = Number(localStorage.getItem("panchitaBestScore")) || 0;
let wheelRotation = 0;

bestScoreEl.textContent = bestScore;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  resetGame(false);
  instructionEl.textContent = instructions[mode];
  questionText.textContent = mode === "oraciones" ? "Presiona iniciar para formar oraciones" : "Presiona iniciar para jugar";
}

function resetGame(clearBest = false) {
  clearInterval(timerInterval);
  score = 0;
  level = 1;
  questionCount = 0;
  timer = 45;
  answered = false;
  currentQuestion = null;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  timerEl.textContent = timer;
  progressBar.style.width = "0%";
  optionsEl.innerHTML = "";
  feedbackEl.textContent = "";
  nextQuestionBtn.disabled = true;
  startGameBtn.disabled = false;
  if (clearBest) {
    bestScore = 0;
    localStorage.setItem("panchitaBestScore", "0");
    bestScoreEl.textContent = "0";
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer -= 1;
    timerEl.textContent = timer;
    if (timer <= 0) {
      finishRound("Se acabó el tiempo. Presiona iniciar para volver a jugar.");
    }
  }, 1000);
}

function startGame() {
  score = 0;
  level = 1;
  questionCount = 0;
  timer = 45;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  timerEl.textContent = timer;
  progressBar.style.width = "0%";
  feedbackEl.textContent = "";
  startGameBtn.disabled = true;
  nextQuestionBtn.disabled = true;
  startTimer();
  loadQuestion();
}

function loadQuestion(customMode = null, customWord = null) {
  answered = false;
  const mode = customMode || currentMode;
  const bank = wordBank[mode];
  currentQuestion = customWord ? bank.find((item) => item.word === customWord) || bank[0] : bank[Math.floor(Math.random() * bank.length)];
  instructionEl.textContent = instructions[mode];
  questionText.textContent = mode === "oraciones" ? currentQuestion.word : `Palabra: ${currentQuestion.word}`;
  optionsEl.innerHTML = "";
  feedbackEl.textContent = "";
  nextQuestionBtn.disabled = true;
  shuffle(currentQuestion.options).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(button, option));
    optionsEl.appendChild(button);
  });
}

function checkAnswer(button, selected) {
  if (answered || !currentQuestion) return;
  answered = true;
  const isCorrect = selected === currentQuestion.answer;
  document.querySelectorAll(".option-button").forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === currentQuestion.answer) btn.classList.add("correct");
  });
  if (isCorrect) {
    button.classList.add("correct");
    score += 10 + (level - 1) * 2;
    questionCount += 1;
    feedbackEl.textContent = "¡Correcto! Panchita está feliz.";
  } else {
    button.classList.add("incorrect");
    feedbackEl.textContent = `Casi. La respuesta correcta era: ${currentQuestion.answer}.`;
  }
  scoreEl.textContent = score;
  updateBestScore();
  updateProgress();
  nextQuestionBtn.disabled = false;
  if (questionCount > 0 && questionCount % 4 === 0) {
    level += 1;
    levelEl.textContent = level;
    timer += 8;
    timerEl.textContent = timer;
  }
}

function nextQuestion() {
  loadQuestion();
}

function updateProgress() {
  const progress = Math.min((questionCount % 4) * 25, 100);
  progressBar.style.width = `${progress}%`;
}

function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("panchitaBestScore", String(bestScore));
    bestScoreEl.textContent = bestScore;
  }
}

function finishRound(message) {
  clearInterval(timerInterval);
  document.querySelectorAll(".option-button").forEach((btn) => (btn.disabled = true));
  feedbackEl.textContent = message;
  startGameBtn.disabled = false;
  nextQuestionBtn.disabled = true;
  updateBestScore();
}

function spinWheel() {
  spinButton.disabled = true;
  const allWords = ["mamá", "rápido", "grande", "feliz", "frío", "nuevo", "alto", "limpio"];
  const index = Math.floor(Math.random() * allWords.length);
  const selectedWord = allWords[index];
  const extraSpin = 360 * 4;
  const segmentAngle = 45;
  const target = 360 - (index * segmentAngle + 22);
  wheelRotation += extraSpin + target;
  wheel.style.transform = `rotate(${wheelRotation}deg)`;

  setTimeout(() => {
    spinResult.textContent = selectedWord;
    const randomMode = Math.random() > 0.5 ? "sinonimos" : "antonimos";
    spinChallenge.textContent = `Reto: encuentra un ${randomMode === "sinonimos" ? "sinónimo" : "antónimo"} de “${selectedWord}”.`;
    setMode(randomMode);
    startGameBtn.disabled = true;
    if (!timerInterval) startTimer();
    loadQuestion(randomMode, selectedWord);
    spinButton.disabled = false;
    document.getElementById("juegos").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 1900);
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

startGameBtn.addEventListener("click", startGame);
nextQuestionBtn.addEventListener("click", nextQuestion);
spinButton.addEventListener("click", spinWheel);

setMode("sinonimos");
