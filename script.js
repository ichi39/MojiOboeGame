// Pet Configuration Configuration
const PET_CONFIG = {
    chick: {
        id: 'chick',
        name: 'ひよこ',
        stages: [
            { minScore: 0, icon: '🥚', scale: 1.0 }, // Stage 0 (Egg)
            { minScore: 1, icon: '🐣', scale: 1.0 }, // Stage 1 (Hatching)
            { minScore: 3, icon: '🐤', scale: 1.2 }, // Stage 2 (Chick)
            { minScore: 6, icon: '🐤', scale: 1.5 }, // Stage 3 (Big Chick)
            { minScore: 10, icon: '🐓', scale: 1.5 } // Stage 4 (Rooster - Evolution)
        ]
    }
};

// Hiragana Data
const HIRAGANA_DATA = [
    { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' },
    { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' },
    { char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi' }, { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' },
    { char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi' }, { char: 'つ', romaji: 'tsu' }, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' },
    { char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' },
    { char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' },
    { char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' },
    { char: 'や', romaji: 'ya' }, { char: 'ゆ', romaji: 'yu' }, { char: 'よ', romaji: 'yo' },
    { char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' },
    { char: 'わ', romaji: 'wa' }, { char: 'を', romaji: 'wo' }, { char: 'ん', romaji: 'n' }
];

class Game {
    constructor() {
        this.currentScene = 'title';
        this.difficulty = 'normal';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.petType = 'chick';
        this.petStage = 0;

        this.initElements();
        this.attachEventListeners();
    }

    initElements() {
        this.scenes = {
            title: document.getElementById('title-scene'),
            learning: document.getElementById('learning-scene'),
            game: document.getElementById('game-scene'),
            result: document.getElementById('result-scene')
        };

        // Title elements
        this.difficultyBtns = document.querySelectorAll('[data-difficulty]');

        // Learning elements
        this.learningDisplay = {
            hiragana: document.querySelector('.hiragana-display'),
            romaji: document.querySelector('.romaji-display')
        };
        this.nextLearningBtn = document.getElementById('next-learning-btn');

        // Game elements
        this.scoreDisplay = document.getElementById('score');
        this.questionsLeftDisplay = document.getElementById('questions-left');
        this.gamePet = document.getElementById('game-pet');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');

        // Result elements
        this.resultPet = document.getElementById('result-pet');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.retryBtn = document.getElementById('retry-btn');
        this.evolutionMessage = document.getElementById('evolution-message');
    }

    attachEventListeners() {
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.startGame(e.target.dataset.difficulty));
        });

        this.nextLearningBtn.addEventListener('click', () => this.nextLearningStep()); // Corrected binding

        this.retryBtn.addEventListener('click', () => this.switchScene('title'));
    }

    switchScene(sceneName) {
        Object.values(this.scenes).forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none'; // Ensure hidden
        });
        const target = this.scenes[sceneName];
        target.style.display = 'flex'; // Reset display
        // Force reflow for animation
        void target.offsetWidth;
        target.classList.add('active');
        this.currentScene = sceneName;
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8; // Slower for kids
            window.speechSynthesis.speak(utterance);
        }
    }

    startGame(difficulty) {
        this.difficulty = difficulty;
        this.score = 0;
        this.petStage = 0; // Start fresh
        this.currentQuestionIndex = 0;
        this.correctCount = 0; // Track perfect answers

        // Determine number of questions
        let questionCount = 5;
        if (difficulty === 'easy') questionCount = 3;
        if (difficulty === 'hard') questionCount = 10;

        // Shuffle and pick questions
        const shuffled = [...HIRAGANA_DATA].sort(() => 0.5 - Math.random());
        this.questions = shuffled.slice(0, questionCount);

        this.updatePetDisplay(this.gamePet); // Initial state
        this.startLearningPhase();
    }

    startLearningPhase() {
        this.switchScene('learning');
        this.currentLearningIndex = 0;
        this.showLearningCard(0);
    }

    showLearningCard(index) {
        if (index >= this.questions.length) {
            this.startQuizPhase();
            return;
        }

        const q = this.questions[index];
        this.learningDisplay.hiragana.textContent = q.char;
        this.learningDisplay.romaji.textContent = q.romaji;

        this.speak(q.char); // Speak the character

        this.nextLearningBtn.onclick = () => {
            this.showLearningCard(index + 1);
        };
    }

    nextLearningStep() {
        // Fallback or explicit method if needed
    }

    startQuizPhase() {
        this.switchScene('game');
        this.updatePetDisplay(this.gamePet);
        this.currentQuestionIndex = 0;
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.finishGame();
            return;
        }

        const currentQ = this.questions[this.currentQuestionIndex];

        // Update UI
        this.scoreDisplay.textContent = this.score;
        this.questionsLeftDisplay.textContent = this.questions.length - this.currentQuestionIndex;
        // this.questionText.textContent = `「${currentQ.char}」のよみかたは？`;
        this.questionText.innerHTML = `<span style="font-size: 3rem; color: var(--accent-color);">${currentQ.char}</span> のよみかたは？`;

        this.speak(currentQ.char);

        // Generate Options
        const options = [currentQ];
        while (options.length < 4) {
            const random = HIRAGANA_DATA[Math.floor(Math.random() * HIRAGANA_DATA.length)];
            if (!options.includes(random)) options.push(random);
        }

        // Shuffle options
        options.sort(() => 0.5 - Math.random());

        this.optionsContainer.innerHTML = '';
        this.hasAnswered = false; // Reset answer flag for this question

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.romaji; // Showing Romaji for now
            btn.dataset.char = opt.char;
            btn.addEventListener('click', (e) => this.handleAnswer(opt === currentQ, e.target));
            this.optionsContainer.appendChild(btn);
        });
    }

    handleAnswer(isCorrect, btnElement) {
        if (this.hasAnswered) return; // Prevent multiple clicks processing if already correct

        if (isCorrect) {
            this.hasAnswered = true;
            btnElement.classList.add('correct');
            this.speak("せいかい！");
            this.score++;
            this.correctCount++;
            this.growPet();

            // Disable all buttons
            const allBtns = this.optionsContainer.querySelectorAll('button');
            allBtns.forEach(b => b.disabled = true);

            setTimeout(() => {
                this.currentQuestionIndex++;
                this.showQuestion();
            }, 1500);
        } else {
            btnElement.classList.add('wrong');
            btnElement.disabled = true; // Disable wrong option
            this.speak("ブブー");
            // Don't advance, let them try again. But maybe score penalty?
            // For now, no penalty, but they won't get 'perfect' if they miss? 
            // Actually, `correctCount` tracks perfect answers. If they miss once, do they lose the 'perfect' status for that question?
            // Let's say yes, if they miss, they don't get the point for that question, or they get 0.5?
            // Implementation Plan says: "正解するとペットが大きくなる。不正解ならそのままのサイズ。"
            // So if they miss, no growth. 
            // To prevent farming growth, we should only allow growth on the FIRST attempt?
            // Let's track `firstAttempt`
        }
    }

    growPet() {
        // Simple logic: Each correct answer (on first try?) increases score.
        // And we map score to stage? 
        // Or simply: score increments stage?
        // Let's make it more granular. Visual size increase every point.
        // Stage increase at thresholds.

        // Let's use `score` as the driver.
        const config = PET_CONFIG[this.petType];

        // Determine stage based on score/total_questions ratio?
        // Let's stick to the config thresholds for stage changes (icon changes).
        // But for size, we can interpolate?

        let newStageIndex = 0;
        config.stages.forEach((stage, index) => {
            if (this.score >= stage.minScore) {
                newStageIndex = index;
            }
        });

        if (newStageIndex > this.petStage) {
            this.petStage = newStageIndex;
            this.speak("大きくなったよ！");
            this.gamePet.classList.add('bounce');
            setTimeout(() => this.gamePet.classList.remove('bounce'), 1000);
        } else {
            // Just a small bounce for correct answer even if not evolving
            this.gamePet.classList.add('bounce');
            setTimeout(() => this.gamePet.classList.remove('bounce'), 500);
        }

        this.updatePetDisplay(this.gamePet);
    }

    updatePetDisplay(element) {
        const config = PET_CONFIG[this.petType];
        const stageData = config.stages[this.petStage] || config.stages[0];

        element.textContent = stageData.icon;
        // Base scale from stage + small increment based on progress within stage?
        // keeping it simple for now
        element.style.transform = `scale(${stageData.scale})`;
    }

    finishGame() {
        this.switchScene('result');
        this.finalScoreDisplay.textContent = this.score;

        // Evolve Logic: If All Correct?
        let isPerfect = (this.score === this.questions.length);

        const config = PET_CONFIG[this.petType];
        if (isPerfect) {
            // Force max stage (Evolution)
            this.petStage = config.stages.length - 1; // Last stage
            this.evolutionMessage.classList.remove('hidden');
            this.speak("おめでとう！ぜんもんせいかい！");
        } else {
            this.evolutionMessage.classList.add('hidden');
            this.speak("おつかれさま！");
        }

        this.updatePetDisplay(this.resultPet);
    }
}

// Start the game
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
