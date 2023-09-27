const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;

// Test関数
const ROUTE_NAME = "つくばTX";//仮の路線
const DEPARTURE_TIME_PLACEHOLDER = "06:40"; // 仮の時刻

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルートエンドポイント
app.get("/", (req, res) => {
  res.sendStatus(200);
});

// Webhookエンドポイント
app.post("/webhook", function (req, res) {
  // 応答を早めに返す
  res.send("HTTP POST request sent to the webhook URL!");

  if (req.body && req.body.events[0].type === "message") {
    const userInput = req.body.events[0].message.text;
    const timePattern = /^([0-1]?\d|2[0-3]):([0-5]\d)$/;

    if (timePattern.test(userInput)) {
      const matches = userInput.match(timePattern);
      const hours = parseInt(matches[1], 10);
      const minutes = parseInt(matches[2], 10);
      const departureTime = `${hours}:${minutes}`;//ここで時間と分を分離したものを一つの変数に再導入：仮のものです。：

      //ここでSQLliteと繋げる 齊藤　飯塚頼んだ。
      //からの配列を作る
      const rows = [];
      rows[0] = 13;  // 1番目の数値を8に変更する
      rows[1] = 08;  // 3番目の数値を8に変更する




      
　　　　　　　　　　　　//ここからメッセージの制御になる
      //const sqlDone = rows; //お守りです。
      //ここでsqlとjsを繋げてフロントチームがわかりやすくする。変数名は適当なのでrowsの部分のみ変更
      const sqlDoneMinute = rows[0]; // rowsの1番目の要素を取得
      const sqlDoneHour = rows[1];  // rowsの2番目の要素を取得
     
      const dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [{
          type: "text",
          text: `路線名：${ROUTE_NAME}\n出発時刻：${sqlDoneHour}:${sqlDoneMinute}`//最終的にuser側が見ることができる文章はここ
        }],
      });

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      };

      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
      };

      const request = https.request(webhookOptions);

      request.on("error", (err) => {
        console.error(err);
      });

      request.write(dataString);
      request.end();

    } else {
      console.error("Invalid time format provided by the user.");//hh:mmに合わないテキストが来たらConsoleに文が提示
    }
  }
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

