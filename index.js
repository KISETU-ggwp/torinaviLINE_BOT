const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;

// Test関数
const ROUTE_NAME = "つくばTX";

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルートエンドポイント
app.get("/", (req, res) => {
  res.sendStatus(200);
});

// Webhookエンドポイント
app.post("/webhook", function(req, res) {
  // 応答を早めに返す
  res.send("HTTP POST request sent to the webhook URL!");

  if (req.body && req.body.events[0].type === "message") {
    const userInput = req.body.events[0].message.text;
    const timePattern = /^([0-1]?\d|2[0-3]):([0-5]\d)$/;

    if (timePattern.test(userInput)) {
      const matches = userInput.match(timePattern);
      const hours = parseInt(matches[1], 10);
      const minutes = parseInt(matches[2], 10);
      const sqlite3 = require('sqlite3').verbose();
      const dbfile = "tx_kitasenju.db";
      const db = new sqlite3.Database(dbfile); // dbの宣言
      const query = "select MIN(depart_hour) as min_hour, depart_minute as min_minute from TX_kitasenju where depart_hour*100+depart_minute > ?*100+?"; // QUERY

      db.all(query, [hours, minutes], function(err, rows) {
        if (err) {
          console.log(err);
        } else {
          const sqlDoneMinute = rows[0].min_minute;
          const sqlDoneHour = rows[0].min_hour;

          const dataString = JSON.stringify({
            replyToken: req.body.events[0].replyToken,
            messages: [{
              type: "text",
              text: `路線名：${ROUTE_NAME}\n出発時刻：${sqlDoneHour}:${sqlDoneMinute}`
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
        }
      });
    } else {
      console.error("Invalid time format provided by the user.");
    }
  }
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
