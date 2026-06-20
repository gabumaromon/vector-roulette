# Slack /roulette コマンド

Slack の Slash Command `/roulette` を打つと、英会話練習用のトピックと
おすすめの話し方（Practice）、行き詰まったときのヒントをランダムに表示します。

```
🎲 Today's Topic
Japan

Suggested Practice  💭 Opinion  ⭐ Recommendation
━━━━━━━━━━
💡 Hints if you get stuck
• メイン・理由・エピソードを3秒で出す（日本語可）
• 加工文を入れる余地を探す
• 話しながら Actually / I mean で言い換える
```

---

## 1. フォルダ構成

```
slack-roulette/
├── api/
│   └── roulette.js     ← Slack からのリクエストを処理する本体（Vercel Functions）
├── package.json        ← プロジェクト設定
├── vercel.json          ← Vercel の設定（関数のタイムアウトなど）
├── .gitignore
└── README.md             ← このファイル
```

ポイント：Vercel は `api/` フォルダの中にあるファイルを自動的に
「1つのAPIエンドポイント」として認識します。
つまり `api/roulette.js` を置くだけで、
デプロイ後は `https://あなたのプロジェクト名.vercel.app/api/roulette`
という URL でアクセスできるようになります。

`api/roulette.js` の中身：

- `topics` … トピック一覧（例: "Japan", "Vancouver" など）と、それぞれに紐づく `practices`
- `practiceLabels` … practice のキー（`opinion` など）を絵文字付きの表示名に変換する辞書
- `hints` … 行き詰まったときに見せるヒント一覧
- `buildSlackMessage()` … 上記からランダムに選んでメッセージ文字列を組み立てる関数
- `module.exports = async function handler(req, res)` … Vercel が実際に呼び出す関数本体

---

## 2. 事前準備（アカウント作成）

以下、まだ持っていない場合は先に作成してください。すべて無料で始められます。

1. **GitHub アカウント**：https://github.com/signup
2. **Vercel アカウント**：https://vercel.com/signup
   （「Continue with GitHub」で GitHub アカウントと連携してログインするのが簡単です）
3. **Slack アプリの管理権限**：自分のワークスペースに Slack App を追加できる権限が必要です
   （Owner / Admin、もしくは管理者がアプリ追加を許可している必要があります）

---

## 3. GitHub にコードを登録する方法

ターミナル（Mac なら「ターミナル」、Windows なら「コマンドプロンプト」や「PowerShell」、
あるいは VS Code の統合ターミナル）を開いて作業します。

### 3-1. このフォルダで Git を初期化する

```bash
cd slack-roulette
git init
git add .
git commit -m "Initial commit: /roulette slash command"
```

### 3-2. GitHub 上に新しいリポジトリを作成する

1. https://github.com/new にアクセス
2. Repository name に `slack-roulette` などわかりやすい名前を入力
3. Public でも Private でもどちらでも構いません（個人利用なら Private 推奨）
4. 「Add a README file」などのチェックボックスは **すべて外したまま**「Create repository」をクリック
   （すでにローカルにファイルがあるため）

### 3-3. ローカルのコードを GitHub にプッシュする

GitHub のリポジトリ作成後の画面に表示される、
「…or push an existing repository from the command line」のコマンドを使います。
だいたい以下のような内容です（`あなたのユーザー名` の部分は実際のものに置き換えてください）。

```bash
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/slack-roulette.git
git push -u origin main
```

これで GitHub 上にコードが登録されます。ブラウザでリポジトリページを開き、
ファイル一覧が表示されていれば成功です。

---

## 4. Vercel にデプロイする方法

### 4-1. Vercel でプロジェクトをインポートする

1. https://vercel.com/new にアクセス（GitHub ログイン済みであること）
2. 「Import Git Repository」の一覧から、先ほど作成した `slack-roulette` を選択
   （表示されない場合は「Adjust GitHub App Permissions」からアクセス許可を追加してください）
3. Framework Preset は自動で「Other」になります。設定はそのままで問題ありません
4. 「Deploy」ボタンをクリック

数十秒ほどでデプロイが完了し、
`https://slack-roulette-あなたの識別子.vercel.app` のような URL が発行されます。

### 4-2. 動作確認（ブラウザ・curl どちらでもOK）

Slack を介さず、まず直接動くか確認しておくと安心です。
ターミナルで以下を実行してみてください（URL は自分のものに置き換え）。

```bash
curl -X POST https://あなたのプロジェクト.vercel.app/api/roulette
```

以下のような JSON が返ってくれば成功です。

```json
{
  "response_type": "in_channel",
  "text": "🎲 *Today's Topic*\n*Japan*\n\n*Suggested Practice*  💭 Opinion\n━━━━━━━━━━\n💡 *Hints if you get stuck*\n• ..."
}
```

---

## 5. Slack 側で Slash Command を作成する方法

### 5-1. Slack App を作成する

1. https://api.slack.com/apps にアクセス
2. 「Create New App」→「From scratch」を選択
3. App Name に「Topic Roulette」など好きな名前を入力
4. コマンドを使いたいワークスペースを選択し、「Create App」

### 5-2. Slash Command を設定する

1. 作成したアプリの管理画面、左メニューから「Slash Commands」を選択
2. 「Create New Command」をクリックし、以下を入力：

   | 項目 | 入力内容 |
   |---|---|
   | Command | `/roulette` |
   | Request URL | `https://あなたのプロジェクト.vercel.app/api/roulette` |
   | Short Description | 英会話の練習トピックをランダム表示 |
   | Usage Hint | （空欄でOK） |

3. 「Save」をクリック

### 5-3. アプリをワークスペースにインストールする

1. 左メニューの「Install App」（または「OAuth & Permissions」）を開く
2. 「Install to Workspace」をクリックし、内容を確認して「許可する」

### 5-4. 使ってみる

Slack の好きなチャンネル（または DM 自分宛）で、

```
/roulette
```

と入力して送信すれば、ランダムなトピックが表示されます 🎉

---

## 6. トラブルシューティング

- **「このアプリは応答していません」と出る**
  → Vercel の URL が間違っていないか確認してください。
    末尾が `/api/roulette` になっている必要があります。

- **コマンドを打っても何も起きない**
  → Slack App の Slash Commands 設定画面で、Request URL が正しく保存されているか確認。
    また、ワークスペースへのインストール（5-3）が完了しているか確認してください。

- **コードを修正したい**
  → ローカルで `api/roulette.js` を編集 → `git add . && git commit -m "update" && git push`
    するだけで、Vercel が自動的に再デプロイしてくれます（GitHub 連携済みのため）。

- **topics や hints の中身を増やしたい**
  → `api/roulette.js` 内の `topics` 配列や `hints` 配列に、
    既存と同じ書式で項目を追加するだけで反映されます。

---

## 7. （任意・推奨）セキュリティについて

現在の構成は最小限のもので、誰でも Request URL に POST すれば
メッセージを取得できる状態です。個人利用や小規模チームであれば
通常は問題になりませんが、より厳密にしたい場合は
Slack の「Signing Secret」を使ったリクエスト検証を追加することをおすすめします。
（`SLACK_SIGNING_SECRET` を Vercel の環境変数に設定し、
`api/roulette.js` 内でリクエストヘッダーの署名を検証する処理を追加する形になります。
必要であれば追加実装も可能です。）
