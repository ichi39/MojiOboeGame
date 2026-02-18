// ==========================================
// もじおぼえゲーム v2.1
// 「育てて集める」ひらがな冒険
// ==========================================

// ========== Pet Configuration ==========
const PET_CONFIG = {
    chick: {
        id: 'chick',
        name: 'ひよこ',
        stages: [
            { level: 1, text: '🥚', image: 'assets/pets/chick_0.PNG', label: 'たまご' },
            { level: 2, text: '🥚', image: 'assets/pets/chick_1.PNG', label: 'すこしわれたたまご' },
            { level: 3, text: '🥚', image: 'assets/pets/chick_2.PNG', label: 'かなりわれたたまご' },
            { level: 4, text: '🐣', image: 'assets/pets/chick_3.PNG', label: 'ぴよぴよひよこ' },
            { level: 5, text: '🐤', image: 'assets/pets/chick_4.PNG', label: 'おおきなひよこ' },
            { level: 6, text: '🐤', image: 'assets/pets/chick_5.PNG', label: 'りっぱなにわとり' },
            { level: 7, text: '🦚', image: 'assets/pets/chick_6.PNG', label: '✨おうごんにわとり✨' }
        ],
        getStageIndex(level) {
            const clamped = Math.min(level, 7);
            return clamped - 1;
        }
    },
    mermaid: {
        id: 'mermaid',
        name: 'にんぎょ',
        stages: [
            { level: 1, text: '🥚', image: 'assets/pets/mermaid_0.PNG', label: 'ふしぎなたまご' },
            { level: 2, text: '🥚', image: 'assets/pets/mermaid_1.PNG', label: 'ひかるたまご' },
            { level: 3, text: '🥚', image: 'assets/pets/mermaid_2.PNG', label: 'すこしわれたたまご' },
            { level: 4, text: '🐟', image: 'assets/pets/mermaid_3.PNG', label: 'あかちゃんにんぎょ' },
            { level: 5, text: '🐠', image: 'assets/pets/mermaid_4.PNG', label: 'ちいさなにんぎょ' },
            { level: 6, text: '🐡', image: 'assets/pets/mermaid_5.PNG', label: 'こどものにんぎょ' },
            { level: 7, text: '🧚', image: 'assets/pets/mermaid_6.PNG', label: '✨プリンセスにんぎょ✨' }
        ],
        getStageIndex(level) {
            const clamped = Math.min(level, 7);
            return clamped - 1;
        }
    }
};

// ========== Pet Rendering Helper ==========
/**
 * ペットをDOM要素に描画する
 * stageData.image があればPNG画像を表示、なければ絵文字を表示
 * @param {HTMLElement} element - 描画先の要素
 * @param {object} stageData - PET_CONFIGのステージデータ
 */
function renderPetToElement(element, stageData) {
    element.innerHTML = '';
    if (stageData.image) {
        const img = document.createElement('img');
        img.src = stageData.image;
        img.alt = stageData.label;
        img.draggable = false;
        element.appendChild(img);
    } else {
        element.textContent = stageData.text;
    }
}

// ========== EXP Table ==========
const EXP_TABLE = [
    0,    // Lv1
    100,  // Lv2
    250,  // Lv3
    450,  // Lv4
    700,  // Lv5
    1000, // Lv6
    1400  // Lv7 (max)
];

function getExpForNextLevel(level) {
    if (level >= 7) return Infinity;
    return EXP_TABLE[level]; // EXP needed to reach level+1
}

function getLevelFromExp(totalExp) {
    let level = 1;
    for (let i = 0; i < EXP_TABLE.length; i++) {
        if (totalExp >= EXP_TABLE[i]) {
            level = i + 2; // Level 2 at EXP_TABLE[0], etc.
        }
    }
    return Math.min(level, 7);
}

// ========== Hiragana Data ==========
const HIRAGANA_DATA = [
    // speech: { pitch, rate, reading } — 不自然な場合はここを手動調整
    // pitch: 0.0〜2.0 (デフォルト1.0)、rate: 0.1〜10.0 (デフォルト0.8)
    // reading: 読み上げテキストの上書き（省略時はwordをそのまま読む）
    { char: 'あ', romaji: 'a', word: 'あめ', emoji: '🍬', speech: { pitch: 1.0, rate: 0.8, reading: '飴' } },
    { char: 'い', romaji: 'i', word: 'いちご', emoji: '🍓', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'う', romaji: 'u', word: 'うさぎ', emoji: '🐰', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'え', romaji: 'e', word: 'えんぴつ', emoji: '✏️', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'お', romaji: 'o', word: 'おにぎり', emoji: '🍙', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'か', romaji: 'ka', word: 'かさ', emoji: '🌂', speech: { pitch: 1.0, rate: 0.8, reading: '傘' } },
    { char: 'き', romaji: 'ki', word: 'き', emoji: '🌳', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'く', romaji: 'ku', word: 'くつ', emoji: '👟', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'け', romaji: 'ke', word: 'けーき', emoji: '🍰', speech: { pitch: 1.0, rate: 0.8, reading: 'ケーキ' } },
    { char: 'こ', romaji: 'ko', word: 'こま', emoji: '🎲', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'さ', romaji: 'sa', word: 'さかな', emoji: '🐟', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'し', romaji: 'shi', word: 'しんかんせん', emoji: '🚅', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'す', romaji: 'su', word: 'すいか', emoji: '🍉', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'せ', romaji: 'se', word: 'せみ', emoji: '🐛', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'そ', romaji: 'so', word: 'そふとくりーむ', emoji: '🍦', speech: { pitch: 1.0, rate: 0.8, reading: 'ソフトクリーム' } },
    { char: 'た', romaji: 'ta', word: 'たいよう', emoji: '☀️', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'ち', romaji: 'chi', word: 'ちきゅう', emoji: '🌍', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'つ', romaji: 'tsu', word: 'つき', emoji: '🌙', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'て', romaji: 'te', word: 'て', emoji: '✋', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'と', romaji: 'to', word: 'とまと', emoji: '🍅', speech: { pitch: 1.0, rate: 0.8, reading: 'トマト' } },
    { char: 'な', romaji: 'na', word: 'なす', emoji: '🍆', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'に', romaji: 'ni', word: 'にく', emoji: '🍖', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'ぬ', romaji: 'nu', word: 'いぬ', emoji: '🐶', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'ね', romaji: 'ne', word: 'ねこ', emoji: '🐱', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'の', romaji: 'no', word: 'のーと', emoji: '📓', speech: { pitch: 1.0, rate: 0.8, reading: 'ノート' } },
    { char: 'は', romaji: 'ha', word: 'はさみ', emoji: '✂️', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'ひ', romaji: 'hi', word: 'ひこうき', emoji: '✈️', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'ふ', romaji: 'fu', word: 'ふうせん', emoji: '🎈', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'へ', romaji: 'he', word: 'へび', emoji: '🐍', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'ほ', romaji: 'ho', word: 'ほん', emoji: '📚', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'ま', romaji: 'ma', word: 'まいく', emoji: '🎤', speech: { pitch: 1.0, rate: 0.8, reading: 'マイク' } },
    { char: 'み', romaji: 'mi', word: 'みかん', emoji: '🍊', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'む', romaji: 'mu', word: 'むし', emoji: '🐞', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'め', romaji: 'me', word: 'めがね', emoji: '👓', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'も', romaji: 'mo', word: 'もも', emoji: '🍑', speech: { pitch: 1.0, rate: 0.8, reading: '桃' } },
    { char: 'や', romaji: 'ya', word: 'やま', emoji: '⛰️', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'ゆ', romaji: 'yu', word: 'ゆき', emoji: '❄️', speech: { pitch: 1.0, rate: 0.8, reading: '雪' } },
    { char: 'よ', romaji: 'yo', word: 'よっと', emoji: '⛵', speech: { pitch: 1.0, rate: 0.8, reading: 'ヨット' } },
    { char: 'ら', romaji: 'ra', word: 'らっぱ', emoji: '🎺', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'り', romaji: 'ri', word: 'りんご', emoji: '🍎', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'る', romaji: 'ru', word: 'かえる', emoji: '🐸', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'れ', romaji: 're', word: 'れもん', emoji: '🍋', speech: { pitch: 1.0, rate: 0.8, reading: 'レモン' } },
    { char: 'ろ', romaji: 'ro', word: 'ろうそく', emoji: '🕯️', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'わ', romaji: 'wa', word: 'わに', emoji: '🐊', speech: { pitch: 1.0, rate: 0.8 } },
    { char: 'を', romaji: 'wo', word: 'ほんをよむ', emoji: '📖', speech: { pitch: 1.0, rate: 0.8, reading: 'ほんを よむ' } },
    { char: 'ん', romaji: 'n', word: 'おでん', emoji: '🍢', speech: { pitch: 1.0, rate: 0.8 } }
];

// ========== フレーズ読み上げ設定 ==========
// 文章の読み上げイントネーション調整用。不自然な場合はここを手動調整。
// key: 読み上げテキスト（または識別キー）
// pitch, rate, reading を指定可能
const SPEECH_PHRASES = {
    // 進化メッセージ — テンプレート。stageLabel は動的に埋め込まれる
    evolution: { pitch: 1.2, rate: 0.8 },
    // パーフェクト時の褒めフレーズ
    'おめでとう！すごいね！': { pitch: 1.2, rate: 0.9 },
    'やったね！かんぺき！': { pitch: 1.2, rate: 0.9 },
    'すばらしい！': { pitch: 1.1, rate: 0.9 },
    'てんさいだね！': { pitch: 1.2, rate: 0.9 },
    // 通常終了
    'おつかれさま！': { pitch: 1.0, rate: 0.9 },
    // 難易度アンロック — テンプレート
    difficultyUnlock: { pitch: 1.1, rate: 0.9 },
    // ペットアンロック
    mermaidUnlock: { pitch: 1.1, rate: 0.85, reading: 'にんぎょが アンロックされたよ！あたらしい ペットを そだてよう！' }
};

// All 46 hiragana for zukan
const ALL_HIRAGANA = HIRAGANA_DATA.map(h => h.char);

// ==========================================
// SaveManager - localStorage persistence
// ==========================================
class SaveManager {
    constructor() {
        this.SAVE_KEY = 'mojioboe_v2_save';
        this.data = this.load();
    }

    getDefault() {
        return {
            masteredChars: [],
            totalCorrect: 0,
            comboMax: 0,
            unlockedDifficulties: ['easy'],
            unlockedPets: ['chick'],
            activePet: 'chick',
            petData: {
                chick: { exp: 0, level: 1 },
                mermaid: { exp: 0, level: 1 }
            }
        };
    }

    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                const defaults = this.getDefault();
                // Merge with defaults for new keys
                const merged = { ...defaults, ...parsed };
                // Ensure petData has all pet entries
                merged.petData = { ...defaults.petData, ...(parsed.petData || {}) };
                // Migrate from old petEXP/petLevel format
                if (parsed.petEXP !== undefined && !parsed.petData) {
                    merged.petData.chick = { exp: parsed.petEXP, level: parsed.petLevel || 1 };
                    delete merged.petEXP;
                    delete merged.petLevel;
                }
                return merged;
            }
        } catch (e) {
            console.warn('Save data corrupted, resetting.', e);
        }
        return this.getDefault();
    }

    save() {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save data.', e);
        }
    }

    // Helper accessors for active pet
    get petEXP() {
        return this.data.petData[this.data.activePet].exp;
    }
    get petLevel() {
        return this.data.petData[this.data.activePet].level;
    }

    addMasteredChar(char) {
        if (!this.data.masteredChars.includes(char)) {
            this.data.masteredChars.push(char);
            this.save();
            return true; // newly mastered
        }
        return false; // already known
    }

    addEXP(amount) {
        const petId = this.data.activePet;
        const pet = this.data.petData[petId];
        const oldLevel = pet.level;
        pet.exp += amount;
        pet.level = getLevelFromExp(pet.exp);
        this.save();
        return pet.level > oldLevel; // returns true if leveled up
    }

    switchPet(petId) {
        if (this.data.unlockedPets.includes(petId)) {
            this.data.activePet = petId;
            this.save();
        }
    }

    unlockPet(petId) {
        if (!this.data.unlockedPets.includes(petId)) {
            this.data.unlockedPets.push(petId);
            this.save();
            return true;
        }
        return false;
    }


}

// ==========================================
// ParticleSystem
// ==========================================
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particle-container');
    }

    // Stars that fly toward a target
    emitStars(x, y, count = 8) {
        const emojis = ['⭐', '✨', '🌟', '💫'];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'particle particle-star';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            const angle = (Math.PI * 2 / count) * i;
            const dist = 60 + Math.random() * 80;
            el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
            el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
            el.style.setProperty('--dur', (0.6 + Math.random() * 0.6) + 's');
            this.container.appendChild(el);
            setTimeout(() => el.remove(), 1500);
        }
    }

    // Fireworks effect
    emitFireworks(x, y, count = 20) {
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#ff9f43'];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'particle particle-firework';
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.5);
            const dist = 80 + Math.random() * 120;
            el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
            el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
            el.style.setProperty('--dur', (0.8 + Math.random() * 0.5) + 's');
            this.container.appendChild(el);
            setTimeout(() => el.remove(), 2000);
        }
    }

    // Confetti
    emitConfetti(count = 30) {
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#1dd1a1', '#ff9f43'];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'particle particle-confetti';
            el.style.left = (Math.random() * window.innerWidth) + 'px';
            el.style.top = '-20px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
            el.style.setProperty('--dy', (300 + Math.random() * 400) + 'px');
            el.style.setProperty('--dur', (1.5 + Math.random() * 1) + 's');
            el.style.animationDelay = (Math.random() * 0.5) + 's';
            this.container.appendChild(el);
            setTimeout(() => el.remove(), 3000);
        }
    }

    // Evolution flash
    flashScreen() {
        const flash = document.createElement('div');
        flash.className = 'evolution-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1500);
    }
}

// ==========================================
// AudioController (Enhanced BGM + SFX)
// ==========================================
class AudioController {
    constructor() {
        this.ctx = null;
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.bgmInterval = null;
        this.isMuted = false;

        if (this.synth && this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.setVoice();
        }
        this.setVoice();
    }

    ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVoice() {
        if (!this.synth) return;
        const voices = this.synth.getVoices();
        this.voice = voices.find(v => v.name === 'Google 日本語') ||
            voices.find(v => v.name === 'Kyoko') ||
            voices.find(v => v.lang && v.lang.startsWith('ja')) ||
            null;
    }

    playTone(freq, type, duration, volume = 0.1) {
        this.ensureContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playCorrect() {
        // Cheerful ascending jingle
        this.playTone(523, 'sine', 0.1, 0.08);
        setTimeout(() => this.playTone(659, 'sine', 0.1, 0.08), 80);
        setTimeout(() => this.playTone(784, 'sine', 0.2, 0.1), 160);
    }

    playCorrectVariant() {
        // Alternative success jingle
        const variants = [
            () => {
                this.playTone(440, 'sine', 0.1, 0.08);
                setTimeout(() => this.playTone(554, 'sine', 0.1, 0.08), 100);
                setTimeout(() => this.playTone(659, 'sine', 0.15, 0.08), 200);
                setTimeout(() => this.playTone(880, 'sine', 0.25, 0.1), 300);
            },
            () => {
                this.playTone(587, 'triangle', 0.12, 0.08);
                setTimeout(() => this.playTone(740, 'triangle', 0.12, 0.08), 120);
                setTimeout(() => this.playTone(880, 'triangle', 0.2, 0.1), 240);
            }
        ];
        variants[Math.floor(Math.random() * variants.length)]();
    }

    playWrong() {
        this.playTone(200, 'sawtooth', 0.25, 0.05);
        setTimeout(() => this.playTone(180, 'sawtooth', 0.2, 0.04), 150);
    }

    playEat() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.playTone(150 + Math.random() * 100, 'square', 0.06, 0.04);
            }, i * 120);
        }
    }

    playLevelUp() {
        // Triumphant fanfare
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.1), i * 150);
        });
        setTimeout(() => {
            this.playTone(1047, 'sine', 0.5, 0.12);
            this.playTone(784, 'sine', 0.5, 0.08);
        }, 600);
    }

    playEvolution() {
        // Magical sparkle
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playTone(800 + i * 100, 'sine', 0.15, 0.06);
            }, i * 80);
        }
        setTimeout(() => {
            this.playTone(1200, 'sine', 0.8, 0.12);
        }, 700);
    }

    playCombo(comboCount) {
        const baseFreq = 400 + comboCount * 50;
        this.playTone(baseFreq, 'sine', 0.1, 0.06);
        setTimeout(() => this.playTone(baseFreq + 200, 'sine', 0.15, 0.08), 100);
    }

    playPetTap() {
        // Cute chirp
        this.playTone(800, 'sine', 0.05, 0.06);
        setTimeout(() => this.playTone(1000, 'sine', 0.08, 0.05), 60);
        setTimeout(() => this.playTone(1200, 'sine', 0.1, 0.04), 120);
    }

    // Simple BGM using oscillators (gentle melody loop)
    startBGM(type = 'title') {
        this.stopBGM();
        this.ensureContext();

        const melodies = {
            title: {
                notes: [392, 440, 494, 523, 494, 440, 392, 349],
                tempo: 500,
                type: 'sine',
                volume: 0.03
            },
            quiz: {
                notes: [523, 587, 659, 698, 784, 698, 659, 587],
                tempo: 300,
                type: 'triangle',
                volume: 0.025
            }
        };

        const melody = melodies[type] || melodies.title;
        let noteIndex = 0;

        this.bgmInterval = setInterval(() => {
            if (this.isMuted) return;
            const freq = melody.notes[noteIndex % melody.notes.length];
            this.playTone(freq, melody.type, melody.tempo / 1000 * 0.8, melody.volume);
            noteIndex++;
        }, melody.tempo);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    /**
     * テキストを読み上げる
     * @param {string} text - 読み上げるテキスト
     * @param {object} [options] - イントネーション設定
     * @param {number} [options.pitch=1.0] - ピッチ (0.0〜2.0)
     * @param {number} [options.rate=0.8]  - 速度 (0.1〜10.0)
     * @param {string} [options.reading]   - 読み上げテキスト上書き
     */
    speak(text, options = {}) {
        if (this.synth) {
            this.synth.cancel();
            const speakText = options.reading || text;
            const utterance = new SpeechSynthesisUtterance(speakText);
            if (this.voice) {
                utterance.voice = this.voice;
            }
            utterance.lang = 'ja-JP';
            utterance.rate = options.rate !== undefined ? options.rate : 0.8;
            utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;
            this.synth.speak(utterance);
        }
    }
}

// ==========================================
// Background Theme Manager
// ==========================================
class BackgroundManager {
    constructor(petLevel) {
        this.petLevel = petLevel;
        this.starsCreated = false;
    }

    update(petLevel) {
        this.petLevel = petLevel;
        this.applyTimeTheme();
        this.updateNiwaBgItems();
    }

    applyTimeTheme() {
        const hour = new Date().getHours();
        const body = document.body;
        body.classList.remove('theme-morning', 'theme-afternoon', 'theme-evening', 'theme-night');

        if (hour >= 5 && hour < 10) {
            body.classList.add('theme-morning');
        } else if (hour >= 10 && hour < 16) {
            body.classList.add('theme-afternoon');
        } else if (hour >= 16 && hour < 19) {
            body.classList.add('theme-evening');
        } else {
            body.classList.add('theme-night');
            this.createStars();
        }
    }

    createStars() {
        if (this.starsCreated) return;
        this.starsCreated = true;
        const container = document.getElementById('bg-particles');
        container.innerHTML = '';
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'bg-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.width = (2 + Math.random() * 3) + 'px';
            star.style.height = star.style.width;
            container.appendChild(star);
        }
    }

    updateNiwaBgItems() {
        const container = document.getElementById('niwa-bg-items');
        if (!container) return;
        container.innerHTML = '';

        // Level-based garden items
        const items = [];
        if (this.petLevel >= 2) items.push({ emoji: '🌸', positions: [[10, 80], [85, 75]] });
        if (this.petLevel >= 3) items.push({ emoji: '🌷', positions: [[20, 85], [75, 82]] });
        if (this.petLevel >= 4) items.push({ emoji: '🌻', positions: [[5, 70], [90, 68]] });
        if (this.petLevel >= 5) items.push({ emoji: '🌳', positions: [[15, 60], [80, 55]] });
        if (this.petLevel >= 6) items.push({ emoji: '🦋', positions: [[30, 30], [65, 25]] });
        if (this.petLevel >= 7) items.push({ emoji: '', positions: [[50, 5]] });

        items.forEach(item => {
            item.positions.forEach(([left, top]) => {
                const el = document.createElement('div');
                el.className = 'niwa-bg-item';
                el.textContent = item.emoji;
                el.style.left = left + '%';
                el.style.top = top + '%';
                el.style.animationDelay = Math.random() * 2 + 's';
                container.appendChild(el);
            });
        });
    }
}

// ==========================================
// Main Game Class
// ==========================================
class Game {
    constructor() {
        this.save = new SaveManager();
        this.audio = new AudioController();
        this.particles = new ParticleSystem();
        this.bgManager = new BackgroundManager(this.save.petLevel);

        this.currentScene = 'niwa';
        this.difficulty = 'normal';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.combo = 0;
        this.sessionNewChars = [];
        this.sessionEXP = 0;
        this.petType = this.save.data.activePet;

        this.initElements();
        this.attachEventListeners();
        this.initNiwa();
        this.bgManager.update(this.save.petLevel);

        // Start title BGM
        // (wait for user interaction to start audio context)
    }

    initElements() {
        this.scenes = {
            niwa: document.getElementById('niwa-scene'),
            zukan: document.getElementById('zukan-scene'),
            learning: document.getElementById('learning-scene'),
            game: document.getElementById('game-scene'),
            result: document.getElementById('result-scene')
        };

        // Header
        this.headerStats = document.getElementById('header-stats');
        this.petLevelDisplay = document.getElementById('pet-level');
        this.expBarFill = document.getElementById('exp-bar-fill');
        this.expCurrent = document.getElementById('exp-current');
        this.expNext = document.getElementById('exp-next');

        // Niwa
        this.niwaPet = document.getElementById('niwa-pet');
        this.niwaPetName = document.getElementById('niwa-pet-name');

        // Zukan
        this.zukanGrid = document.getElementById('zukan-grid');
        this.zukanCount = document.getElementById('zukan-count');
        this.zukanBadges = document.getElementById('zukan-badges');

        // Game
        this.scoreDisplay = document.getElementById('score');
        this.questionsLeftDisplay = document.getElementById('questions-left');
        this.gamePet = document.getElementById('game-pet');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');

        // Combo
        this.comboDisplay = document.getElementById('combo-display');
        this.comboCount = document.getElementById('combo-count');

        // Result
        this.resultPet = document.getElementById('result-pet');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.retryBtn = document.getElementById('retry-btn');
        this.evolutionMessage = document.getElementById('evolution-message');
        this.newCharsDisplay = document.getElementById('new-chars-display');
        this.newCharsList = document.getElementById('new-chars-list');
        this.expEarnedDisplay = document.getElementById('exp-earned-display');
        this.expEarnedAmount = document.getElementById('exp-earned-amount');
        this.levelupMessage = document.getElementById('levelup-message');
        this.scoreCounter = document.getElementById('score-counter');

        this.difficultyBtns = document.querySelectorAll('[data-difficulty]');
    }

    attachEventListeners() {
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const diff = e.target.closest('[data-difficulty]')?.dataset.difficulty;
                if (!diff) return;
                if (!this.save.data.unlockedDifficulties.includes(diff)) return;
                this.audio.ensureContext();
                this.startGame(diff);
            });
        });

        this.retryBtn.addEventListener('click', () => {
            this.switchScene('niwa');
            this.initNiwa();
            this.audio.stopBGM();
        });

        document.getElementById('open-zukan-btn').addEventListener('click', () => {
            this.audio.ensureContext();
            this.showZukan();
        });

        document.getElementById('close-zukan-btn').addEventListener('click', () => {
            this.switchScene('niwa');
        });

        // Pet tap in niwa
        this.niwaPet.addEventListener('click', (e) => {
            this.audio.ensureContext();
            this.audio.playPetTap();
            this.spawnHeart(e);
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('ほんとうに さいしょから あそぶ？\nぜんぶの データが きえちゃうよ！')) {
                localStorage.clear();
                location.reload();
            }
        });

        // Pet switching
        document.querySelectorAll('.pet-switch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const petId = btn.dataset.pet;
                if (!this.save.data.unlockedPets.includes(petId)) return;
                this.save.switchPet(petId);
                this.petType = petId;
                this.initNiwa();
            });
        });
    }

    // ========== Scene Management ==========
    switchScene(sceneName) {
        Object.values(this.scenes).forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
        const target = this.scenes[sceneName];
        if (!target) return;
        target.style.display = 'flex';
        void target.offsetWidth;
        target.classList.add('active');
        this.currentScene = sceneName;

        // Show/hide header stats
        if (sceneName === 'game' || sceneName === 'learning') {
            this.headerStats.classList.remove('hidden');
            this.updateHeaderStats();
        } else if (sceneName === 'niwa') {
            this.headerStats.classList.add('hidden');
        }
    }

    // ========== にわ (Home) ==========
    initNiwa() {
        this.petType = this.save.data.activePet;
        this.updateNiwaPet();
        this.bgManager.update(this.save.petLevel);
        this.updateHeaderStats();
        this.updateDifficultyButtons();
        this.updatePetSwitchBar();
    }

    updatePetSwitchBar() {
        const unlocked = this.save.data.unlockedPets;
        const active = this.save.data.activePet;
        const petEmojis = { chick: '🐣', mermaid: '🧜‍♀️' };
        const petNames = { chick: 'ひよこ', mermaid: 'にんぎょ' };

        document.querySelectorAll('.pet-switch-btn').forEach(btn => {
            const petId = btn.dataset.pet;
            const isUnlocked = unlocked.includes(petId);
            const isActive = (petId === active);

            btn.classList.toggle('active', isActive);
            btn.classList.toggle('locked', !isUnlocked);

            if (isUnlocked) {
                const pet = this.save.data.petData[petId];
                const config = PET_CONFIG[petId];
                const stageIdx = config.getStageIndex(pet.level);
                const stageData = config.stages[stageIdx];
                const display = stageData.image ? '' : stageData.text + ' ';
                btn.textContent = `${display}${petNames[petId]}`;
            } else {
                btn.textContent = `🔒 ${petNames[petId]}`;
            }
        });
    }

    updateDifficultyButtons() {
        const unlocked = this.save.data.unlockedDifficulties;
        const labels = {
            easy: '🌱 やさしい (3もん)',
            normal: '🌿 ふつう (5もん)',
            hard: '🌳 むずかしい (10もん)'
        };
        const lockedLabels = {
            easy: '🌱 やさしい (3もん)',
            normal: '🔒 ふつう (5もん)',
            hard: '🔒 むずかしい (10もん)'
        };
        this.difficultyBtns.forEach(btn => {
            const diff = btn.dataset.difficulty;
            if (unlocked.includes(diff)) {
                btn.classList.remove('btn-locked');
                btn.disabled = false;
                btn.textContent = labels[diff];
            } else {
                btn.classList.add('btn-locked');
                btn.disabled = true;
                btn.textContent = lockedLabels[diff];
            }
        });
    }

    updateNiwaPet() {
        const config = PET_CONFIG[this.petType];
        const stageIdx = config.getStageIndex(this.save.petLevel);
        const stageData = config.stages[stageIdx];
        renderPetToElement(this.niwaPet, stageData);
        this.niwaPetName.textContent = `${stageData.text} ${stageData.label} Lv.${this.save.petLevel}`;
    }

    spawnHeart(e) {
        const heartsContainer = document.getElementById('niwa-hearts');
        const heart = document.createElement('div');
        heart.className = 'niwa-heart';
        heart.textContent = '❤️';
        const rect = this.niwaPet.getBoundingClientRect();
        const parentRect = heartsContainer.getBoundingClientRect();
        heart.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
        heart.style.top = (rect.top - parentRect.top) + 'px';
        heart.style.setProperty('--dx', (Math.random() - 0.5) * 60 + 'px');
        heartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
    }

    // ========== Header Stats ==========
    updateHeaderStats() {
        const level = this.save.petLevel;
        const exp = this.save.petEXP;
        const nextExp = getExpForNextLevel(level);
        const prevExp = level >= 2 ? EXP_TABLE[level - 2] : 0;
        const progress = level >= 7 ? 100 : ((exp - prevExp) / (nextExp - prevExp) * 100);

        this.petLevelDisplay.textContent = level;
        this.expBarFill.style.width = Math.min(progress, 100) + '%';
        this.expCurrent.textContent = exp;
        this.expNext.textContent = level >= 7 ? 'MAX' : nextExp;
    }

    // ========== もじずかん ==========
    showZukan() {
        this.switchScene('zukan');
        this.renderZukan();
    }

    renderZukan() {
        const mastered = this.save.data.masteredChars;
        this.zukanGrid.innerHTML = '';
        this.zukanCount.textContent = mastered.length;

        ALL_HIRAGANA.forEach(char => {
            const cell = document.createElement('div');
            cell.className = 'zukan-cell';
            const data = HIRAGANA_DATA.find(h => h.char === char);

            if (mastered.includes(char)) {
                cell.classList.add('known');
                cell.innerHTML = `<span>${char}</span><span class="zukan-emoji">${data ? data.emoji : ''}</span>`;
                cell.addEventListener('click', () => this.showZukanDetail(char));
            } else {
                cell.classList.add('unknown');
                cell.textContent = '？';
            }
            this.zukanGrid.appendChild(cell);
        });

        // Badges
        this.zukanBadges.innerHTML = '';
        if (mastered.length >= 10) this.zukanBadges.innerHTML += '🥉';
        if (mastered.length >= 25) this.zukanBadges.innerHTML += '🥈';
        if (mastered.length >= 46) this.zukanBadges.innerHTML += '🏅';
    }

    showZukanDetail(char) {
        const data = HIRAGANA_DATA.find(h => h.char === char);
        if (!data) return;

        const modal = document.getElementById('zukan-detail-modal');
        document.getElementById('zukan-detail-char').textContent = char;
        document.getElementById('zukan-detail-emoji').textContent = data.emoji;
        document.getElementById('zukan-detail-word').textContent = data.word;

        modal.classList.remove('hidden');
        this.audio.speak(data.word, data.speech);

        // Speak button
        document.getElementById('zukan-detail-speak').onclick = () => {
            this.audio.speak(data.word, data.speech);
        };

        // Close button
        document.getElementById('zukan-detail-close').onclick = () => {
            modal.classList.add('hidden');
        };

        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        };
    }

    // ========== Start Game ==========
    startGame(difficulty) {
        this.difficulty = difficulty;
        this.score = 0;
        this.combo = 0;
        this.sessionNewChars = [];
        this.sessionEXP = 0;
        this.currentQuestionIndex = 0;

        let questionCount = 5;
        if (difficulty === 'easy') questionCount = 3;
        if (difficulty === 'hard') questionCount = 10;

        // Prioritize unmastered chars
        const unmasteredChars = HIRAGANA_DATA.filter(h => !this.save.data.masteredChars.includes(h.char));
        const masteredChars = HIRAGANA_DATA.filter(h => this.save.data.masteredChars.includes(h.char));

        let pool = [];

        // Unmastered first
        const shuffledUnmastered = [...unmasteredChars].sort(() => 0.5 - Math.random());
        pool = [...pool, ...shuffledUnmastered];

        // Fill remaining with mastered (review)
        const shuffledMastered = [...masteredChars].sort(() => 0.5 - Math.random());
        pool = [...pool, ...shuffledMastered];

        // Deduplicate and slice
        const seen = new Set();
        this.questions = [];
        for (const q of pool) {
            if (!seen.has(q.char)) {
                seen.add(q.char);
                this.questions.push(q);
                if (this.questions.length >= questionCount) break;
            }
        }

        this.updateGamePet();
        this.startLearningMatchingPhase();
        this.audio.startBGM('title');
    }

    // ========== Learning Phase ==========
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
        const container = document.getElementById('learning-scene');

        container.innerHTML = `
            <h2>おなじのど〜れだ？</h2>
            <div class="sample-display">
                <div class="sample-emoji">${targetQ.emoji}</div>
                <div class="sample-char">${this.highlightChar(targetQ.char, targetQ.word)}</div>
            </div>
            <div class="matching-options options-grid" style="margin-top: 1.5rem;"></div>
            <div class="feedback-msg" style="height: 2rem; font-weight:bold; color: var(--primary-color);"></div>
        `;

        this.audio.speak(targetQ.word, targetQ.speech);

        const distractors = HIRAGANA_DATA
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
            container.querySelector('.feedback-msg').textContent = 'せいかい！🎉';

            // Star particles on the button
            const rect = btn.getBoundingClientRect();
            this.particles.emitStars(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);

            setTimeout(() => {
                this.currentLearningIndex++;
                this.showMatchingProblem();
            }, 1200);
        } else {
            btn.classList.add('wrong');
            this.audio.playWrong();
        }
    }

    // ========== Quiz Phase ==========
    startQuizPhase() {
        this.switchScene('game');
        this.updateGamePet();
        this.currentQuestionIndex = 0;
        this.showQuestion();
        this.audio.startBGM('quiz');
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
            <div style="font-size: 1.3rem; margin-bottom: 8px;">これ な〜んだ？</div>
            <div class="question-emoji" style="font-size: 5rem; line-height: 1.2;">${currentQ.emoji}</div>
            <button id="replay-sound" class="btn btn-secondary" style="border-radius: 50%; width: 50px; height: 50px; padding: 0; font-size: 1.8rem; margin-top: 8px;">🔊</button>
        `;

        document.getElementById('replay-sound').onclick = () => this.audio.speak(currentQ.word, currentQ.speech);
        setTimeout(() => this.audio.speak(currentQ.word, currentQ.speech), 400);

        // Generate options
        const options = [currentQ];
        const available = HIRAGANA_DATA.filter(h => h.char !== currentQ.char);
        while (options.length < 4 && available.length > 0) {
            const idx = Math.floor(Math.random() * available.length);
            const rand = available.splice(idx, 1)[0];
            if (!options.find(o => o.char === rand.char)) {
                options.push(rand);
            }
        }
        options.sort(() => 0.5 - Math.random());

        this.optionsContainer.innerHTML = '';
        this.hasAnswered = false;

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="hiragana-text">${this.highlightChar(opt.char, opt.word)}</span>`;
            btn.onclick = () => this.handleAnswer(opt === currentQ, btn, opt);
            this.optionsContainer.appendChild(btn);
        });
    }

    highlightChar(char, word) {
        return word.split(char).join(`<span class="highlight">${char}</span>`);
    }

    handleAnswer(isCorrect, btnElement, optData) {
        if (this.hasAnswered) return;

        if (isCorrect) {
            this.hasAnswered = true;
            btnElement.classList.add('correct');
            this.audio.playCorrectVariant();
            this.score++;
            this.combo++;

            // Update combo display
            this.updateCombo();

            // Mastered char
            const currentQ = this.questions[this.currentQuestionIndex];
            const isNew = this.save.addMasteredChar(currentQ.char);
            if (isNew) {
                this.sessionNewChars.push(currentQ.char);
            }

            // EXP calculation
            let expGain = 10;
            if (this.combo >= 3) expGain += 5; // combo bonus
            this.sessionEXP += expGain;

            // Particles on correct
            const rect = btnElement.getBoundingClientRect();
            this.particles.emitStars(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);

            // Combo particles
            if (this.combo === 3) {
                this.particles.emitFireworks(window.innerWidth / 2, window.innerHeight / 2, 15);
            } else if (this.combo >= 5) {
                this.particles.emitConfetti(20);
            }

            const allBtns = this.optionsContainer.querySelectorAll('button');
            allBtns.forEach(b => b.disabled = true);

            this.scoreDisplay.textContent = this.score;

            this.animateFoodToPet(btnElement, () => {
                this.audio.playEat();
                this.updateGamePetWithBounce();

                setTimeout(() => {
                    this.currentQuestionIndex++;
                    this.showQuestion();
                }, 1200);
            });

        } else {
            btnElement.classList.add('wrong');
            btnElement.disabled = true;
            this.audio.playWrong();
            this.combo = 0;
            this.updateCombo();
        }
    }

    updateCombo() {
        if (this.combo >= 2) {
            this.comboDisplay.classList.remove('hidden');
            this.comboCount.textContent = this.combo;

            // Combo colors
            this.comboDisplay.classList.remove('combo-rainbow');
            if (this.combo >= 4) {
                this.comboDisplay.classList.add('combo-rainbow');
            }

            if (this.combo >= 2) {
                this.audio.playCombo(this.combo);
            }

            // Rainbow glow on pet container
            const petContainer = document.querySelector('.pet-container');
            if (this.combo >= 4) {
                petContainer.classList.add('rainbow-glow');
            } else {
                petContainer.classList.remove('rainbow-glow');
            }
        } else {
            this.comboDisplay.classList.add('hidden');
            document.querySelector('.pet-container')?.classList.remove('rainbow-glow');
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

        clone.style.transform = `translate(${destX - rect.left}px, ${destY - rect.top}px) scale(0.3)`;
        clone.style.opacity = '0';

        setTimeout(() => {
            clone.remove();
            if (callback) callback();
        }, 800);
    }

    updateGamePet() {
        const config = PET_CONFIG[this.petType];
        const stageIdx = config.getStageIndex(this.save.petLevel);
        const stageData = config.stages[stageIdx];
        renderPetToElement(this.gamePet, stageData);

        // Dynamic scaling based on score
        const scale = 1.0 + (this.score * 0.12);
        this.gamePet.style.transform = `scale(${Math.min(scale, 2.5)})`;
    }

    updateGamePetWithBounce() {
        this.updateGamePet();
        this.gamePet.classList.add('eating');
        setTimeout(() => this.gamePet.classList.remove('eating'), 800);
        setTimeout(() => {
            this.gamePet.classList.add('bounce');
            setTimeout(() => this.gamePet.classList.remove('bounce'), 500);
        }, 300);
    }

    // ========== Finish Game ==========
    finishGame() {
        this.audio.stopBGM();
        this.switchScene('result');
        this.headerStats.classList.remove('hidden');

        // Score count-up animation
        this.finalScoreDisplay.textContent = this.score;
        this.animateScoreCount();

        const isPerfect = (this.score === this.questions.length);

        // Apply EXP
        const oldLevel = this.save.petLevel;
        const leveledUp = this.save.addEXP(this.sessionEXP);
        const newLevel = this.save.petLevel;

        // Update max combo
        if (this.combo > this.save.data.comboMax) {
            this.save.data.comboMax = this.combo;
        }
        this.save.data.totalCorrect += this.score;
        this.save.save();

        // Update header
        this.updateHeaderStats();

        // Show result pet
        const config = PET_CONFIG[this.petType];
        const stageIdx = config.getStageIndex(newLevel);
        const stageData = config.stages[stageIdx];
        renderPetToElement(this.resultPet, stageData);
        this.resultPet.style.transform = 'scale(1.5)';

        // EXP earned
        setTimeout(() => {
            this.expEarnedDisplay.classList.remove('hidden');
            this.expEarnedDisplay.classList.add('exp-earned');
            this.expEarnedAmount.textContent = this.sessionEXP;
        }, 800);

        // New chars
        if (this.sessionNewChars.length > 0) {
            setTimeout(() => {
                this.newCharsDisplay.classList.remove('hidden');
                this.newCharsList.innerHTML = '';
                this.sessionNewChars.forEach((char, i) => {
                    const badge = document.createElement('span');
                    badge.className = 'new-char-badge';
                    badge.textContent = char;
                    badge.style.animationDelay = (i * 0.15) + 's';
                    this.newCharsList.appendChild(badge);
                });
            }, 1200);
        } else {
            this.newCharsDisplay.classList.add('hidden');
        }

        // Level up
        if (leveledUp) {
            setTimeout(() => {
                this.levelupMessage.classList.remove('hidden');
                this.audio.playLevelUp();
                this.particles.emitFireworks(window.innerWidth / 2, window.innerHeight / 3, 25);

                // Check evolution
                const oldStageIdx = config.getStageIndex(oldLevel);
                const newStageIdx = config.getStageIndex(newLevel);
                if (newStageIdx !== oldStageIdx) {
                    // Evolution!
                    setTimeout(() => {
                        this.particles.flashScreen();
                        this.audio.playEvolution();
                        this.evolutionMessage.classList.remove('hidden');
                        this.evolutionMessage.textContent = `${stageData.label}に しんかしたよ！✨`;
                        this.audio.speak(`やったー！${stageData.label}に しんかした！`, SPEECH_PHRASES.evolution);
                    }, 1000);
                }
            }, 1600);
        } else {
            this.levelupMessage.classList.add('hidden');
            this.evolutionMessage.classList.add('hidden');
        }

        // Perfect = confetti + fireworks
        if (isPerfect) {
            setTimeout(() => {
                this.particles.emitConfetti(40);
                this.particles.emitFireworks(window.innerWidth / 2, window.innerHeight / 3, 30);
                const praises = ['おめでとう！すごいね！', 'やったね！かんぺき！', 'すばらしい！', 'てんさいだね！'];
                const praise = praises[Math.floor(Math.random() * praises.length)];
                this.audio.speak(praise, SPEECH_PHRASES[praise] || {});
            }, 500);
        } else {
            setTimeout(() => {
                this.audio.speak('おつかれさま！', SPEECH_PHRASES['おつかれさま！']);
            }, 500);
        }

        // Hide combo
        this.comboDisplay.classList.add('hidden');

        // Unlock next difficulty
        const diffOrder = ['easy', 'normal', 'hard'];
        const currentIdx = diffOrder.indexOf(this.difficulty);
        if (currentIdx >= 0 && currentIdx < diffOrder.length - 1) {
            const nextDiff = diffOrder[currentIdx + 1];
            if (!this.save.data.unlockedDifficulties.includes(nextDiff)) {
                this.save.data.unlockedDifficulties.push(nextDiff);
                this.save.save();
                const diffNames = { normal: 'ふつう', hard: 'むずかしい' };
                setTimeout(() => {
                    this.audio.speak(`${diffNames[nextDiff]}がアンロックされたよ！`, SPEECH_PHRASES.difficultyUnlock);
                }, 2500);
            }
        }

        // Unlock mermaid pet when chick reaches Lv.10
        if (this.petType === 'chick' && newLevel >= 10) {
            if (this.save.unlockPet('mermaid')) {
                setTimeout(() => {
                    this.particles.emitConfetti(30);
                    this.audio.speak('にんぎょが アンロックされたよ！あたらしい ペットを そだてよう！', SPEECH_PHRASES.mermaidUnlock);
                }, 3500);
            }
        }
    }

    animateScoreCount() {
        const target = this.score;
        let current = 0;
        this.scoreCounter.textContent = '0';

        if (target === 0) {
            this.scoreCounter.textContent = '0';
            return;
        }

        const interval = setInterval(() => {
            current++;
            this.scoreCounter.textContent = current;
            if (current >= target) {
                clearInterval(interval);
                // Pop effect
                this.scoreCounter.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    this.scoreCounter.style.transform = 'scale(1)';
                }, 200);
            }
        }, 200);
    }
}

// ========== Initialize ==========
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
