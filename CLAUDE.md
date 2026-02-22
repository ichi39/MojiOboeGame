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

データリセットは画面下部の「さいしょからあそぶ」ボタン、または `localStorage.clear()` でも可能。

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
- ひよこ: `[0, 2, 4, 7, 10, 12, 14]`（合計14語で Lv7）
- にんぎょ: `[0, 3, 5, 6, 7, 8, 9]`（合計9語で Lv7）

**`WORD_DATA`** — もじさがしの単語リスト。各エントリは `{ word, emoji, chars[], pet, petReaction }` を持つ。`pet` フィールドで `'chick'` / `'mermaid'` に割り当て済み（ひよこ: 14語、にんぎょ: 9語）。

**`HIRAGANA_DATA`** — 46文字のひらがな。`speech` フィールドで読み上げ調整（`pitch`, `rate`, `reading`）。

### レベル計算ヘルパー関数

```js
getLevelFromWordCount(count, petId)   // 累計収集数 → Lv
getLevelThreshold(level, petId)        // そのLvの累計閾値（Lvになるのに必要だった数）
getWordsForNextLevel(level, petId)     // 次Lvへの累計閾値
getWordsPerLevelStep(level, petId)     // 現在Lvから次Lvへの1段分のことば数
```

すべて `petId` を第2引数に渡すこと。省略すると旧デフォルト値にフォールバックする。

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
ひよこが `Lv7` に達した時点で `showResult()` 内でにんぎょがアンロックされる。アンロック前はホーム画面のペット切り替えボタンを非表示にする（`updatePetSwitchBar()` で `display: none`）。

## コンテンツ追加のルール

**単語を追加する場合** (`WORD_DATA`):
- `pet` は `'chick'` か `'mermaid'` のいずれか
- ひよこの合計語数が14語、にんぎょが9語を超えると Lv7 に到達できなくなる → `wordLevelTable` も同時に更新すること

**ペットの画像** (`assets/pets/`):
- 使用するのは `.PNG`（大文字拡張子）。`PET_CONFIG.stages[].image` パスと一致させること
- `.svg` ファイルは旧バージョンのもので現在は未使用

**音声調整** (`HIRAGANA_DATA[].speech` / `SPEECH_PHRASES`):
- 読み上げが不自然な単語は `reading` フィールドで漢字や別表記に上書き可能
