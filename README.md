# MojiOboeGame

ひらがなを楽しく覚える子ども向け育成ゲーム。ことばを集めてペット（ひよこ・にんぎょ）を育てる。

## 遊び方

1. 「あそぶ！」ボタンを押してことばを選ぶ
2. 表示された絵のことばを構成する文字を雲の中から選ぶ
3. 全文字正解するとことばを収集してペットが育つ
4. ひよこを Lv7 まで育てるとにんぎょがアンロックされる

## 開発環境の起動

```bash
python3 -m http.server 8080
# → http://localhost:8080 をブラウザで開く
```

ビルドツール不要の静的 HTML/CSS/JS。`file://` 直接開きでも動作するが、音声合成はサーバー経由が安定。

## ファイル構成

```
index.html      — 全シーンの DOM 構造
script.js       — ゲームロジック全体（1ファイル）
style.css       — 全スタイル（1ファイル）
assets/pets/    — ペット画像（PNG）
```

## localStorage キー

| キー | 内容 |
|-----|------|
| `mojioboe_v3_save` | ゲームセーブデータ |
| `mojioboe_analytics_v1` | 学習履歴・アナリティクス |

## データリセット

```js
// セーブデータをリセット（さいしょからあそぶ）
localStorage.removeItem("mojioboe_v3_save")

// アナリティクスデータをリセット
localStorage.removeItem("mojioboe_analytics_v1")
```

## Admin パネル（アナリティクス閲覧）

`?admin=1` パラメータを付けてアクセスすると管理画面が表示される。

```
http://localhost:8080/?admin=1
```

- 単語別: 完了率・平均クリア時間・離脱数・リプレイ数
- 文字別: 正答率・混同しやすい文字 Top3
- シーン遷移: 離脱ポイントの確認
- JSON Export / データクリア
