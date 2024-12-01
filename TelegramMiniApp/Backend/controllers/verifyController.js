const crypto = require("crypto");

const verifyInitData = async (req, res) => {
  try {
    const { initData } = req.body;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");

    urlParams.delete("hash");
    urlParams.sort();
    let dataCheckString = "";

    for (const [key, value] of urlParams) {
      dataCheckString += `${key}=${value}\n`;
    }

    const secretKey = crypto
      .createHash("sha256")
      .update(BOT_TOKEN)
      .digest("hex");
    const calculateHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (hash !== calculateHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid InitData",
      });
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    urlParams.append("client_id", clientId);
    urlParams.sort();

    dataCheckString = "";

    for (const [key, value] of urlParams) {
      dataCheckString += `${key}=${value}\n`;
    }

    dataCheckString = dataCheckString.slice(0, -1);

    const centralSecret = crypto
      .createHmac("sha256", "webAppData")
      .update(clientSecret);

    const centralHash = crypto
      .createHmac("sha256", centralSecret.digest())
      .update(dataCheckString)
      .digest("hex");

    urlParams.append("hash", centralHash);

    return res.json({
      success: true,
      initData: urlParams.toString(),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { verifyInitData };
