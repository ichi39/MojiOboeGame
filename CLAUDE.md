# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ひらがなを楽しく覚える子ども向け育成ゲーム。ことばを集めてペット（ひよこ・にんぎょ）を育てる。ビルドツール不要の純粋な静的 HTML/CSS/JS。

## 開発環境の起動

```bash
# ブラウザで直接開く（ローカルサーバーなし）
open index.html

# または Python の簡易サーバーを使う
python3 -m http.server 8080
```

テストは手動でブラウザ確認。`localStorage` を使うため、ファイルURL（`file://`）でも動作するが、音声合成の挙動はサーバー経由の方が安定する。

データリセットは画面下部の「さいしょからあそぶ」ボタン、または `localStorage.removeItem("mojioboe_v3_save")` で可能。

アナリティクスデータのリセット: `localStorage.removeItem("mojioboe_analytics_v1")`
Admin パネル（データ閲覧）: `http://localhost:8080/?admin=1`

## ファイル構成

- `index.html` — 全シーンのDOM構造を静的に定義
- `script.js` — ゲームロジック全体（1ファイル）
- `style.css` — 全スタイル（1ファイル）
- `assets/pets/` — ペット画像（PNG が現行使用、SVG は旧バージョン）

## アーキテクチャ

### シーン管理
5つのシーン（`niwa`, `zukan`, `wordSelect`, `mojisagashi`, `result`）を `Game.switchScene()` で切り替える。全シーンは常にDOMに存在し、`display: none / flex` と `.active` クラスで表示を制御する。

### データフロー
```
WORD_DATA (単語定義) ──→ showWordSelectScreen() → startMojiSagashi()
                                                        ↓
HIRAGANA_DATA (46文字) ──→ showNextChar() → handleCloudAnswer()
                                                        ↓
                                               showResult() → SaveManager.addCollectedWord()
```

### 主要データ定数

**`PET_CONFIG`** — ペットごとの設定:
- `wordLevelTable: number[]` — 累計ことば数のLv閾値（index i = Lv i+1 に必要な累計数）
- `stages[]` — 各Lvの画像・ラベル
- `unlocks?: { petId, atLevel }` — このペットが指定Lvに達したときにアンロックするペット
- `getStageIndex(level)` — level → stages配列インデックス（`_petGetStageIndex` を共有）
- ひよこ: `[0, 2, 4, 7, 10, 12, 14]`（合計14語で Lv7）、Lv7到達でにんぎょをアンロック
- にんぎょ: `[0, 3, 5, 6, 7, 8, 9]`（合計9語で Lv7）

**`WORD_DATA`** — もじさがしの単語リスト。各エントリは `{ word, emoji, chars[], pet, petReaction }` を持つ。`pet` フィールドで `'chick'` / `'mermaid'` に割り当て済み（ひよこ: 14語、にんぎょ: 9語）。

**`HIRAGANA_DATA`** — 46文字のひらがな。`speech` フィールドは読み上げが不自然な場合のみ記述する（`reading` で読み上げテキスト上書き、`pitch`/`rate` でイントネーション調整）。デフォルト値（pitch: 1.0, rate: 0.8）は `speak()` 側で保持するため省略可。

### O(1) ルックアップマップ

`HIRAGANA_DATA` / `WORD_DATA` への検索は Map を使う（`Array.find()` は使わない）:

```js
HIRAGANA_MAP   // Map<char, HiraganaEntry>       — HIRAGANA_DATA から生成
WORD_MAP       // Map<word, WordEntry>            — WORD_DATA から生成
EMOJI_WORD_MAP // Map<emoji, WordEntry>           — WORD_DATA から生成
```

### レベル計算ヘルパー関数

```js
getLevelFromWordCount(count, petId)   // 累計収集数 → Lv
getLevelThreshold(level, petId)        // そのLvの累計閾値（Lvになるのに必要だった数）
getWordsForNextLevel(level, petId)     // 次Lvへの累計閾値
getWordsPerLevelStep(level, petId)     // 現在Lvから次Lvへの1段分のことば数
```

すべて `petId` を第2引数に渡すこと。省略すると旧デフォルト値にフォールバックする。

### アナリティクス

`AnalyticsManager` が `localStorage`（キー: `mojioboe_analytics_v1`）に学習履歴を保存する。

**記録イベント:**

| イベント | 発火タイミング |
|---------|--------------|
| `session_start` / `session_end` | ページロード / `visibilitychange` |
| `scene_change` | `switchScene()` |
| `word_start` | `startMojiSagashi()`（`isReplay` 自動判定） |
| `word_complete` / `word_abandon` | `showResult()` / 中断時 |
| `char_attempt` | `handleCloudAnswer()`（正誤両方） |
| `level_up` | `_playLevelUpSequence()` |

**パブリック API:**
```js
analytics.track(type, payload)          // 任意イベント記録
analytics.startWordAttempt(entry, isReplay)
analytics.endWordAttempt(completed)     // true=完了 / false=中断
analytics.getWordReport()               // 単語別集計レポート
analytics.getCharReport()               // 文字別正答率レポート
analytics.getDropoutReport()            // シーン遷移・離脱ポイント
analytics.exportJSON()                  // JSON ファイルダウンロード
```

**外部サービス連携フック:**
```js
window.analyticsExternalSend = (type, payload) => { /* GA / Mixpanel 等 */ };
```

**Admin パネル:** `?admin=1` URLパラメータで閲覧用オーバーレイを表示。

**アナリティクスリセット:** `localStorage.removeItem("mojioboe_analytics_v1")`

### 永続化
`SaveManager` が `localStorage`（キー: `mojioboe_v3_save`）を管理。セーブデータの構造:
```js
{
  collectedWords: string[],  // 収集済みことばリスト
  niwaItems: string[],       // にわに表示される絵文字
  unlockedPets: string[],    // アンロック済みペットID
  activePet: string,         // 現在選択中のペットID
  petData: { chick: { level }, mermaid: { level } }
}
```

`petLevel` getter は `activePet` のことばだけをフィルタしてLvを算出する。

### ペットのアンロック条件
アンロック条件は `PET_CONFIG[petId].unlocks` に定義する（コードにハードコードしない）。現在はひよこが `Lv7` に達した時点でにんぎょがアンロックされる。アンロック前はホーム画面のペット切り替えボタンをロック表示にする（`updatePetSwitchBar()`）。

### Game クラスの主要メソッド

| メソッド | 役割 |
|---------|------|
| `get petType()` | `save.data.activePet` への単一参照（フィールドではなくgetter） |
| `showSpeechBubble(text, ms?)` | 吹き出し表示の共通処理（`SPEECH_BUBBLE_DURATION_MS` でタイムアウト） |
| `async showWordClear()` | 全文字クリア演出（async/await で順序を制御） |
| `showResult()` | リザルト画面の統括。以下のサブメソッドに委譲する |
| `_showResultPet(newLevel)` | リザルト画面のペット表示 |
| `_showResultWord(wordEntry)` | 収集ことば表示 |
| `_showResultProgress(newLevel)` | 進捗テキスト表示 |
| `_playLevelUpSequence(oldLevel, newLevel)` | レベルアップ演出・進化・アンロック |
| `_playEvolutionSequence(newLevel)` | 進化エフェクト |
| `_playUnlockSequence()` | 新ペットアンロックエフェクト |
| `_playResultPraise()` | 通常終了の褒めセリフ |

### ParticleSystem

`_spawnParticle(className, lifetime, setup)` が共通の生成ヘルパー。`emitStars` / `emitFireworks` / `emitConfetti` はこれを使う。

## コンテンツ追加のルール

**単語を追加する場合** (`WORD_DATA`):
- `pet` は `'chick'` か `'mermaid'` のいずれか
- ひよこの合計語数が14語、にんぎょが9語を超えると Lv7 に到達できなくなる → `wordLevelTable` も同時に更新すること
- 追加後は `WORD_MAP` / `EMOJI_WORD_MAP` が自動で更新される（再宣言不要）

**ペットを追加する場合** (`PET_CONFIG`):
- `getStageIndex` は `_petGetStageIndex` を共有して使う
- アンロック条件は `unlocks: { petId, atLevel }` に記述する（`showResult()` に直接書かない）

**ペットの画像** (`assets/pets/`):
- 使用するのは `.PNG`（大文字拡張子）。`PET_CONFIG.stages[].image` パスと一致させること
- `.svg` ファイルは旧バージョンのもので現在は未使用

**音声調整** (`HIRAGANA_DATA[].speech` / `SPEECH_PHRASES`):
- 読み上げが不自然な単語は `reading` フィールドで漢字や別表記に上書き可能
- デフォルト値（pitch: 1.0, rate: 0.8）と同じ場合は `speech` フィールドを省略してよい
