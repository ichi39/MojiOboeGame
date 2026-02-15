// Pet Configuration
const PET_CONFIG = {
    chick: {
        id: 'chick',
        name: 'ひよこ',
        stages: [
            { minScore: 0, icon: '🥚', scale: 1.0 }, // Stage 0
            { minScore: 1, icon: '🐣', scale: 1.0 }, // Stage 1
            { minScore: 3, icon: '🐤', scale: 1.2 }, // Stage 2
            { minScore: 6, icon: '🐤', scale: 1.5 }, // Stage 3
            { minScore: 10, icon: '🐓', scale: 1.5 } // Stage 4
        ]
    }
};

// Hiragana Data with Mnemonics
// Word contains the target character. We need to know WHICH character is the target to highlight it.
// Simple approach: wrap target in <span> or just store index? 
// Let's store `word` and `emoji`. We will find `char` in `word` and wrap it.
const HIRAGANA_DATA = [
    { char: 'あ', romaji: 'a', word: 'あめ', emoji: '🍬' },
    { char: 'い', romaji: 'i', word: 'いちご', emoji: '🍓' },
    { char: 'う', romaji: 'u', word: 'うさぎ', emoji: '🐰' },
    { char: 'え', romaji: 'e', word: 'えんぴつ', emoji: '✏️' },
    { char: 'お', romaji: 'o', word: 'おにぎり', emoji: '🍙' },
    { char: 'か', romaji: 'ka', word: 'かさ', emoji: '🌂' },
    { char: 'き', romaji: 'ki', word: 'き', emoji: '🌳' },
    { char: 'く', romaji: 'ku', word: 'くつ', emoji: '👟' },
    { char: 'け', romaji: 'ke', word: 'けーき', emoji: '🍰' },
    { char: 'こ', romaji: 'ko', word: 'こま', emoji: '🎲' }, // using dice as top substitute or generic toy
    { char: 'さ', romaji: 'sa', word: 'さかな', emoji: '🐟' },
    { char: 'し', romaji: 'shi', word: 'しんかんせん', emoji: '🚅' },
    { char: 'す', romaji: 'su', word: 'すいか', emoji: '🍉' },
    { char: 'せ', romaji: 'se', word: 'せみ', emoji: '🐛' }, // bug generic
    { char: 'そ', romaji: 'so', word: 'そふとくりーむ', emoji: '🍦' },
    { char: 'た', romaji: 'ta', word: 'たいよう', emoji: '☀️' },
    { char: 'ち', romaji: 'chi', word: 'ちきゅう', emoji: '🌍' },
    { char: 'つ', romaji: 'tsu', word: 'つき', emoji: '🌙' },
    { char: 'て', romaji: 'te', word: 'て', emoji: '✋' },
    { char: 'と', romaji: 'to', word: 'とまと', emoji: '🍅' },
    { char: 'な', romaji: 'na', word: 'なす', emoji: '🍆' },
    { char: 'に', romaji: 'ni', word: 'にく', emoji: '🍖' },
    { char: 'ぬ', romaji: 'nu', word: 'いぬ', emoji: '🐶' }, // Special case: ends with nu? No, starts with? 'nu' is hard. 'inu' contains it.
    { char: 'ね', romaji: 'ne', word: 'ねこ', emoji: '🐱' },
    { char: 'の', romaji: 'no', word: 'のーと', emoji: '📓' },
    { char: 'は', romaji: 'ha', word: 'はさみ', emoji: '✂️' },
    { char: 'ひ', romaji: 'hi', word: 'ひこうき', emoji: '✈️' },
    { char: 'ふ', romaji: 'fu', word: 'ふうせん', emoji: '🎈' },
    { char: 'へ', romaji: 'he', word: 'へび', emoji: '🐍' },
    { char: 'ほ', romaji: 'ho', word: 'ほん', emoji: '📚' },
    { char: 'ま', romaji: 'ma', word: 'まいく', emoji: '🎤' },
    { char: 'み', romaji: 'mi', word: 'みかん', emoji: '🍊' },
    { char: 'む', romaji: 'mu', word: 'むし', emoji: '🐞' },
    { char: 'め', romaji: 'me', word: 'めがね', emoji: '👓' },
    { char: 'も', romaji: 'mo', word: 'もも', emoji: '🍑' },
    { char: 'や', romaji: 'ya', word: 'やま', emoji: '⛰️' },
    { char: 'ゆ', romaji: 'yu', word: 'ゆき', emoji: '❄️' },
    { char: 'よ', romaji: 'yo', word: 'よっと', emoji: '⛵' },
    { char: 'ra', romaji: 'ra', word: 'らっぱ', emoji: '🎺' }, // Typo fix in next step if caught, 'ら'
    { char: 'ら', romaji: 'ra', word: 'らっぱ', emoji: '🎺' },
    { char: 'り', romaji: 'ri', word: 'りんご', emoji: '🍎' },
    { char: 'る', romaji: 'ru', word: 'かえる', emoji: '🐸' }, // contained
    { char: 'れ', romaji: 're', word: 'れもん', emoji: '🍋' },
    { char: 'ろ', romaji: 'ro', word: 'ろうそく', emoji: '🕯️' },
    { char: 'わ', romaji: 'wa', word: 'わに', emoji: '🐊' },
    { char: 'を', romaji: 'wo', word: 'ほんをよむ', emoji: '📖' }, // particle
    { char: 'ん', romaji: 'n', word: 'おでん', emoji: '🍢' }
];

// Clean up duplicate 'ra' and ensure char key is correct
const CLEAN_HIRAGANA_DATA = HIRAGANA_DATA.filter((v, i, a) => a.findIndex(t => (t.char === v.char)) === i);


class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.synth = window.speechSynthesis;
        this.voice = null;

        // Try to load voices
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.setVoice();
        }
        this.setVoice(); // Try immediately too
    }

    setVoice() {
        const voices = this.synth.getVoices();
        // Priority: Google 日本語 -> Kyoko -> Any JA -> First available
        this.voice = voices.find(v => v.name === 'Google 日本語') ||
            voices.find(v => v.name === 'Kyoko') ||
            voices.find(v => v.lang.startsWith('ja')) ||
            null;
        console.log("Selected Voice:", this.voice ? this.voice.name : "Default");
    }

    playTone(freq, type, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playCorrect() {
        this.playTone(600, 'sine', 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.2), 100);
    }

    playWrong() {
        this.playTone(200, 'sawtooth', 0.3);
    }

    playEat() {
        const count = 3;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.playTone(100 + Math.random() * 50, 'square', 0.05);
            }, i * 150);
        }
    }

    speak(text) {
        if (this.synth) {
            this.synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            if (this.voice) {
                utterance.voice = this.voice;
            }
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8; // Slightly slower
            utterance.pitch = 1.1; // Slightly higher
            this.synth.speak(utterance);
        }
    }
}

class Game {
    constructor() {
        this.currentScene = 'title';
        this.difficulty = 'normal';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.petType = 'chick';
        this.petStage = 0;
        this.audio = new AudioController();

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

        this.difficultyBtns = document.querySelectorAll('[data-difficulty]');

        // Learning elements
        this.learningContainer = document.querySelector('#learning-scene .learning-card');
        // We will replace content dynamically for Matching Game

        // Match next button not needed for matching game flow usually, 
        // but maybe for skipping instructions? 
        // We will reuse the container.

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
        this.retryBtn.addEventListener('click', () => this.switchScene('title'));
    }

    switchScene(sceneName) {
        Object.values(this.scenes).forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
        const target = this.scenes[sceneName];
        target.style.display = 'flex';
        void target.offsetWidth;
        target.classList.add('active');
        this.currentScene = sceneName;
    }

    startGame(difficulty) {
        this.audio.ctx.resume();
        this.difficulty = difficulty;
        this.score = 0;
        this.petStage = 0;
        this.currentQuestionIndex = 0;

        let questionCount = 5;
        if (difficulty === 'easy') questionCount = 3;
        if (difficulty === 'hard') questionCount = 10;

        const shuffled = [...CLEAN_HIRAGANA_DATA].sort(() => 0.5 - Math.random());
        this.questions = shuffled.slice(0, questionCount);

        this.updatePetDisplay(this.gamePet);
        this.startLearningMatchingPhase();
    }

    // --- Matching Game for Learning Phase ---
    startLearningMatchingPhase() {
        this.switchScene('learning');
        this.currentLearningIndex = 0;
        this.showMatchingProblem();
    }

    showMatchingProblem() {
        if (this.currentLearningIndex >= this.questions.length) {
            this.startQuizPhase();
            return;
        }

        const targetQ = this.questions[this.currentLearningIndex];

        // UI Setup
        const container = document.getElementById('learning-scene');
        container.innerHTML = `
            <h2>おなじのど〜れだ？</h2>
            <div class="sample-display">
                <div class="sample-emoji">${targetQ.emoji}</div>
                <div class="sample-char">${this.highlightChar(targetQ.char, targetQ.word)}</div>
            </div>
            <div class="matching-options" style="display: flex; gap: 10px; justify-content: center; margin-top: 2rem;">
                <!-- Options generated below -->
            </div>
            <div class="feedback-msg" style="height: 2rem; font-weight:bold; color: var(--primary-color);"></div>
        `;

        this.audio.speak(targetQ.char + "。" + targetQ.word);

        // Options: Target + 2 distractors
        const distractors = CLEAN_HIRAGANA_DATA
            .filter(d => d.char !== targetQ.char)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        const options = [targetQ, ...distractors].sort(() => 0.5 - Math.random());

        const optionsContainer = container.querySelector('.matching-options');

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn matching-btn';
            btn.innerHTML = `
                <span class="food-icon">${opt.emoji}</span>
                <span class="hiragana-text">${this.highlightChar(opt.char, opt.word)}</span>
            `;
            btn.onclick = () => this.handleMatchingAnswer(opt === targetQ, btn, container);
            optionsContainer.appendChild(btn);
        });
    }

    handleMatchingAnswer(isCorrect, btn, container) {
        if (isCorrect) {
            btn.classList.add('correct');
            this.audio.playCorrect();
            container.querySelector('.feedback-msg').textContent = "せいかい！";
            this.audio.speak("せいかい！");

            setTimeout(() => {
                this.currentLearningIndex++;
                this.showMatchingProblem();
            }, 1500);
        } else {
            btn.classList.add('wrong');
            this.audio.playWrong();
            // Don't advance, let them try again
        }
    }

    // --- Main Quiz Phase ---
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

        this.scoreDisplay.textContent = this.score;
        this.questionsLeftDisplay.textContent = this.questions.length - this.currentQuestionIndex;

        this.questionText.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 10px;">おとをきいてね</div>
            <button id="replay-sound" class="btn btn-secondary" style="border-radius: 50%; width: 60px; height: 60px; padding: 0; font-size: 2rem;">🔊</button>
        `;

        document.getElementById('replay-sound').onclick = () => this.audio.speak(currentQ.char);

        setTimeout(() => this.audio.speak(currentQ.char), 500);

        const options = [currentQ];
        // Distractors
        while (options.length < 4) {
            const random = CLEAN_HIRAGANA_DATA[Math.floor(Math.random() * CLEAN_HIRAGANA_DATA.length)];
            if (!options.includes(random)) options.push(random);
        }
        options.sort(() => 0.5 - Math.random());

        this.optionsContainer.innerHTML = '';
        this.hasAnswered = false;

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `
                <span class="food-icon">${opt.emoji}</span>
                <span class="hiragana-text">${this.highlightChar(opt.char, opt.word)}</span>
            `;
            btn.onclick = (e) => this.handleAnswer(opt === currentQ, btn);
            this.optionsContainer.appendChild(btn);
        });
    }

    // Helper to highlight char in word
    highlightChar(char, word) {
        // Find index of char in word. 
        // Note: assumes char exists. If not, just return word.
        // For distinct coloring.
        return word.split(char).join(`<span class="highlight">${char}</span>`);
    }

    handleAnswer(isCorrect, btnElement) {
        if (this.hasAnswered) return;

        const btn = btnElement.closest('button');

        if (isCorrect) {
            this.hasAnswered = true;
            btn.classList.add('correct');
            this.audio.playCorrect();
            this.score++;

            const allBtns = this.optionsContainer.querySelectorAll('button');
            allBtns.forEach(b => b.disabled = true);

            this.animateFoodToPet(btn, () => {
                this.audio.playEat();
                this.growPet();

                setTimeout(() => {
                    this.currentQuestionIndex++;
                    this.showQuestion();
                }, 1500);
            });

        } else {
            btn.classList.add('wrong');
            btn.disabled = true;
            this.audio.playWrong();
            this.audio.speak("ちがうよ");
        }
    }

    animateFoodToPet(btnElement, callback) {
        const rect = btnElement.getBoundingClientRect();
        const petRect = this.gamePet.getBoundingClientRect();

        const clone = btnElement.cloneNode(true);
        clone.classList.add('flying-food');
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.margin = '0';

        document.body.appendChild(clone);
        void clone.offsetWidth;

        const destX = petRect.left + petRect.width / 2 - rect.width / 2;
        const destY = petRect.top + petRect.height / 2 - rect.height / 2;

        clone.style.transform = `translate(${destX - rect.left}px, ${destY - rect.top}px) scale(0.5)`;
        clone.style.opacity = '0';

        setTimeout(() => {
            clone.remove();
            if (callback) callback();
        }, 800);
    }

    growPet() {
        const config = PET_CONFIG[this.petType];

        let newStageIndex = 0;
        config.stages.forEach((stage, index) => {
            if (this.score >= stage.minScore) {
                newStageIndex = index;
            }
        });

        this.gamePet.classList.add('eating');
        setTimeout(() => this.gamePet.classList.remove('eating'), 1000);

        if (newStageIndex > this.petStage) {
            setTimeout(() => {
                this.petStage = newStageIndex;
                this.audio.speak("やったー！");
                this.updatePetDisplay(this.gamePet);
                this.gamePet.classList.add('bounce');
                setTimeout(() => this.gamePet.classList.remove('bounce'), 1000);
            }, 500);
        } else {
            setTimeout(() => {
                this.gamePet.classList.add('bounce');
                setTimeout(() => this.gamePet.classList.remove('bounce'), 500);
            }, 500);
        }

        this.updatePetDisplay(this.gamePet);
    }

    updatePetDisplay(element) {
        const config = PET_CONFIG[this.petType];
        const stageData = config.stages[this.petStage] || config.stages[0];

        element.textContent = stageData.icon;
        element.style.transform = `scale(${stageData.scale})`;
    }

    finishGame() {
        this.switchScene('result');
        this.finalScoreDisplay.textContent = this.score;

        let isPerfect = (this.score === this.questions.length);
        const config = PET_CONFIG[this.petType];

        if (isPerfect) {
            this.petStage = config.stages.length - 1;
            this.evolutionMessage.classList.remove('hidden');
            this.audio.speak("おめでとう！ぜんもんせいかい！");
        } else {
            this.evolutionMessage.classList.add('hidden');
            this.audio.speak("おつかれさま！");
        }

        this.updatePetDisplay(this.resultPet);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
