// ==========================================
// もじさがしゲーム v3
// 「あつめて そだてる」ことば冒険
// ==========================================

// ========== UI Constants ==========
const SPEECH_BUBBLE_DURATION_MS = 2500;
const MAX_NIWA_COLLECTION_DISPLAY = 12;

// ========== Utility ==========
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========== Shared Pet Helper ==========
function _petGetStageIndex(level) {
  return Math.min(level, 7) - 1;
}

// ========== Pet Configuration ==========
const PET_CONFIG = {
  chick: {
    id: "chick",
    name: "ひよこ",
    // ひよこは少ないことば数で進化できる（やさしい）
    // Lv1→2:2, Lv2→3:2, Lv3→4:3, Lv4→5:3, Lv5→6:2, Lv6→7:2 （合計14個）
    wordLevelTable: [0, 2, 4, 7, 10, 12, 14],
    unlocks: { petId: "mermaid", atLevel: 7 },
    stages: [
      {
        level: 1,
        text: "🥚",
        image: "assets/pets/chick_0.PNG",
        label: "たまご",
      },
      {
        level: 2,
        text: "🥚",
        image: "assets/pets/chick_1.PNG",
        label: "すこしわれたたまご",
      },
      {
        level: 3,
        text: "🥚",
        image: "assets/pets/chick_2.PNG",
        label: "かなりわれたたまご",
      },
      {
        level: 4,
        text: "🐣",
        image: "assets/pets/chick_3.PNG",
        label: "ぴよぴよひよこ",
      },
      {
        level: 5,
        text: "🐤",
        image: "assets/pets/chick_4.PNG",
        label: "おおきなひよこ",
      },
      {
        level: 6,
        text: "🐤",
        image: "assets/pets/chick_5.PNG",
        label: "りっぱなにわとり",
      },
      {
        level: 7,
        text: "🦚",
        image: "assets/pets/chick_6.PNG",
        label: "✨おうごんにわとり✨",
      },
    ],
    getStageIndex: _petGetStageIndex,
  },
  mermaid: {
    id: "mermaid",
    name: "にんぎょ",
    // にんぎょはひよこより多いことば数が必要（やりごたえあり）
    // Lv1→2:3, Lv2→3:2, Lv3→4:1, Lv4→5:1, Lv5→6:1, Lv6→7:1 （合計9個）
    wordLevelTable: [0, 3, 5, 6, 7, 8, 9],
    stages: [
      {
        level: 1,
        text: "🥚",
        image: "assets/pets/mermaid_0.PNG",
        label: "ふしぎなたまご",
      },
      {
        level: 2,
        text: "🥚",
        image: "assets/pets/mermaid_1.PNG",
        label: "ひかるたまご",
      },
      {
        level: 3,
        text: "🥚",
        image: "assets/pets/mermaid_2.PNG",
        label: "すこしわれたたまご",
      },
      {
        level: 4,
        text: "🐟",
        image: "assets/pets/mermaid_3.PNG",
        label: "あかちゃんにんぎょ",
      },
      {
        level: 5,
        text: "🐠",
        image: "assets/pets/mermaid_4.PNG",
        label: "ちいさなにんぎょ",
      },
      {
        level: 6,
        text: "🐡",
        image: "assets/pets/mermaid_5.PNG",
        label: "こどものにんぎょ",
      },
      {
        level: 7,
        text: "🧚",
        image: "assets/pets/mermaid_6.PNG",
        label: "✨プリンセスにんぎょ✨",
      },
    ],
    getStageIndex: _petGetStageIndex,
  },
};

// ========== Pet Rendering Helper ==========
/**
 * ペットをDOM要素に描画する
 * stageData.image があればPNG画像を表示、なければ絵文字を表示
 * @param {HTMLElement} element - 描画先の要素
 * @param {object} stageData - PET_CONFIGのステージデータ
 */
function renderPetToElement(element, stageData) {
  element.innerHTML = "";
  if (stageData.image) {
    const img = document.createElement("img");
    img.src = stageData.image;
    img.alt = stageData.label;
    img.draggable = false;
    element.appendChild(img);
  } else {
    element.textContent = stageData.text;
  }
}

// ========== ことば Lv テーブル（ペットごとに異なる進化テーブル）==========
// 各ペットの wordLevelTable は PET_CONFIG に定義
// インデックス i = 累計ことば数の閾値（count >= table[i] で level = i+1）

function _getWordLevelTable(petId) {
  return petId && PET_CONFIG[petId]
    ? PET_CONFIG[petId].wordLevelTable
    : [0, 3, 6, 10, 15, 21, 28];
}

function getLevelFromWordCount(count, petId) {
  const table = _getWordLevelTable(petId);
  let level = 1;
  for (let i = 0; i < table.length; i++) {
    if (count >= table[i]) level = i + 1;
  }
  return Math.min(level, 7);
}

/** 現在レベルの累計閾値（現在Lvになるのに必要だった累計数）*/
function getLevelThreshold(level, petId) {
  const table = _getWordLevelTable(petId);
  const idx = Math.max(0, Math.min(level - 1, table.length - 1));
  return table[idx];
}

/** 次のLvに必要な累計ことば数 */
function getWordsForNextLevel(level, petId) {
  if (level >= 7) return Infinity;
  return _getWordLevelTable(petId)[level];
}

/** 現在Lvから次Lvへの1段分のことば数 */
function getWordsPerLevelStep(level, petId) {
  if (level >= 7) return 0;
  return getWordsForNextLevel(level, petId) - getLevelThreshold(level, petId);
}

// ========== Hiragana Data ==========
const HIRAGANA_DATA = [
  // speech.reading: 読み上げテキストの上書き（省略時はwordをそのまま読む）
  // speech.pitch / speech.rate: 不自然な場合に手動調整（省略時: pitch 1.0 / rate 0.8）
  {
    char: "あ",
    romaji: "a",
    word: "あめ",
    emoji: "🍬",
    speech: { reading: "飴" },
  },
  { char: "い", romaji: "i", word: "いちご", emoji: "🍓" },
  { char: "う", romaji: "u", word: "うさぎ", emoji: "🐰" },
  { char: "え", romaji: "e", word: "えんぴつ", emoji: "✏️" },
  { char: "お", romaji: "o", word: "おにぎり", emoji: "🍙" },
  {
    char: "か",
    romaji: "ka",
    word: "かさ",
    emoji: "🌂",
    speech: { reading: "傘" },
  },
  { char: "き", romaji: "ki", word: "き", emoji: "🌳" },
  { char: "く", romaji: "ku", word: "くつ", emoji: "👟" },
  {
    char: "け",
    romaji: "ke",
    word: "けーき",
    emoji: "🍰",
    speech: { reading: "ケーキ" },
  },
  { char: "こ", romaji: "ko", word: "こま", emoji: "🎲" },
  { char: "さ", romaji: "sa", word: "さかな", emoji: "🐟" },
  { char: "し", romaji: "shi", word: "しんかんせん", emoji: "🚅" },
  { char: "す", romaji: "su", word: "すいか", emoji: "🍉" },
  { char: "せ", romaji: "se", word: "せみ", emoji: "🐛" },
  {
    char: "そ",
    romaji: "so",
    word: "そふとくりーむ",
    emoji: "🍦",
    speech: { reading: "ソフトクリーム" },
  },
  { char: "た", romaji: "ta", word: "たいよう", emoji: "☀️" },
  { char: "ち", romaji: "chi", word: "ちきゅう", emoji: "🌍" },
  { char: "つ", romaji: "tsu", word: "つき", emoji: "🌙" },
  { char: "て", romaji: "te", word: "て", emoji: "✋" },
  {
    char: "と",
    romaji: "to",
    word: "とまと",
    emoji: "🍅",
    speech: { reading: "トマト" },
  },
  { char: "な", romaji: "na", word: "なす", emoji: "🍆" },
  { char: "に", romaji: "ni", word: "にく", emoji: "🍖" },
  { char: "ぬ", romaji: "nu", word: "いぬ", emoji: "🐶" },
  { char: "ね", romaji: "ne", word: "ねこ", emoji: "🐱" },
  {
    char: "の",
    romaji: "no",
    word: "のーと",
    emoji: "📓",
    speech: { reading: "ノート" },
  },
  { char: "は", romaji: "ha", word: "はさみ", emoji: "✂️" },
  { char: "ひ", romaji: "hi", word: "ひこうき", emoji: "✈️" },
  { char: "ふ", romaji: "fu", word: "ふうせん", emoji: "🎈" },
  { char: "へ", romaji: "he", word: "へび", emoji: "🐍" },
  { char: "ほ", romaji: "ho", word: "ほん", emoji: "📚" },
  {
    char: "ま",
    romaji: "ma",
    word: "まいく",
    emoji: "🎤",
    speech: { reading: "マイク" },
  },
  { char: "み", romaji: "mi", word: "みかん", emoji: "🍊" },
  { char: "む", romaji: "mu", word: "むし", emoji: "🐞" },
  { char: "め", romaji: "me", word: "めがね", emoji: "👓" },
  {
    char: "も",
    romaji: "mo",
    word: "もも",
    emoji: "🍑",
    speech: { reading: "桃" },
  },
  { char: "や", romaji: "ya", word: "やま", emoji: "⛰️" },
  {
    char: "ゆ",
    romaji: "yu",
    word: "ゆき",
    emoji: "❄️",
    speech: { reading: "雪" },
  },
  {
    char: "よ",
    romaji: "yo",
    word: "よっと",
    emoji: "⛵",
    speech: { reading: "ヨット" },
  },
  { char: "ら", romaji: "ra", word: "らっぱ", emoji: "🎺" },
  { char: "り", romaji: "ri", word: "りんご", emoji: "🍎" },
  { char: "る", romaji: "ru", word: "かえる", emoji: "🐸" },
  {
    char: "れ",
    romaji: "re",
    word: "れもん",
    emoji: "🍋",
    speech: { reading: "レモン" },
  },
  { char: "ろ", romaji: "ro", word: "ろうそく", emoji: "🕯️" },
  { char: "わ", romaji: "wa", word: "わに", emoji: "🐊" },
  {
    char: "を",
    romaji: "wo",
    word: "ほんをよむ",
    emoji: "📖",
    speech: { reading: "ほんを よむ" },
  },
  { char: "ん", romaji: "n", word: "おでん", emoji: "🍢" },
];

// ========== フレーズ読み上げ設定 ==========
// 文章の読み上げイントネーション調整用。不自然な場合はここを手動調整。
// key: 読み上げテキスト（または識別キー）
// pitch, rate, reading を指定可能
const SPEECH_PHRASES = {
  // 進化メッセージ — テンプレート。stageLabel は動的に埋め込まれる
  evolution: { pitch: 1.2, rate: 0.8 },
  // パーフェクト時の褒めフレーズ
  "おめでとう！すごいね！": { pitch: 1.2, rate: 0.9 },
  "やったね！かんぺき！": { pitch: 1.2, rate: 0.9 },
  "すばらしい！": { pitch: 1.1, rate: 0.9 },
  "てんさいだね！": { pitch: 1.2, rate: 0.9 },
  // 通常終了
  "おつかれさま！": { pitch: 1.0, rate: 0.9 },
  // 難易度アンロック — テンプレート
  difficultyUnlock: { pitch: 1.1, rate: 0.9 },
  // ペットアンロック
  mermaidUnlock: {
    pitch: 1.1,
    rate: 0.85,
    reading: "にんぎょが アンロックされたよ！あたらしい ペットを そだてよう！",
  },
};

// All 46 hiragana for zukan
const ALL_HIRAGANA = HIRAGANA_DATA.map((h) => h.char);

// O(1) lookup maps
const HIRAGANA_MAP = new Map(HIRAGANA_DATA.map((h) => [h.char, h]));

// ========== WORD_DATA（もじさがしゲームの単語リスト）==========
// pet: 'chick'（ひよこ）or 'mermaid'（にんぎょ）で担当ペットを指定
// chars: ゲームで1文字ずつ集める文字の配列
// petReaction: 全文字クリア時にペットが言うセリフ
const WORD_DATA = [
  // ===== ひよこ: 1〜2文字中心 =====
  {
    word: "め",
    emoji: "👁️",
    chars: ["め"],
    pet: "chick",
    petReaction: "めが　あいたよ〜！",
  },
  {
    word: "き",
    emoji: "🌳",
    chars: ["き"],
    pet: "chick",
    petReaction: "きのぼり　したいな〜！",
  },
  {
    word: "て",
    emoji: "✋",
    chars: ["て"],
    pet: "chick",
    petReaction: "たっちして〜！",
  },
  {
    word: "かに",
    emoji: "🦀",
    chars: ["か", "に"],
    pet: "chick",
    petReaction: "かにさん、いたーい！",
  },
  {
    word: "いぬ",
    emoji: "🐶",
    chars: ["い", "ぬ"],
    pet: "chick",
    petReaction: "わんわん！なかよしだよ！",
  },
  {
    word: "ねこ",
    emoji: "🐱",
    chars: ["ね", "こ"],
    pet: "chick",
    petReaction: "にゃ〜ん！かわいいな〜！",
  },
  {
    word: "うま",
    emoji: "🐴",
    chars: ["う", "ま"],
    pet: "chick",
    petReaction: "のりたいな〜！ひひーん！",
  },
  {
    word: "くま",
    emoji: "🐻",
    chars: ["く", "ま"],
    pet: "chick",
    petReaction: "く〜ん！おおきいね！",
  },
  {
    word: "かわ",
    emoji: "🌊",
    chars: ["か", "わ"],
    pet: "chick",
    petReaction: "ひやひやきもちいい〜！",
  },
  {
    word: "はな",
    emoji: "🌸",
    chars: ["は", "な"],
    pet: "chick",
    petReaction: "いいにおい〜！",
  },
  {
    word: "そら",
    emoji: "🌤️",
    chars: ["そ", "ら"],
    pet: "chick",
    petReaction: "とびたいな〜！わーい！",
  },
  {
    word: "あめ",
    emoji: "🍬",
    chars: ["あ", "め"],
    pet: "chick",
    petReaction: "あまくておいしそう！",
  },
  {
    word: "もも",
    emoji: "🍑",
    chars: ["も", "も"],
    pet: "chick",
    petReaction: "ももいろで　かわいい〜！",
  },
  {
    word: "つき",
    emoji: "🌙",
    chars: ["つ", "き"],
    pet: "chick",
    petReaction: "まるくて　きれいだね！",
  },
  // ===== にんぎょ: 2〜3文字（4文字も一部）=====
  {
    word: "さかな",
    emoji: "🐟",
    chars: ["さ", "か", "な"],
    pet: "mermaid",
    petReaction: "なかまだ〜！いっしょにおよごう！",
  },
  {
    word: "うさぎ",
    emoji: "🐰",
    chars: ["う", "さ", "ぎ"],
    pet: "mermaid",
    petReaction: "ぴょんぴょん！かわいいな！",
  },
  {
    word: "みかん",
    emoji: "🍊",
    chars: ["み", "か", "ん"],
    pet: "mermaid",
    petReaction: "すっぱそう！ぷにぷにだ！",
  },
  {
    word: "りんご",
    emoji: "🍎",
    chars: ["り", "ん", "ご"],
    pet: "mermaid",
    petReaction: "あかくてあまそう！",
  },
  {
    word: "たいよう",
    emoji: "☀️",
    chars: ["た", "い", "よ", "う"],
    pet: "mermaid",
    petReaction: "あったか〜い！きもちいい！",
  },
  {
    word: "ひこうき",
    emoji: "✈️",
    chars: ["ひ", "こ", "う", "き"],
    pet: "mermaid",
    petReaction: "うみのうえを　とんでるよ〜！",
  },
  {
    word: "ふうせん",
    emoji: "🎈",
    chars: ["ふ", "う", "せ", "ん"],
    pet: "mermaid",
    petReaction: "どこまでも　とんでいくね！",
  },
  {
    word: "すいか",
    emoji: "🍉",
    chars: ["す", "い", "か"],
    pet: "mermaid",
    petReaction: "なつの　あじだ〜！",
  },
  {
    word: "ちきゅう",
    emoji: "🌍",
    chars: ["ち", "き", "ゅ", "う"],
    pet: "mermaid",
    petReaction: "おおきな　うみが　あるね！",
  },
];

// O(1) lookup maps
const WORD_MAP = new Map(WORD_DATA.map((d) => [d.word, d]));
const EMOJI_WORD_MAP = new Map(WORD_DATA.map((d) => [d.emoji, d]));

// ==========================================
// SaveManager - localStorage persistence
// ==========================================
class SaveManager {
  constructor() {
    this.SAVE_KEY = "mojioboe_v3_save"; // v3: キー変更で旧データを無視
    this.data = this.load();
  }

  getDefault() {
    return {
      collectedWords: [], // 集めたことばリスト（例: ['かに', 'いぬ']）
      niwaItems: [], // にわに飾られた絵文字リスト
      unlockedPets: ["chick"],
      activePet: "chick",
      petData: {
        chick: { level: 1 },
        mermaid: { level: 1 },
      },
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const defaults = this.getDefault();
        const merged = { ...defaults, ...parsed };
        merged.petData = { ...defaults.petData, ...(parsed.petData || {}) };
        return merged;
      }
    } catch (e) {
      console.warn("Save data corrupted, resetting.", e);
    }
    return this.getDefault();
  }

  save() {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save data.", e);
    }
  }

  // ことば数からレベルを返す（アクティブペット）
  get petLevel() {
    const petId = this.data.activePet;
    const count = this.getWordCount(petId);
    return getLevelFromWordCount(count, petId);
  }

  // ことばコレクションに追加。レベルアップした場合 true を返す
  addCollectedWord(word) {
    const oldLevel = this.petLevel;
    const petId = this.data.activePet;
    if (!this.data.collectedWords.includes(word)) {
      this.data.collectedWords.push(word);
    }
    const wordEntry = WORD_MAP.get(word);
    if (wordEntry && !this.data.niwaItems.includes(wordEntry.emoji)) {
      this.data.niwaItems.push(wordEntry.emoji);
    }
    const newLevel = this.petLevel;
    this.data.petData[petId].level = newLevel;
    this.save();
    return newLevel > oldLevel;
  }

  getWordCount(petId = null) {
    const id = petId || this.data.activePet;
    return this.data.collectedWords.filter((w) => WORD_MAP.get(w)?.pet === id)
      .length;
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
    this.container = document.getElementById("particle-container");
  }

  _spawnParticle(className, lifetime, setup) {
    const el = document.createElement("div");
    el.className = "particle " + className;
    setup(el);
    this.container.appendChild(el);
    setTimeout(() => el.remove(), lifetime);
    return el;
  }

  // Stars that fly toward a target
  emitStars(x, y, count = 8) {
    const emojis = ["⭐", "✨", "🌟", "💫"];
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i;
      const dist = 60 + Math.random() * 80;
      this._spawnParticle("particle-star", 1500, (el) => {
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        el.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        el.style.setProperty("--dur", 0.6 + Math.random() * 0.6 + "s");
      });
    }
  }

  // Fireworks effect
  emitFireworks(x, y, count = 20) {
    const colors = [
      "#ff6b6b",
      "#feca57",
      "#48dbfb",
      "#ff9ff3",
      "#54a0ff",
      "#5f27cd",
      "#ff9f43",
    ];
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i + Math.random() * 0.5;
      const dist = 80 + Math.random() * 120;
      this._spawnParticle("particle-firework", 2000, (el) => {
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        el.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        el.style.setProperty("--dur", 0.8 + Math.random() * 0.5 + "s");
      });
    }
  }

  // Confetti
  emitConfetti(count = 30) {
    const colors = [
      "#ff6b6b",
      "#feca57",
      "#48dbfb",
      "#ff9ff3",
      "#54a0ff",
      "#5f27cd",
      "#1dd1a1",
      "#ff9f43",
    ];
    for (let i = 0; i < count; i++) {
      this._spawnParticle("particle-confetti", 3000, (el) => {
        el.style.left = Math.random() * window.innerWidth + "px";
        el.style.top = "-20px";
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.setProperty("--dx", (Math.random() - 0.5) * 200 + "px");
        el.style.setProperty("--dy", 300 + Math.random() * 400 + "px");
        el.style.setProperty("--dur", 1.5 + Math.random() * 1 + "s");
        el.style.animationDelay = Math.random() * 0.5 + "s";
      });
    }
  }

  // Evolution flash
  flashScreen() {
    const flash = document.createElement("div");
    flash.className = "evolution-flash";
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
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.voice =
      voices.find((v) => v.name === "Google 日本語") ||
      voices.find((v) => v.name === "Kyoko") ||
      voices.find((v) => v.lang && v.lang.startsWith("ja")) ||
      null;
  }

  playTone(freq, type, duration, volume = 0.1) {
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playCorrect() {
    // Cheerful ascending jingle
    this.playTone(523, "sine", 0.1, 0.08);
    setTimeout(() => this.playTone(659, "sine", 0.1, 0.08), 80);
    setTimeout(() => this.playTone(784, "sine", 0.2, 0.1), 160);
  }

  playCorrectVariant() {
    // Alternative success jingle
    const variants = [
      () => {
        this.playTone(440, "sine", 0.1, 0.08);
        setTimeout(() => this.playTone(554, "sine", 0.1, 0.08), 100);
        setTimeout(() => this.playTone(659, "sine", 0.15, 0.08), 200);
        setTimeout(() => this.playTone(880, "sine", 0.25, 0.1), 300);
      },
      () => {
        this.playTone(587, "triangle", 0.12, 0.08);
        setTimeout(() => this.playTone(740, "triangle", 0.12, 0.08), 120);
        setTimeout(() => this.playTone(880, "triangle", 0.2, 0.1), 240);
      },
    ];
    variants[Math.floor(Math.random() * variants.length)]();
  }

  playWrong() {
    this.playTone(200, "sawtooth", 0.25, 0.05);
    setTimeout(() => this.playTone(180, "sawtooth", 0.2, 0.04), 150);
  }

  playEat() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(150 + Math.random() * 100, "square", 0.06, 0.04);
      }, i * 120);
    }
  }

  playLevelUp() {
    // Triumphant fanfare
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, "sine", 0.2, 0.1), i * 150);
    });
    setTimeout(() => {
      this.playTone(1047, "sine", 0.5, 0.12);
      this.playTone(784, "sine", 0.5, 0.08);
    }, 600);
  }

  playEvolution() {
    // Magical sparkle
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.playTone(800 + i * 100, "sine", 0.15, 0.06);
      }, i * 80);
    }
    setTimeout(() => {
      this.playTone(1200, "sine", 0.8, 0.12);
    }, 700);
  }

  playCombo(comboCount) {
    const baseFreq = 400 + comboCount * 50;
    this.playTone(baseFreq, "sine", 0.1, 0.06);
    setTimeout(() => this.playTone(baseFreq + 200, "sine", 0.15, 0.08), 100);
  }

  playPetTap() {
    // Cute chirp
    this.playTone(800, "sine", 0.05, 0.06);
    setTimeout(() => this.playTone(1000, "sine", 0.08, 0.05), 60);
    setTimeout(() => this.playTone(1200, "sine", 0.1, 0.04), 120);
  }

  // Simple BGM using oscillators (gentle melody loop)
  startBGM(type = "title") {
    this.stopBGM();
    this.ensureContext();

    const melodies = {
      title: {
        notes: [392, 440, 494, 523, 494, 440, 392, 349],
        tempo: 500,
        type: "sine",
        volume: 0.03,
      },
      quiz: {
        notes: [523, 587, 659, 698, 784, 698, 659, 587],
        tempo: 300,
        type: "triangle",
        volume: 0.025,
      },
    };

    const melody = melodies[type] || melodies.title;
    let noteIndex = 0;

    this.bgmInterval = setInterval(() => {
      if (this.isMuted) return;
      const freq = melody.notes[noteIndex % melody.notes.length];
      this.playTone(
        freq,
        melody.type,
        (melody.tempo / 1000) * 0.8,
        melody.volume,
      );
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
      utterance.lang = "ja-JP";
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
    body.classList.remove(
      "theme-morning",
      "theme-afternoon",
      "theme-evening",
      "theme-night",
    );

    if (hour >= 5 && hour < 10) {
      body.classList.add("theme-morning");
    } else if (hour >= 10 && hour < 16) {
      body.classList.add("theme-afternoon");
    } else if (hour >= 16 && hour < 19) {
      body.classList.add("theme-evening");
    } else {
      body.classList.add("theme-night");
      this.createStars();
    }
  }

  createStars() {
    if (this.starsCreated) return;
    this.starsCreated = true;
    const container = document.getElementById("bg-particles");
    container.innerHTML = "";
    for (let i = 0; i < 50; i++) {
      const star = document.createElement("div");
      star.className = "bg-star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.setProperty("--dur", 2 + Math.random() * 4 + "s");
      star.style.animationDelay = Math.random() * 3 + "s";
      star.style.width = 2 + Math.random() * 3 + "px";
      star.style.height = star.style.width;
      container.appendChild(star);
    }
  }

  updateNiwaBgItems() {
    const container = document.getElementById("niwa-bg-items");
    if (!container) return;
    container.innerHTML = "";

    // Level-based garden items
    const items = [];
    if (this.petLevel >= 2)
      items.push({
        emoji: "🌸",
        positions: [
          [10, 80],
          [85, 75],
        ],
      });
    if (this.petLevel >= 3)
      items.push({
        emoji: "🌷",
        positions: [
          [20, 85],
          [75, 82],
        ],
      });
    if (this.petLevel >= 4)
      items.push({
        emoji: "🌻",
        positions: [
          [5, 70],
          [90, 68],
        ],
      });
    if (this.petLevel >= 5)
      items.push({
        emoji: "🌳",
        positions: [
          [15, 60],
          [80, 55],
        ],
      });
    if (this.petLevel >= 6)
      items.push({
        emoji: "🦋",
        positions: [
          [30, 30],
          [65, 25],
        ],
      });
    if (this.petLevel >= 7) items.push({ emoji: "", positions: [[50, 5]] });

    items.forEach((item) => {
      item.positions.forEach(([left, top]) => {
        const el = document.createElement("div");
        el.className = "niwa-bg-item";
        el.textContent = item.emoji;
        el.style.left = left + "%";
        el.style.top = top + "%";
        el.style.animationDelay = Math.random() * 2 + "s";
        container.appendChild(el);
      });
    });
  }
}

// ==========================================
// Analytics Manager
// ==========================================
class AnalyticsManager {
  static STORAGE_KEY = "mojioboe_analytics_v1";
  static MAX_SESSIONS = 100;

  constructor() {
    this._data = this._load();
    this._currentSession = null;
    this._wordAttempt = null; // { word, startedAt, charAttempts, isReplay }
  }

  // -------- Persistence --------
  _load() {
    try {
      const raw = localStorage.getItem(AnalyticsManager.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { sessions: [], wordStats: {}, charStats: {} };
  }

  _save() {
    try {
      localStorage.setItem(
        AnalyticsManager.STORAGE_KEY,
        JSON.stringify(this._data),
      );
    } catch (_) {}
  }

  // -------- Session --------
  startSession(pet, level, totalWords) {
    this._currentSession = {
      id: String(Date.now()),
      startedAt: Date.now(),
      endedAt: null,
      pet,
      levelAtStart: level,
      levelAtEnd: level,
      wordsCompleted: 0,
      events: [],
    };
    this.track("session_start", { pet, level, totalWords });
  }

  endSession(wordsCompleted) {
    if (!this._currentSession) return;
    this._currentSession.endedAt = Date.now();
    this._currentSession.wordsCompleted =
      wordsCompleted ?? this._currentSession.wordsCompleted;
    this.track("session_end", {
      durationMs: this._currentSession.endedAt - this._currentSession.startedAt,
      wordsCompleted: this._currentSession.wordsCompleted,
    });
    this._data.sessions.push(this._currentSession);
    if (this._data.sessions.length > AnalyticsManager.MAX_SESSIONS) {
      this._data.sessions.splice(
        0,
        this._data.sessions.length - AnalyticsManager.MAX_SESSIONS,
      );
    }
    this._currentSession = null;
    this._save();
  }

  // -------- Word Attempt --------
  startWordAttempt(wordEntry, isReplay) {
    this._wordAttempt = {
      word: wordEntry.word,
      startedAt: Date.now(),
      charAttempts: 0,
      charsCompleted: 0,
      isReplay,
    };
    const ws = this._ensureWordStats(wordEntry.word);
    ws.totalAttempts++;
    if (isReplay) ws.replays++;
    this.track("word_start", {
      word: wordEntry.word,
      pet: wordEntry.pet,
      isReplay,
    });
    this._save();
  }

  endWordAttempt(completed) {
    if (!this._wordAttempt) return;
    const wa = this._wordAttempt;
    const durationMs = Date.now() - wa.startedAt;
    const ws = this._ensureWordStats(wa.word);

    if (completed) {
      ws.completions++;
      ws.totalTimeMs += durationMs;
      if (this._currentSession) this._currentSession.wordsCompleted++;
      this.track("word_complete", {
        word: wa.word,
        durationMs,
        totalAttempts: wa.charAttempts,
      });
    } else {
      ws.abandonments++;
      this.track("word_abandon", {
        word: wa.word,
        charsCompleted: wa.charsCompleted,
      });
    }
    this._wordAttempt = null;
    this._save();
  }

  // -------- Core Track --------
  track(type, payload = {}) {
    const event = { type, ts: Date.now(), ...payload };
    if (this._currentSession) {
      this._currentSession.events.push(event);
    }
    this._updateAggregates(event);

    // 外部サービス連携フック
    if (typeof window.analyticsExternalSend === "function") {
      try {
        window.analyticsExternalSend(type, payload);
      } catch (_) {}
    }
  }

  _updateAggregates(event) {
    if (event.type === "char_attempt") {
      const { word, charIndex, target, selected, isCorrect } = event;
      // wordStats.charStats
      const ws = this._ensureWordStats(word);
      if (!ws.charStats[charIndex]) {
        ws.charStats[charIndex] = { correct: 0, wrong: 0, confusedWith: {} };
      }
      const cs = ws.charStats[charIndex];
      if (isCorrect) {
        cs.correct++;
      } else {
        cs.wrong++;
        cs.confusedWith[selected] = (cs.confusedWith[selected] || 0) + 1;
      }
      // global charStats
      const gc = this._ensureCharStats(target);
      if (isCorrect) {
        gc.correct++;
      } else {
        gc.wrong++;
        gc.confusedWith[selected] = (gc.confusedWith[selected] || 0) + 1;
      }
      // wordAttempt counter
      if (this._wordAttempt) {
        this._wordAttempt.charAttempts++;
        if (isCorrect) this._wordAttempt.charsCompleted++;
      }
    }

    if (event.type === "level_up" && this._currentSession) {
      this._currentSession.levelAtEnd = event.newLevel;
    }
  }

  _ensureWordStats(word) {
    if (!this._data.wordStats[word]) {
      this._data.wordStats[word] = {
        totalAttempts: 0,
        completions: 0,
        abandonments: 0,
        replays: 0,
        totalTimeMs: 0,
        charStats: {},
      };
    }
    return this._data.wordStats[word];
  }

  _ensureCharStats(char) {
    if (!this._data.charStats[char]) {
      this._data.charStats[char] = { correct: 0, wrong: 0, confusedWith: {} };
    }
    return this._data.charStats[char];
  }

  // -------- Reports --------
  getWordReport() {
    return Object.entries(this._data.wordStats).map(([word, s]) => ({
      word,
      totalAttempts: s.totalAttempts,
      completions: s.completions,
      abandonments: s.abandonments,
      replays: s.replays,
      completionRate:
        s.totalAttempts > 0
          ? Math.round((s.completions / s.totalAttempts) * 100)
          : 0,
      avgTimeMs:
        s.completions > 0 ? Math.round(s.totalTimeMs / s.completions) : 0,
    }));
  }

  getCharReport() {
    return Object.entries(this._data.charStats).map(([char, s]) => {
      const total = s.correct + s.wrong;
      const accuracy = total > 0 ? Math.round((s.correct / total) * 100) : 100;
      const topConfusions = Object.entries(s.confusedWith)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([c, n]) => `${c}(${n})`);
      return {
        char,
        correct: s.correct,
        wrong: s.wrong,
        accuracy,
        topConfusions,
      };
    });
  }

  getDropoutReport() {
    const counts = {};
    this._data.sessions.forEach((sess) => {
      sess.events.forEach((ev) => {
        if (ev.type === "scene_change") {
          const key = `${ev.from}→${ev.to}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([transition, count]) => ({ transition, count }));
  }

  getSessions() {
    return this._data.sessions;
  }

  // -------- Export / Clear --------
  exportJSON() {
    const blob = new Blob([JSON.stringify(this._data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mojioboe_analytics_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearData() {
    this._data = { sessions: [], wordStats: {}, charStats: {} };
    localStorage.removeItem(AnalyticsManager.STORAGE_KEY);
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
    this.analytics = new AnalyticsManager();

    this.currentScene = "niwa";
    this.currentWord = null;
    this.currentCharIndex = 0;

    this.initElements();
    this.attachEventListeners();
    this.initNiwa();
    this.bgManager.update(this.save.petLevel);

    // セッション開始
    this.analytics.startSession(
      this.save.data.activePet,
      this.save.petLevel,
      this.save.getWordCount(),
    );
    // ページ離脱時にセッション終了
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.analytics.endSession();
      } else {
        // 復帰時に新セッション開始
        this.analytics.startSession(
          this.save.data.activePet,
          this.save.petLevel,
          this.save.getWordCount(),
        );
      }
    });
  }

  // petType は save.data.activePet の単一参照にする
  get petType() {
    return this.save.data.activePet;
  }

  initElements() {
    this.scenes = {
      niwa: document.getElementById("niwa-scene"),
      zukan: document.getElementById("zukan-scene"),
      wordSelect: document.getElementById("word-select-scene"),
      mojisagashi: document.getElementById("mojisagashi-scene"),
      result: document.getElementById("result-scene"),
    };

    // Header
    this.headerStats = document.getElementById("header-stats");
    this.petLevelDisplay = document.getElementById("pet-level");
    this.expBarFill = document.getElementById("exp-bar-fill");
    this.wordsCollected = document.getElementById("words-collected");

    // Niwa
    this.niwaPet = document.getElementById("niwa-pet");
    this.niwaPetName = document.getElementById("niwa-pet-name");
    this.niwaWordsCount = document.getElementById("niwa-words-count");
    this.speechBubble = document.getElementById("pet-speech-bubble");

    // Zukan
    this.zukanGrid = document.getElementById("zukan-grid");
    this.zukanCount = document.getElementById("zukan-count");
    this.zukanBadges = document.getElementById("zukan-badges");

    // Mojisagashi
    this.targetSilhouette = document.getElementById("target-silhouette");
    this.charSlotsEl = document.getElementById("char-slots");
    this.cloudArea = document.getElementById("cloud-area");

    // Result
    this.resultPet = document.getElementById("result-pet");
    this.evolutionMessage = document.getElementById("evolution-message");
    this.levelupMessage = document.getElementById("levelup-message");
    this.collectedWordDisplay = document.getElementById(
      "collected-word-display",
    );
    this.nextWordBtn = document.getElementById("next-word-btn");
    this.retryBtn = document.getElementById("retry-btn");
    this.wordsProgressDisplay = document.getElementById(
      "words-progress-display",
    );
  }

  attachEventListeners() {
    document.getElementById("play-btn").addEventListener("click", () => {
      this.audio.ensureContext();
      this.showWordSelectScreen();
    });

    document.getElementById("open-zukan-btn").addEventListener("click", () => {
      this.audio.ensureContext();
      this.showZukan();
    });
    document.getElementById("close-zukan-btn").addEventListener("click", () => {
      this.switchScene("niwa");
    });

    document
      .getElementById("cancel-word-select-btn")
      .addEventListener("click", () => {
        this.switchScene("niwa");
      });

    this.nextWordBtn.addEventListener("click", () => {
      this.showWordSelectScreen();
    });

    this.retryBtn.addEventListener("click", () => {
      // result→niwa はすでに word_complete 済みなので abandon しない
      this.switchScene("niwa");
      this.initNiwa();
      this.audio.stopBGM();
    });

    this.niwaPet.addEventListener("click", (e) => {
      this.audio.ensureContext();
      this.audio.playPetTap();
      this.spawnHeart(e);
      this.showPetSpeech();
      this.niwaPet.classList.remove("pet-click-jump");
      void this.niwaPet.offsetWidth;
      this.niwaPet.classList.add("pet-click-jump");
      setTimeout(() => this.niwaPet.classList.remove("pet-click-jump"), 700);
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
      if (
        confirm(
          "ほんとうに さいしょから あそぶ？\nぜんぶの データが きえちゃうよ！",
        )
      ) {
        localStorage.removeItem(this.save.SAVE_KEY);
        location.reload();
      }
    });

    document.querySelectorAll(".pet-switch-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const petId = btn.dataset.pet;
        if (!this.save.data.unlockedPets.includes(petId)) return;
        this.save.switchPet(petId);
        this.initNiwa();
      });
    });
  }

  // ========== Scene Management ==========
  switchScene(sceneName) {
    this.analytics.track("scene_change", {
      from: this.currentScene,
      to: sceneName,
    });
    Object.values(this.scenes).forEach((el) => {
      el.classList.remove("active");
      el.style.display = "none";
    });
    const target = this.scenes[sceneName];
    if (!target) return;
    target.style.display = "flex";
    void target.offsetWidth;
    target.classList.add("active");
    this.currentScene = sceneName;

    if (sceneName === "mojisagashi") {
      this.headerStats.classList.remove("hidden");
      this.updateHeaderStats();
    } else {
      this.headerStats.classList.add("hidden");
    }

    // 「さいしょからあそぶ」ボタンはniwaのみ表示
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.style.display = sceneName === "niwa" ? "" : "none";
  }

  // ========== にわ (Home) ==========
  initNiwa() {
    this.updateNiwaPet();
    this.bgManager.update(this.save.petLevel);
    this.updatePetSwitchBar();
    this.updateNiwaCollection();
    this.bgManager.updateNiwaBgItems();

    const count = this.save.getWordCount();
    if (this.niwaWordsCount)
      this.niwaWordsCount.textContent = `ことば: ${count}こ あつめた`;
  }

  updatePetSwitchBar() {
    const unlocked = this.save.data.unlockedPets;
    const active = this.save.data.activePet;
    const petNames = { chick: "ひよこ", mermaid: "にんぎょ" };

    document.querySelectorAll(".pet-switch-btn").forEach((btn) => {
      const petId = btn.dataset.pet;
      const isUnlocked = unlocked.includes(petId);

      if (!isUnlocked) {
        btn.style.display = "";
        btn.disabled = true;
        btn.classList.remove("active");
        btn.classList.add("locked");
        btn.textContent = `🔒 ${petNames[petId]}`;
        return;
      }

      btn.style.display = "";
      btn.disabled = false;
      const isActive = petId === active;
      btn.classList.toggle("active", isActive);
      btn.classList.remove("locked");

      const config = PET_CONFIG[petId];
      const lv = this.save.data.petData[petId].level || 1;
      const stageIdx = config.getStageIndex(lv);
      const stageData = config.stages[stageIdx];
      const display = stageData.image ? "" : stageData.text + " ";
      btn.textContent = `${display}${petNames[petId]}`;
    });
  }

  updateNiwaCollection() {
    const container = document.getElementById("niwa-collection-items");
    if (!container) return;
    container.innerHTML = "";
    const allItems = this.save.data.niwaItems || [];
    // 現在のactivePetに対応する絵文字のみ表示
    const petEmojis = new Set(
      WORD_DATA.filter((w) => w.pet === this.petType).map((w) => w.emoji),
    );
    const items = allItems.filter((e) => petEmojis.has(e));
    items.slice(-MAX_NIWA_COLLECTION_DISPLAY).forEach((emoji, i) => {
      const el = document.createElement("div");
      el.className = "niwa-collection-item";
      el.textContent = emoji;
      el.style.left = 8 + (i % 6) * 14 + "%";
      el.style.bottom = 4 + Math.floor(i / 6) * 14 + "%";
      el.style.animationDelay = i * 0.15 + "s";
      el.addEventListener("click", () => {
        this.audio.ensureContext();
        this.audio.playPetTap();
        const rect = el.getBoundingClientRect();
        this.particles.emitStars(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          5,
        );
        const wordEntry = EMOJI_WORD_MAP.get(emoji);
        if (wordEntry) {
          this.showSpeechBubble(wordEntry.petReaction);
        }
        el.classList.remove("item-tap");
        void el.offsetWidth;
        el.classList.add("item-tap");
        setTimeout(() => el.classList.remove("item-tap"), 400);
      });
      container.appendChild(el);
    });
  }

  updateNiwaPet() {
    const config = PET_CONFIG[this.petType];
    const stageIdx = config.getStageIndex(this.save.petLevel);
    const stageData = config.stages[stageIdx];
    renderPetToElement(this.niwaPet, stageData);
    this.niwaPetName.textContent = `${stageData.text} ${stageData.label} Lv.${this.save.petLevel}`;
  }

  // ========== 吹き出し表示（共通）==========
  showSpeechBubble(text, durationMs = SPEECH_BUBBLE_DURATION_MS) {
    this.speechBubble.textContent = text;
    this.speechBubble.classList.remove("hidden");
    clearTimeout(this._speechTimer);
    this._speechTimer = setTimeout(
      () => this.speechBubble.classList.add("hidden"),
      durationMs,
    );
  }

  showPetSpeech() {
    const collected = this.save.data.collectedWords;
    let text = "ぴよ〜！あそんで！";
    if (collected.length > 0) {
      const word = collected[Math.floor(Math.random() * collected.length)];
      const entry = WORD_MAP.get(word);
      if (entry) text = entry.petReaction;
    }
    this.showSpeechBubble(text);
  }

  spawnHeart(e) {
    const heartsContainer = document.getElementById("niwa-hearts");
    const icons = ["❤️", "⭐", "💫", "🌸"];
    const heart = document.createElement("div");
    heart.className = "niwa-heart";
    heart.textContent = icons[Math.floor(Math.random() * icons.length)];
    const rect = this.niwaPet.getBoundingClientRect();
    const parentRect = heartsContainer.getBoundingClientRect();
    heart.style.left = rect.left - parentRect.left + rect.width / 2 + "px";
    heart.style.top = rect.top - parentRect.top + "px";
    heart.style.setProperty("--dx", (Math.random() - 0.5) * 60 + "px");
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }

  // ========== Header Stats ==========
  updateHeaderStats() {
    const level = this.save.petLevel;
    const petId = this.save.data.activePet;
    const count = this.save.getWordCount();
    const nextCount = getWordsForNextLevel(level, petId);
    const prevCount = getLevelThreshold(level, petId);
    const progress =
      level >= 7 ? 100 : ((count - prevCount) / (nextCount - prevCount)) * 100;

    this.petLevelDisplay.textContent = level;
    this.expBarFill.style.width = Math.min(Math.max(progress, 0), 100) + "%";
    if (this.wordsCollected) this.wordsCollected.textContent = count;
  }

  // ========== もじずかん ==========
  showZukan() {
    this.switchScene("zukan");
    this.renderZukan();
  }

  renderZukan() {
    const collectedChars = new Set();
    this.save.data.collectedWords.forEach((word) => {
      const entry = WORD_MAP.get(word);
      if (entry) entry.chars.forEach((c) => collectedChars.add(c));
    });

    this.zukanGrid.innerHTML = "";
    this.zukanCount.textContent = collectedChars.size;

    ALL_HIRAGANA.forEach((char) => {
      const cell = document.createElement("div");
      cell.className = "zukan-cell";
      const data = HIRAGANA_MAP.get(char);

      if (collectedChars.has(char)) {
        cell.classList.add("known");
        cell.innerHTML = `<span>${char}</span><span class="zukan-emoji">${data ? data.emoji : ""}</span>`;
        cell.addEventListener("click", () => this.showZukanDetail(char));
      } else {
        cell.classList.add("unknown");
        cell.textContent = "？";
      }
      this.zukanGrid.appendChild(cell);
    });

    this.zukanBadges.innerHTML = "";
    if (collectedChars.size >= 10) this.zukanBadges.innerHTML += "🥉";
    if (collectedChars.size >= 25) this.zukanBadges.innerHTML += "🥈";
    if (collectedChars.size >= 46) this.zukanBadges.innerHTML += "🏅";
  }

  showZukanDetail(char) {
    const data = HIRAGANA_MAP.get(char);
    if (!data) return;
    const modal = document.getElementById("zukan-detail-modal");
    document.getElementById("zukan-detail-char").textContent = char;
    document.getElementById("zukan-detail-emoji").textContent = data.emoji;
    document.getElementById("zukan-detail-word").textContent = data.word;
    modal.classList.remove("hidden");
    this.audio.speak(data.word, data.speech);
    document.getElementById("zukan-detail-speak").onclick = () =>
      this.audio.speak(data.word, data.speech);
    document.getElementById("zukan-detail-close").onclick = () =>
      modal.classList.add("hidden");
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    };
  }

  // ========== 単語選択画面 ==========
  showWordSelectScreen() {
    this.switchScene("wordSelect");
    const petId = this.save.data.activePet;
    const currentLevel = this.save.petLevel;
    const petWords = WORD_DATA.filter((d) => d.pet === petId);
    const collected = this.save.data.collectedWords;
    const petNames = { chick: "ひよこ", mermaid: "にんぎょ" };
    document.getElementById("word-select-title").textContent =
      `${petNames[petId]}の　ことばをえらんで！`;

    // レベルごとに表示する単語を固定する（wordLevelTable のインデックスで決定）
    let wordsToShow;
    if (currentLevel >= 7) {
      wordsToShow = petWords;
    } else {
      const startIdx = getLevelThreshold(currentLevel, petId);
      const endIdx = getWordsForNextLevel(currentLevel, petId);
      wordsToShow = petWords.slice(startIdx, endIdx);
    }

    const grid = document.getElementById("word-select-grid");
    grid.innerHTML = "";
    wordsToShow.forEach((entry) => {
      const isCollected = collected.includes(entry.word);
      const card = document.createElement("div");
      card.className = "word-card" + (isCollected ? " collected" : " unknown");

      if (isCollected) {
        card.innerHTML = `
                    <div class="word-card-silhouette">${entry.emoji}</div>
                    <div class="word-card-name">${entry.word}</div>
                    <span class="collected-badge">✅</span>
                `;
      } else {
        const questionText = "？".repeat(entry.word.length);
        card.innerHTML = `
                    <div class="word-card-silhouette silhouette">${entry.emoji}</div>
                    <div class="word-card-name unknown-name">${questionText}</div>
                `;
      }

      card.addEventListener("click", () => {
        this.audio.ensureContext();
        this.startMojiSagashi(entry);
      });
      grid.appendChild(card);
    });
  }

  // ========== もじさがし ==========
  startMojiSagashi(wordEntry) {
    this.currentWord = wordEntry;
    this.currentCharIndex = 0;
    const isReplay = this.save.data.collectedWords.includes(wordEntry.word);
    this.analytics.startWordAttempt(wordEntry, isReplay);
    this.switchScene("mojisagashi");
    this.audio.startBGM("title");
    this.renderSilhouette();
    this.renderCharSlots();
    this.showNextChar();
  }

  renderSilhouette() {
    this.targetSilhouette.innerHTML = "";
    const el = document.createElement("div");
    el.className = "silhouette-emoji";
    el.id = "silhouette-emoji-inner";
    el.textContent = this.currentWord.emoji;
    this.targetSilhouette.appendChild(el);
  }

  renderCharSlots() {
    this.charSlotsEl.innerHTML = "";
    this.currentWord.chars.forEach((char, i) => {
      const slot = document.createElement("div");
      slot.className = "char-slot";
      slot.id = `char-slot-${i}`;
      this.charSlotsEl.appendChild(slot);
    });
  }

  getChoiceCount() {
    const lv = this.save.petLevel;
    if (lv <= 2) return 2;
    if (lv <= 5) return 3;
    return 4;
  }

  showNextChar() {
    if (this.currentCharIndex >= this.currentWord.chars.length) {
      this.showWordClear();
      return;
    }

    const target = this.currentWord.chars[this.currentCharIndex];

    document
      .querySelectorAll(".char-slot")
      .forEach((s) => s.classList.remove("active-slot"));
    const activeSlot = document.getElementById(
      `char-slot-${this.currentCharIndex}`,
    );
    if (activeSlot) {
      activeSlot.classList.add("active-slot");
      activeSlot.dataset.hint = target;
    }

    setTimeout(() => this.audio.speak(target, { pitch: 1.2, rate: 0.7 }), 200);

    const choiceCount = this.getChoiceCount();
    const allChars = ALL_HIRAGANA.filter((c) => c !== target);
    const distractors = [...allChars]
      .sort(() => 0.5 - Math.random())
      .slice(0, choiceCount - 1);
    const choices = [target, ...distractors].sort(() => 0.5 - Math.random());
    this.renderClouds(choices, target);
  }

  renderClouds(choices, target) {
    this.cloudArea.innerHTML = "";
    choices.forEach((char, i) => {
      const cloud = document.createElement("div");
      cloud.className = "cloud-choice";
      cloud.style.animationDelay = i * 0.35 + "s";

      const charEl = document.createElement("span");
      charEl.className = "cloud-char";
      charEl.textContent = char;
      cloud.appendChild(charEl);

      cloud.addEventListener("click", () =>
        this.handleCloudAnswer(char === target, cloud, char),
      );
      this.cloudArea.appendChild(cloud);
    });
  }

  handleCloudAnswer(isCorrect, cloudEl, char) {
    const target = this.currentWord.chars[this.currentCharIndex];
    this.analytics.track("char_attempt", {
      word: this.currentWord.word,
      charIndex: this.currentCharIndex,
      target,
      selected: char,
      isCorrect,
    });
    if (isCorrect) {
      cloudEl.classList.add("cloud-correct");
      this.audio.playCorrect();

      const rect = cloudEl.getBoundingClientRect();
      this.particles.emitStars(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        6,
      );

      this.cloudArea.querySelectorAll(".cloud-choice").forEach((c) => {
        c.style.pointerEvents = "none";
      });

      setTimeout(() => {
        const slot = document.getElementById(
          `char-slot-${this.currentCharIndex}`,
        );
        if (slot) {
          slot.textContent = char;
          slot.dataset.hint = "";
          slot.classList.add("slot-filled");
          slot.classList.remove("active-slot");
        }
        this.currentCharIndex++;
        setTimeout(() => this.showNextChar(), 400);
      }, 600);
    } else {
      cloudEl.classList.add("cloud-wrong");
      cloudEl.style.pointerEvents = "none";
      this.audio.playWrong();
      setTimeout(() => {
        cloudEl.style.visibility = "hidden";
      }, 550);
    }
  }

  // ========== 全文字クリア ==========
  async showWordClear() {
    this.audio.stopBGM();

    const scene = document.getElementById("mojisagashi-scene");

    const petEl = document.createElement("div");
    petEl.className = "game-pet-popup";
    const config = PET_CONFIG[this.petType];
    const stageData = config.stages[config.getStageIndex(this.save.petLevel)];
    petEl.style.fontSize = "0";
    renderPetToElement(petEl, stageData);
    scene.appendChild(petEl);

    const speechEl = document.createElement("div");
    speechEl.className = "game-speech-bubble";
    speechEl.textContent = this.currentWord.petReaction;
    scene.appendChild(speechEl);

    await wait(300);
    this.audio.speak(`「${this.currentWord.word}」を みつけたよ！`, {
      pitch: 1.3,
      rate: 0.85,
    });

    await wait(1500);
    this.audio.speak(this.currentWord.petReaction, { pitch: 1.3, rate: 0.85 });
    const inner = document.getElementById("silhouette-emoji-inner");
    if (inner) inner.classList.add("revealed");
    this.particles.emitConfetti(20);
    this.particles.emitFireworks(
      window.innerWidth / 2,
      window.innerHeight / 3,
      12,
    );
    this.audio.playLevelUp();

    await wait(1700);
    petEl.remove();
    speechEl.remove();
    this.showResult();
  }

  // ========== リザルト ==========
  showResult() {
    this.analytics.endWordAttempt(true);
    const wordEntry = this.currentWord;
    const oldLevel = this.save.petLevel;
    const leveledUp = this.save.addCollectedWord(wordEntry.word);
    const newLevel = this.save.petLevel;

    this.switchScene("result");
    this._showResultPet(newLevel);
    this._showResultWord(wordEntry);
    this._showResultProgress(newLevel);

    if (leveledUp) {
      this._playLevelUpSequence(oldLevel, newLevel);
    } else {
      this._playResultPraise();
    }

    this.bgManager.update(newLevel);
  }

  _showResultPet(newLevel) {
    const config = PET_CONFIG[this.petType];
    const stageData = config.stages[config.getStageIndex(newLevel)];
    renderPetToElement(this.resultPet, stageData);
    this.resultPet.classList.remove("pet-happy-bounce");
    void this.resultPet.offsetWidth;
    this.resultPet.classList.add("pet-happy-bounce");
  }

  _showResultWord(wordEntry) {
    this.collectedWordDisplay.classList.remove("hidden");
    document.getElementById("collected-word-emoji").textContent =
      wordEntry.emoji;
    document.getElementById("collected-word-text").textContent =
      `「${wordEntry.word}」を　あつめた！`;
  }

  _showResultProgress(newLevel) {
    const count = this.save.getWordCount();
    const nextCount = getWordsForNextLevel(newLevel, this.petType);
    this.wordsProgressDisplay.textContent =
      newLevel >= 7
        ? `ことば: ${count}こ （さいこうレベル！🎉）`
        : `ことば: ${count}こ　→　あと ${nextCount - count}こ で Lv.${newLevel + 1} 🐣`;
  }

  _playLevelUpSequence(oldLevel, newLevel) {
    this.analytics.track("level_up", {
      pet: this.petType,
      oldLevel,
      newLevel,
    });
    setTimeout(() => {
      this.levelupMessage.classList.remove("hidden");
      this.audio.playLevelUp();
      this.particles.emitFireworks(
        window.innerWidth / 2,
        window.innerHeight / 3,
        25,
      );

      const config = PET_CONFIG[this.petType];
      if (config.getStageIndex(newLevel) !== config.getStageIndex(oldLevel)) {
        setTimeout(() => this._playEvolutionSequence(newLevel), 1000);
      }

      // PET_CONFIG.unlocks からアンロック条件を参照
      const unlock = config.unlocks;
      if (unlock && newLevel >= unlock.atLevel) {
        if (this.save.unlockPet(unlock.petId)) {
          setTimeout(() => this._playUnlockSequence(), 2500);
        }
      }
    }, 600);
  }

  _playEvolutionSequence(newLevel) {
    const config = PET_CONFIG[this.petType];
    const stageData = config.stages[config.getStageIndex(newLevel)];
    this.particles.flashScreen();
    this.audio.playEvolution();
    this.evolutionMessage.classList.remove("hidden");
    this.evolutionMessage.textContent = `${stageData.label}に しんかしたよ！✨`;
    this.audio.speak(
      `やったー！${stageData.label}に しんかした！`,
      SPEECH_PHRASES.evolution,
    );
  }

  _playUnlockSequence() {
    this.particles.emitConfetti(30);
    this.audio.speak(
      "にんぎょが アンロックされたよ！あたらしい ペットを そだてよう！",
      { pitch: 1.1, rate: 0.85 },
    );
  }

  _playResultPraise() {
    this.levelupMessage.classList.add("hidden");
    this.evolutionMessage.classList.add("hidden");
    setTimeout(() => {
      const praises = [
        "すごいね！あつめたね！",
        "やったね！",
        "もう1こあつめよう！",
      ];
      this.audio.speak(praises[Math.floor(Math.random() * praises.length)], {
        pitch: 1.1,
        rate: 0.9,
      });
    }, 500);
  }
}

// ========== Initialize ==========
window.addEventListener("DOMContentLoaded", () => {
  const game = new Game();

  // Admin panel (?admin=1)
  if (new URLSearchParams(location.search).has("admin")) {
    initAnalyticsPanel(game.analytics);
  }
});

// ========== Admin Panel ==========
function initAnalyticsPanel(analytics) {
  const panel = document.getElementById("analytics-panel");
  if (!panel) return;
  panel.classList.remove("hidden");

  let wordSortCol = "completionRate";
  let wordSortDir = -1;
  let charSortCol = "accuracy";
  let charSortDir = 1;

  function fmtMs(ms) {
    if (!ms) return "-";
    return ms < 1000 ? ms + "ms" : (ms / 1000).toFixed(1) + "s";
  }

  function renderSummary() {
    const sessions = analytics.getSessions();
    const wordReport = analytics.getWordReport();
    const totalMs = sessions.reduce(
      (s, sess) => s + ((sess.endedAt || Date.now()) - sess.startedAt),
      0,
    );
    const totalCompleted = wordReport.reduce((s, w) => s + w.completions, 0);

    const cards = [
      { label: "セッション数", value: sessions.length },
      {
        label: "総プレイ時間",
        value:
          totalMs < 60000
            ? Math.round(totalMs / 1000) + "秒"
            : Math.floor(totalMs / 60000) + "分",
      },
      { label: "総完了単語", value: totalCompleted + "語" },
      { label: "収集単語種類", value: wordReport.length + "種" },
    ];

    const el = document.getElementById("analytics-summary");
    el.innerHTML = cards
      .map(
        (c) =>
          `<div class="analytics-card"><div class="card-value">${c.value}</div><div class="card-label">${c.label}</div></div>`,
      )
      .join("");
  }

  function renderWordTable() {
    const data = analytics
      .getWordReport()
      .sort(
        (a, b) =>
          wordSortDir *
          (a[wordSortCol] > b[wordSortCol]
            ? 1
            : a[wordSortCol] < b[wordSortCol]
              ? -1
              : 0),
      );
    const tbody = document.querySelector("#analytics-word-table tbody");
    tbody.innerHTML = data
      .map(
        (r) =>
          `<tr><td>${r.word}</td><td>${r.totalAttempts}</td><td>${r.completions}</td><td>${r.completionRate}%</td><td>${r.abandonments}</td><td>${r.replays}</td><td>${fmtMs(r.avgTimeMs)}</td></tr>`,
      )
      .join("");
    document
      .querySelectorAll("#analytics-word-table th.sortable")
      .forEach((th) => {
        th.classList.remove("sort-asc", "sort-desc");
        if (th.dataset.col === wordSortCol) {
          th.classList.add(wordSortDir === 1 ? "sort-asc" : "sort-desc");
        }
      });
  }

  function renderCharTable() {
    const data = analytics
      .getCharReport()
      .sort(
        (a, b) =>
          charSortDir *
          (a[charSortCol] > b[charSortCol]
            ? 1
            : a[charSortCol] < b[charSortCol]
              ? -1
              : 0),
      );
    const tbody = document.querySelector("#analytics-char-table tbody");
    tbody.innerHTML = data
      .map(
        (r) =>
          `<tr><td>${r.char}</td><td>${r.correct}</td><td>${r.wrong}</td><td>${r.accuracy}%</td><td>${r.topConfusions.join(", ") || "-"}</td></tr>`,
      )
      .join("");
    document
      .querySelectorAll("#analytics-char-table th.sortable")
      .forEach((th) => {
        th.classList.remove("sort-asc", "sort-desc");
        if (th.dataset.col === charSortCol) {
          th.classList.add(charSortDir === 1 ? "sort-asc" : "sort-desc");
        }
      });
  }

  function renderDropoutTable() {
    const data = analytics.getDropoutReport();
    const tbody = document.querySelector("#analytics-dropout-table tbody");
    tbody.innerHTML = data
      .map((r) => `<tr><td>${r.transition}</td><td>${r.count}</td></tr>`)
      .join("");
  }

  function renderAll() {
    renderSummary();
    renderWordTable();
    renderCharTable();
    renderDropoutTable();
  }

  renderAll();

  // Sort: Word table
  document
    .querySelectorAll("#analytics-word-table th.sortable")
    .forEach((th) => {
      th.addEventListener("click", () => {
        if (wordSortCol === th.dataset.col) {
          wordSortDir *= -1;
        } else {
          wordSortCol = th.dataset.col;
          wordSortDir = -1;
        }
        renderWordTable();
      });
    });

  // Sort: Char table
  document
    .querySelectorAll("#analytics-char-table th.sortable")
    .forEach((th) => {
      th.addEventListener("click", () => {
        if (charSortCol === th.dataset.col) {
          charSortDir *= -1;
        } else {
          charSortCol = th.dataset.col;
          charSortDir = 1;
        }
        renderCharTable();
      });
    });

  // Export
  document
    .getElementById("analytics-export-btn")
    .addEventListener("click", () => {
      analytics.exportJSON();
    });

  // Clear
  document
    .getElementById("analytics-clear-btn")
    .addEventListener("click", () => {
      if (confirm("アナリティクスデータを全て削除しますか？")) {
        analytics.clearData();
        renderAll();
      }
    });

  // Close
  document
    .getElementById("analytics-close-btn")
    .addEventListener("click", () => {
      panel.classList.add("hidden");
    });
}
