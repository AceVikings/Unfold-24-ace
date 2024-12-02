const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const verifyRoute = require("./routes/verify");
const { ChatOpenAI } = require("@langchain/openai");
const connectDB = require("./config/db");
const User = require("./models/usermodel");
const jwt = require("jsonwebtoken");
const fs = require("fs");

dotenv.config();
const app = express();
const PORT = 3248;
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
let currentIndex = 1000;

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;
const WEB_URL = "https://zsv59k8c-5174.inc1.devtunnels.ms/";

const chatOpenAI = new ChatOpenAI({
  apiKey: process.env.OPENAI_KEY,
  model: "gpt-4o-mini",
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/verify", verifyRoute);

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

app.post("/api/create/chat", async (req, res) => {
  const { message, history } = req.body;
  console.log("Request Body", JSON.stringify(req.body));
  // const userMessage = new HumanMessage({ text: message.text });
  const chat = await chatOpenAI.invoke([
    {
      role: "system",
      content: `You are a Portfolio manager bot and you are here to gather information about the user's investment 
      strategy and risk appetite, continue the conversation with the user till you get the response for
      the following questions. 1. What is your risk appetite? 2. Are you looking to invest for growth bullishly or hedge against the market bearishly?
      When you have received these two responses, you can end the conversation by thanking the user for their time. Be conise with your questions. 
      If it's your last message, at the end of the final message use the token "ENDING" followed by a json object with the user's responses in the following format
      {"risk_appetite": "Degen/Conservative", "investment_strategy": "Growth/Hedge}"`,
    },
    {
      role: "system",
      content: `Here's the conversation history you've had with the user: ${history}`,
    },
    {
      role: "user",
      content: message,
    },
  ]);
  return res.json({ data: chat.content });
});

app.post("/api/create", async (req, res) => {
  const { appetite, strategy, portfolio_name, initial_investment, currency } =
    req.body;

  console.log(appetite, strategy, portfolio_name, initial_investment, currency);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }
  // Remove 'Bearer ' prefix and get token
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.decode(token);
  const user = await User.findOne({ uid: decodedToken.user_id });
  if (!user) {
    const newUser = new User({
      uid: decodedToken.user_id,
      portfolios: [
        {
          name: portfolio_name,
          risk_appetite: appetite,
          investment_strategy: strategy,
          initial_investment: initial_investment,
          currency: currency,
        },
      ],
    });
    await newUser.save();
    console.log("User created successfully");
  } else {
    const userPortfolios = user.portfolios;

    userPortfolios.push({
      name: portfolio_name,
      risk_appetite: appetite,
      investment_strategy: strategy,
      initial_investment: initial_investment,
      currency: currency,
    });

    user.portfolios = userPortfolios;
    await user.save();
  }
  return res.json({ message: "Portfolio created successfully" });
});

app.get("/api/portfolios", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }
  // Remove 'Bearer ' prefix and get token
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.decode(token);
  const user = await User.findOne({ uid: decodedToken.user_id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ portfolios: user.portfolios });
});

app.get("/api/stats", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }
  // Remove 'Bearer ' prefix and get token
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.decode(token);
  const user = await User.findOne({ uid: decodedToken.user_id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const portfolios = user.portfolios;
  let totalInvestment = 0;
  let totalValue = 0;
  for (const portfolio of portfolios) {
    totalInvestment += portfolio.initial_investment;
    totalValue += portfolio.current_value || portfolio.initial_investment;
  }
  return res.json({
    totalInvestment,
    totalValue,
    portfoliosCreated: portfolios.length,
  });
});

app.get("/api/crypto-price-action", async (req, res) => {
  const { appetite, strategy } = req.query;
  const data = fs.readFileSync("cryptoPrices.json");
  const prices = JSON.parse(data);
  // appetite = "Conservative";
  // strategy = "Bullish";
  // Ensure we don't go out of bounds
  if (currentIndex + 20 > prices.length) {
    currentIndex = 0; // Reset to start if we reach the end
  }

  const selectedPrices = prices.slice(currentIndex, currentIndex + 20);
  currentIndex += 20;

  const chat = await chatOpenAI.invoke([
    {
      role: "system",
      content: `Based on the user's risk appetite ("Conservative") and investment strategy ("Bullish"), here are the current price actions for the next 20 ticks. Please note that these are simulated prices and not real-time data. ${selectedPrices}
      Given that the token itself was bought at ${"46000"} and the current price is ${
        selectedPrices[selectedPrices.length - 1].price
      }. Given the current trend that you see, would you like to hold, sell or buy more? Remember that the investor would like to take small profits and has low appetite for risk, reply with single word "Hold", "Sell" or "Buy"`,
    },
  ]);
  console.log(chat.content);
  return res.json({ data: selectedPrices, position: chat.content });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// RISK APPETITE - Degen/Conservative
// INVESTMENT STRATEGY - Value/Growth
