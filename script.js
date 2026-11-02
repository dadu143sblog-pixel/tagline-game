const BRANDS = [
  {brand:"Nike", tagline:"Just Do It.", industry:"Sportswear", hint:"Its famous logo is a swoosh."},
  {brand:"Apple", tagline:"Think Different.", industry:"Technology", hint:"Its logo is a piece of fruit."},
  {brand:"McDonald's", tagline:"I'm Lovin' It.", industry:"Fast food", hint:"Its golden arches are famous worldwide."},
  {brand:"KFC", tagline:"Finger Lickin' Good", industry:"Fast food", hint:"Known for its fried chicken and Colonel Sanders."},
  {brand:"Adidas", tagline:"Impossible Is Nothing", industry:"Sportswear", hint:"Its logo often features three stripes."},
  {brand:"L'Oréal", tagline:"Because You're Worth It", industry:"Beauty and cosmetics", hint:"A global haircare and beauty brand."},
  {brand:"BMW", tagline:"The Ultimate Driving Machine", industry:"Automotive", hint:"A German carmaker with a round blue-and-white logo."},
  {brand:"Disney", tagline:"The Happiest Place on Earth", industry:"Entertainment and theme parks", hint:"Mickey Mouse is one of its best-known characters."},
  {brand:"Coca-Cola", tagline:"Taste the Feeling", industry:"Beverages", hint:"A world-famous fizzy drink in a red label."},
  {brand:"Pepsi", tagline:"That's What I Like", industry:"Beverages", hint:"Its logo is a red, white and blue circle."},
  {brand:"Samsung", tagline:"Do What You Can't", industry:"Electronics", hint:"A South Korean electronics company."},
  {brand:"Nokia", tagline:"Connecting People", industry:"Telecommunications", hint:"Once especially famous for durable mobile phones."},
  {brand:"Intel", tagline:"Intel Inside", industry:"Computer processors", hint:"Its products power many computers."},
  {brand:"M&M's", tagline:"Melts in Your Mouth, Not in Your Hands", industry:"Confectionery", hint:"Small colourful chocolate candies."},
  {brand:"Subway", tagline:"Eat Fresh", industry:"Fast food", hint:"A sandwich chain known for custom-made subs."},
  {brand:"KitKat", tagline:"Have a Break, Have a KitKat", industry:"Confectionery", hint:"A chocolate-covered wafer bar."},
  {brand:"Visa", tagline:"Everywhere You Want to Be", industry:"Payments", hint:"Its logo appears on payment cards."},
  {brand:"Amazon", tagline:"Work Hard. Have Fun. Make History.", industry:"E-commerce and technology", hint:"Its name is also that of a major river."},
  {brand:"De Beers", tagline:"A Diamond Is Forever", industry:"Jewellery", hint:"Associated with diamonds and engagement rings."},
  {brand:"Red Bull", tagline:"Gives You Wings", industry:"Energy drinks", hint:"An energy drink brand with two bulls in its logo."}
];

const TOTAL_QUESTIONS = 10;
const MAX_MISTAKES = 3;
let questions = [];
let questionIndex = 0;
let score = 0;
let mistakes = 0;
let correctCount = 0;
let skippedCount = 0;
let lifelinesLeft = 2;
let current = null;
let selectedTiles = [];
let tiles = [];
let hintsUsed = new Set();
let gameResults = [];
let questionLocked = false;
let lifelineOpen = false;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startGame() {
  questions = shuffleArray(BRANDS).slice(0, TOTAL_QUESTIONS);
  questionIndex = 0;
  score = 0;
  mistakes = 0;
  correctCount = 0;
  skippedCount = 0;
  lifelinesLeft = 2;
  gameResults = [];
  loadQuestion();
  showScreen("game");
}

function loadQuestion() {
  if (questionIndex >= questions.length || mistakes >= MAX_MISTAKES) {
    showResults();
    return;
  }

  current = questions[questionIndex];
  selectedTiles = [];
  hintsUsed = new Set();
  questionLocked = false;
  lifelineOpen = false;
  tiles = makeTiles(current.brand);
  document.getElementById("tagline-text").textContent = current.tagline;
  document.getElementById("question-count").textContent =
    `QUESTION ${String(questionIndex + 1).padStart(2, "0")} / ${TOTAL_QUESTIONS}`;
  document.getElementById("progress-bar").style.width =
    `${(questionIndex / TOTAL_QUESTIONS) * 100}%`;
  document.getElementById("hint-message").textContent = "";
  document.getElementById("game-feedback").textContent = "";
  document.getElementById("lifeline-options").classList.add("hidden");
  document.getElementById("lifeline-button").disabled = lifelinesLeft <= 0;
  document.getElementById("lifeline-count").textContent = `${lifelinesLeft} left`;
  document.getElementById("current-score").textContent = score;
  document.getElementById("hint-industry").disabled = false;
  document.getElementById("hint-letter").disabled = false;
  updateMistakes();
  renderAnswer();
  renderTiles();
}

function makeTiles(answer) {
  const letters = answer.toUpperCase().replace(/[^A-Z0-9]/g, "").split("");
  const extras = "ABCDEFGHJKLMNPQRSTUVWXYZ".split("");
  while (letters.length < Math.min(14, answer.replace(/[^A-Za-z0-9]/g, "").length + 3)) {
    const extra = extras[Math.floor(Math.random() * extras.length)];
    letters.push(extra);
  }
  return shuffleArray(letters).map((letter, id) => ({ id, letter, used: false }));
}

function answerLetters() {
  return current.brand.toUpperCase().replace(/[^A-Z0-9]/g, "").split("");
}

function renderAnswer() {
  const container = document.getElementById("answer-boxes");
  container.innerHTML = "";
  const chars = current.brand.toUpperCase().split("");
  let letterPosition = 0;

  chars.forEach(char => {
    if (!/[A-Z0-9]/.test(char)) {
      const space = document.createElement("span");
      space.className = "answer-box space";
      container.appendChild(space);
      return;
    }

    const box = document.createElement("button");
    box.type = "button";
    box.className = "answer-box";
    box.setAttribute("aria-label", `Answer letter ${letterPosition + 1}`);
    const tile = selectedTiles[letterPosition];
    if (tile) {
      box.textContent = tile.letter;
      box.classList.add("filled");
      box.title = "Click to remove this letter";
      box.onclick = () => removeSelected(letterPosition);
    } else {
      box.textContent = "";
    }
    container.appendChild(box);
    letterPosition++;
  });
}

function renderTiles() {
  const container = document.getElementById("letter-tiles");
  container.innerHTML = "";
  tiles.forEach(tile => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "letter-tile";
    button.textContent = tile.letter;
    button.disabled = tile.used || questionLocked;
    button.setAttribute("aria-label", `Choose letter ${tile.letter}`);
    button.onclick = () => selectTile(tile.id);
    container.appendChild(button);
  });
}

function selectTile(id) {
  if (questionLocked) return;
  const tile = tiles.find(item => item.id === id);
  if (!tile || tile.used || selectedTiles.length >= answerLetters().length) return;
  tile.used = true;
  selectedTiles.push(tile);
  renderAnswer();
  renderTiles();
}

function removeSelected(position) {
  if (questionLocked) return;
  const tile = selectedTiles[position];
  if (!tile) return;
  tile.used = false;
  selectedTiles.splice(position, 1);
  renderAnswer();
  renderTiles();
}

function clearAnswer() {
  if (questionLocked) return;
  selectedTiles.forEach(tile => { tile.used = false; });
  selectedTiles = [];
  renderAnswer();
  renderTiles();
  document.getElementById("game-feedback").textContent = "";
}

function shuffleLetters() {
  if (questionLocked) return;
  tiles = shuffleArray(tiles);
  renderTiles();
}

function useHint(type) {
  if (questionLocked || hintsUsed.has(type)) return;
  hintsUsed.add(type);
  const message = document.getElementById("hint-message");
  if (type === 0) {
    message.textContent = `Industry: ${current.industry}`;
    document.getElementById("hint-industry").disabled = true;
  } else {
    message.textContent = `The brand begins with “${current.brand[0].toUpperCase()}”.`;
    document.getElementById("hint-letter").disabled = true;
  }
}

function useLifeline() {
  if (questionLocked || lifelinesLeft <= 0 || lifelineOpen) return;
  lifelinesLeft--;
  lifelineOpen = true;
  document.getElementById("lifeline-count").textContent = `${lifelinesLeft} left`;
  document.getElementById("lifeline-button").disabled = lifelinesLeft <= 0;
  const wrongBrands = shuffleArray(BRANDS.filter(item => item.brand !== current.brand)).slice(0, 3);
  const options = shuffleArray([current, ...wrongBrands]);
  const container = document.getElementById("brand-options");
  container.innerHTML = "";
  options.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "brand-option";
    button.textContent = item.brand;
    button.onclick = () => chooseLifelineOption(item);
    container.appendChild(button);
  });
  document.getElementById("lifeline-options").classList.remove("hidden");
}

function chooseLifelineOption(item) {
  if (questionLocked) return;
  document.getElementById("lifeline-options").classList.add("hidden");
  lifelineOpen = false;
  if (item.brand === current.brand) {
    finishQuestion(true, "Correct — you found the brand!");
  } else {
    mistakes++;
    updateMistakes();
    document.getElementById("game-feedback").textContent = `Not quite. The correct brand is ${current.brand}.`;
    finishQuestion(false, `Incorrect lifeline choice. Answer: ${current.brand}`);
  }
}

function checkAnswer() {
  if (questionLocked) return;
  const expected = answerLetters().join("");
  const guess = selectedTiles.map(tile => tile.letter).join("");
  if (guess.length !== expected.length) {
    document.getElementById("game-feedback").textContent = "Fill every answer box before submitting.";
    return;
  }
  if (guess === expected) {
    const points = hintsUsed.size === 0 ? 10 : hintsUsed.size === 1 ? 7 : 5;
    score += points;
    correctCount++;
    finishQuestion(true, `Correct! +${points} points`);
  } else {
    mistakes++;
    updateMistakes();
    document.getElementById("game-feedback").textContent =
      mistakes >= MAX_MISTAKES ? "That's your third mistake." : "That isn't quite right. Try again.";
    if (mistakes >= MAX_MISTAKES) {
      finishQuestion(false, `Answer: ${current.brand}`);
    } else {
      renderTiles();
    }
  }
}

function finishQuestion(wasCorrect, message) {
  questionLocked = true;
  const status = wasCorrect ? "correct" : "wrong";
  gameResults.push({
    brand: current.brand,
    tagline: current.tagline,
    status,
    message
  });
  document.getElementById("game-feedback").textContent = message;
  document.getElementById("current-score").textContent = score;
  renderTiles();

  window.setTimeout(() => {
    questionIndex++;
    loadQuestion();
  }, 1000);
}

function skipQuestion() {
  if (questionLocked) return;
  questionLocked = true;
  skippedCount++;
  gameResults.push({
    brand: current.brand,
    tagline: current.tagline,
    status: "skipped",
    message: "Skipped — 0 points, no mistake."
  });
  document.getElementById("game-feedback").textContent = `Skipped. Answer: ${current.brand}`;
  renderTiles();
  window.setTimeout(() => {
    questionIndex++;
    loadQuestion();
  }, 800);
}

function updateMistakes() {
  const remaining = Math.max(0, MAX_MISTAKES - mistakes);
  document.getElementById("mistakes-count").textContent =
    `${"♥ ".repeat(remaining).trim()}${remaining === 0 ? "No lives left" : ""}`;
}

function confirmQuit() {
  if (window.confirm("Quit this game and return home? Your current score will be lost.")) {
    showScreen("home");
  }
}

function showResults() {
  document.getElementById("progress-bar").style.width = "100%";
  document.getElementById("final-score").textContent = score;
  document.getElementById("correct-total").textContent = correctCount;
  document.getElementById("skipped-total").textContent = skippedCount;
  document.getElementById("mistakes-total").textContent = mistakes;

  const review = document.getElementById("answer-review");
  review.innerHTML = "";
  gameResults.forEach(result => {
    const item = document.createElement("div");
    item.className = "review-item";
    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = result.brand;
    const tagline = document.createElement("small");
    tagline.textContent = result.tagline;
    details.append(name, tagline);
    const status = document.createElement("span");
    status.className = `review-status ${result.status}`;
    status.textContent = result.status === "correct" ? "CORRECT" :
      result.status === "skipped" ? "SKIPPED" : "MISSED";
    item.append(details, status);
    review.appendChild(item);
  });
  showScreen("results");
}

showScreen("home");
