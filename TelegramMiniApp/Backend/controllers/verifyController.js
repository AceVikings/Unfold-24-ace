const { createHmac } = require("crypto");

// POST handler for /api/verify
const verifyInitData = async (req, res) => {
  try {
    const { initData } = req.body; // Parse the request body
    const BOT_TOKEN = process.env.TELEGRAM_API_KEY;

    // Parse initData and generate a hash to compare
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");

    urlParams.delete("hash");
    urlParams.sort();
    let dataCheckString = "";
    for (const [key, value] of urlParams.entries()) {
      dataCheckString += `${key}=${value}\n`;
    }
    dataCheckString = dataCheckString.slice(0, -1);

    // First hash check
    const secret = createHmac("sha256", "WebAppData").update(BOT_TOKEN);
    const calculatedHash = createHmac("sha256", secret.digest())
      .update(dataCheckString)
      .digest("hex");

    if (hash !== calculatedHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid InitData",
      });
    }

    // Continue with the second hash generation
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    urlParams.append("client_id", clientId);
    urlParams.sort();

    dataCheckString = "";
    for (const [key, value] of urlParams.entries()) {
      dataCheckString += `${key}=${value}\n`;
    }
    dataCheckString = dataCheckString.slice(0, -1);

    const centralSecret = createHmac("sha256", "WebAppData").update(
      clientSecret
    );
    const centralHash = createHmac("sha256", centralSecret.digest())
      .update(dataCheckString)
      .digest("hex");
    urlParams.append("hash", centralHash);

    // Return the result
    return res.json({
      success: true,
      initData: urlParams.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { verifyInitData };
