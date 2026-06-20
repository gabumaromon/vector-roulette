// api/roulette.js
//
// Slack Slash Command "/roulette" のエンドポイント。
// Vercel の Serverless Function としてデプロイされ、
// Slack からの POST リクエストを受け取ってトピックをランダムに返します。

// ---------------------------------------------
// 1. データ定義
// ---------------------------------------------

// practice の内部キー → Slack に表示するラベル（絵文字付き）
const practiceLabels = {
  recommendation: "⭐ Recommendation",
  futurePlans: "🗓 Wishes & Future Plans",
  opinion: "💭 Opinion",
  feelings: "😊 Feelings & Experiences",
  complaints: "😣 Complaints & Problems",
  advice: "🤝 Advice & Encouragement",
  personality: "👤 Personality",
  likesDislikes: "❤️ Likes & Dislikes",
  agreeDisagree: "⚖️ Agree or Disagree",
};

// 行き詰まったときのヒント一覧
const hints = [
  "メイン・理由・エピソードを3秒で出す（日本語可）",
  "簡単な英語で表現する。録音もおすすめ",
  "加工文を入れる余地を探す",
  "話しながら Actually / I mean で言い換える",
  "メインだけ先に英語で言ってみる",
  "理由は1つだけでもOK",
  "具体的なエピソードを1つ足す",
  "完璧な文より、止まらず話すことを優先する",
];

// トピック一覧（topic と、それに紐づく practices のキー配列）
const topics = [
  { topic: "friends", practices: ["opinion", "feelings", "personality"] },
  { topic: "family", practices: ["opinion", "feelings", "personality"] },
  { topic: "Vancouver", practices: ["opinion", "recommendation", "feelings", "futurePlans"] },
  { topic: "Japan", practices: ["opinion", "recommendation", "feelings", "complaints"] },
  { topic: "cafes", practices: ["recommendation", "likesDislikes", "opinion"] },
  { topic: "Japanese food", practices: ["opinion", "recommendation", "likesDislikes"] },
  { topic: "pets", practices: ["feelings", "futurePlans", "likesDislikes"] },
  { topic: "schools", practices: ["opinion", "feelings", "agreeDisagree"] },
  { topic: "Japanese people", practices: ["opinion", "personality", "feelings"] },
  { topic: "weekends", practices: ["futurePlans", "likesDislikes", "advice"] },
  { topic: "Canada", practices: ["opinion", "feelings", "recommendation"] },
  { topic: "USA", practices: ["opinion", "feelings"] },
  { topic: "hobbies", practices: ["recommendation", "feelings", "likesDislikes", "advice"] },
  { topic: "food", practices: ["futurePlans", "recommendation", "likesDislikes"] },
  { topic: "video games", practices: ["likesDislikes", "opinion"] },
  { topic: "coffee", practices: ["opinion", "likesDislikes", "recommendation"] },
  { topic: "drinking", practices: ["opinion", "likesDislikes"] },
  { topic: "safety", practices: ["opinion", "advice"] },
  { topic: "winter", practices: ["futurePlans", "feelings", "likesDislikes"] },
  { topic: "spring", practices: ["futurePlans", "feelings", "likesDislikes"] },
  { topic: "summer", practices: ["futurePlans", "feelings", "likesDislikes", "agreeDisagree"] },
  { topic: "autumn", practices: ["futurePlans", "feelings", "likesDislikes"] },
  { topic: "hometown", practices: ["recommendation", "feelings"] },
  { topic: "sports", practices: ["opinion", "recommendation", "complaints", "likesDislikes"] },
  { topic: "music", practices: ["feelings", "futurePlans", "advice", "likesDislikes"] },
  { topic: "movies", practices: ["recommendation", "feelings", "advice", "likesDislikes", "agreeDisagree"] },
  { topic: "books", practices: ["recommendation", "feelings", "advice", "likesDislikes", "agreeDisagree"] },
  { topic: "drug stores", practices: ["recommendation", "opinion"] },
  { topic: "convenience stores", practices: ["recommendation", "opinion"] },
  { topic: "smartphones", practices: ["opinion", "agreeDisagree"] },
  { topic: "shopping", practices: ["futurePlans", "likesDislikes"] },
  { topic: "English", practices: ["complaints", "feelings"] },
  { topic: "winter sports", practices: ["futurePlans", "recommendation", "likesDislikes"] },
  { topic: "parties", practices: ["feelings", "likesDislikes"] },
  { topic: "health", practices: ["complaints", "advice"] },
  { topic: "Japanese companies", practices: ["opinion", "complaints"] },
  { topic: "cooking", practices: ["recommendation", "likesDislikes"] },
  { topic: "marriage", practices: ["opinion", "agreeDisagree"] },
  { topic: "news", practices: ["opinion"] },
  { topic: "sleep", practices: ["complaints", "advice"] },
  { topic: "Stanley Park", practices: ["recommendation", "feelings"] },
  { topic: "ideal boss / leader", practices: ["personality", "opinion"] },
  { topic: "English Bay", practices: ["recommendation", "feelings"] },
  { topic: "Gastown", practices: ["recommendation", "feelings"] },
  { topic: "events", practices: ["recommendation", "futurePlans"] },
  { topic: "sightseeing", practices: ["recommendation", "advice", "futurePlans"] },
  { topic: "downtown", practices: ["recommendation", "opinion"] },
  { topic: "TV", practices: ["likesDislikes", "agreeDisagree"] },
  { topic: "vacation", practices: ["futurePlans", "feelings", "advice", "opinion"] },
  { topic: "travelling", practices: ["futurePlans", "feelings"] },
  { topic: "lottery", practices: ["futurePlans", "opinion"] },
  { topic: "indoor vs outdoor", practices: ["opinion", "agreeDisagree", "likesDislikes"] },
  { topic: "dream", practices: ["futurePlans", "feelings"] },
  { topic: "surprise", practices: ["feelings"] },
  { topic: "culture", practices: ["opinion", "feelings"] },
  { topic: "weather", practices: ["opinion", "feelings"] },
  { topic: "junk food", practices: ["recommendation", "likesDislikes", "opinion"] },
  { topic: "New Year", practices: ["futurePlans", "feelings"] },
  { topic: "Christmas", practices: ["futurePlans", "feelings"] },
  { topic: "Halloween", practices: ["futurePlans", "feelings"] },
  { topic: "Vector", practices: ["complaints", "feelings"] },
  { topic: "stress", practices: ["complaints", "advice"] },
  { topic: "Covid-19", practices: ["opinion", "complaints"] },
  { topic: "this year", practices: ["futurePlans", "feelings"] },
  { topic: "amusement park", practices: ["futurePlans", "feelings", "likesDislikes"] },
  { topic: "childhood", practices: ["feelings", "complaints"] },
  { topic: "school days", practices: ["feelings", "complaints"] },
  { topic: "cats vs dogs", practices: ["opinion", "agreeDisagree"] },
  { topic: "living alone", practices: ["opinion", "complaints", "advice"] },
  { topic: "problems", practices: ["complaints", "advice"] },
  { topic: "time vs money", practices: ["opinion", "agreeDisagree"] },
  { topic: "restaurants", practices: ["recommendation", "likesDislikes"] },
  { topic: "exercise", practices: ["recommendation", "advice", "likesDislikes"] },
  { topic: "while I'm in Vancouver", practices: ["futurePlans"] },
  { topic: "Vancouver vs Japan", practices: ["feelings", "opinion"] },
  { topic: "disappointing story", practices: ["feelings", "complaints"] },
  { topic: "amazing story", practices: ["feelings"] },
  { topic: "regrets", practices: ["complaints", "feelings"] },
  { topic: "the busiest time in your life", practices: ["complaints", "feelings"] },
  { topic: "something you don't like", practices: ["complaints", "likesDislikes"] },
  { topic: "something you are not good at", practices: ["complaints", "personality"] },
  { topic: "introvert vs extrovert", practices: ["opinion", "personality", "agreeDisagree"] },
  { topic: "paper books vs e-books", practices: ["advice", "agreeDisagree"] },
  { topic: "coworkers", practices: ["personality", "feelings"] },
  { topic: "boss", practices: ["personality", "opinion"] },
  { topic: "teacher", practices: ["personality", "feelings"] },
  { topic: "classmates", practices: ["personality", "feelings"] },
  { topic: "teammates", practices: ["personality", "feelings"] },
  { topic: "roommates", practices: ["personality", "complaints"] },
  { topic: "your personality", practices: ["personality"] },
  { topic: "your weaknesses", practices: ["personality"] },
  { topic: "your strengths", practices: ["personality"] },
  { topic: "mentors", practices: ["personality", "feelings"] },
  { topic: "people in Vancouver", practices: ["personality", "opinion"] },
  { topic: "people in Japan", practices: ["personality", "opinion"] },
  { topic: "least favourite things", practices: ["likesDislikes"] },
  { topic: "favourite things", practices: ["likesDislikes"] },
  { topic: "impressive memories", practices: ["likesDislikes", "feelings"] },
  { topic: "apps", practices: ["likesDislikes", "opinion"] },
  { topic: "YouTube", practices: ["likesDislikes", "agreeDisagree"] },
  { topic: "Disney vs Ghibli", practices: ["agreeDisagree"] },
  { topic: "part-time jobs during high school", practices: ["agreeDisagree", "opinion"] },
  { topic: "smartphones for children", practices: ["agreeDisagree", "opinion"] },
  { topic: "movies vs books", practices: ["agreeDisagree"] },
  { topic: "school lunch system", practices: ["agreeDisagree", "opinion"] },
  { topic: "English education in Japan", practices: ["agreeDisagree", "opinion"] },
  { topic: "who is happier, men or women?", practices: ["agreeDisagree", "opinion"] },
  { topic: "SNS", practices: ["agreeDisagree", "opinion"] },
  { topic: "AI", practices: ["agreeDisagree", "opinion"] },
];

// ---------------------------------------------
// 2. ユーティリティ関数
// ---------------------------------------------

// 配列からランダムに1件選ぶ
function pickOne(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 配列からランダムに count 件、重複なしで選ぶ（シャッフルして先頭から取る方式）
function pickRandomSubset(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

// 2〜5 の範囲でランダムな整数を返す（min, max は両端を含む）
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Slack に送るメッセージ本文を組み立てる
function buildSlackMessage() {
  // 1. topics からランダムに1件選択
  const selected = pickOne(topics);

  // 2. practices からランダムで1〜2件選択
  //    practices が1件しかない場合は1件だけ表示
  const practiceCount =
    selected.practices.length <= 1 ? 1 : randomInt(1, 2);
  const chosenPracticeKeys = pickRandomSubset(
    selected.practices,
    practiceCount
  );
  const practiceText = chosenPracticeKeys
    .map((key) => practiceLabels[key] || key)
    .join("\n");

  // 3. hints からランダムで3〜5件選択
  const hintCount = randomInt(3, Math.min(5, hints.length));
  const chosenHints = pickRandomSubset(hints, hintCount);
  const hintText = chosenHints.map((h) => `• ${h}`).join("\n");

  // Slack に返すメッセージ本文（mrkdwn 形式）
  const text = [
  "🎲 *Today's Topic*",
  "",
  `*${selected.topic}*`,
  "",
  "━━━━━━━━━━",
  "*Suggested Practice*",
  "",
  practiceText,
  "",
  "━━━━━━━━━━",
  "💡 *Hints if you get stuck*",
  "",
  hintText,
].join("\n");

  return text;
}

// ---------------------------------------------
// 3. Vercel Serverless Function 本体
// ---------------------------------------------

module.exports = async function handler(req, res) {
  // Slash Command は POST で飛んでくる。それ以外は弾く。
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // （任意）Slack Signing Secret によるリクエスト検証を入れたい場合は
  // ここで req のヘッダーと body を使って検証する。
  // 今回はシンプルさを優先し、検証なしの最小構成にしている。
  // 本番運用で公開チャンネルに置く場合は、SLACK_SIGNING_SECRET を
  // 環境変数に設定し、公式ドキュメントの手順で署名検証を追加することを推奨。

  try {
    const text = buildSlackMessage();

    // response_type: "in_channel" にすると、コマンドを打った本人だけでなく
    // チャンネル全体に見えるメッセージとして投稿される。
    // 自分だけに見せたい場合は "ephemeral" に変更する。
    res.status(200).json({
      response_type: "in_channel",
      text,
    });
  } catch (err) {
    console.error("roulette error:", err);
    res.status(200).json({
      response_type: "ephemeral",
      text: "⚠️ エラーが発生しました。もう一度試してください。",
    });
  }
};
