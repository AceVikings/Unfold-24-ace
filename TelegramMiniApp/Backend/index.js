const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = 3248;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;
const WEB_URL = "https://unfold-24-ace.onrender.com";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/bot", async (req, res) => {
  console.log("Request Body", JSON.stringify(req.body));
  const message = req.body.message;

  if (message && message.text === "/start") {
    const responseText = `Welcome to Ez Portfolio Manager Mini App. You can use this automatically manage your portfolio.`;

    try {
      const inlineKeyboardMarkup = {
        inline_keyboard: [
          [
            {
              text: "Start Now!",
              web_app: { url: `${WEB_URL}?startapp=fullscreen` },
            },
          ],
        ],
      };

      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: responseText,
          parse_mode: "Markdown",
          reply_markup: JSON.stringify(inlineKeyboardMarkup),
        }),
      });
      res.status(200).send("Success");
    } catch (error) {
      console.error("Error", error);
      res.status(500).send("Error");
    }
  } else {
    console.log("Invalid Request");
    res.status(200).send("No action taken");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
