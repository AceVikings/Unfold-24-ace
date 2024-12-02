import { useEffect, useState } from "react";
import { useOktoUser } from "../../context/OktoUserContext";
import { toast } from "react-toastify";
import { ethers, JsonRpcProvider, parseEther } from "ethers";
import abi from "../../data/abi.json";
const index = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chat, setChat] = useState<
    {
      message: string;
      sender: string;
    }[]
  >([]);
  const [isConversationEnd, setIsConversationEnd] = useState(false);
  const [userWallets, setUserWallets] = useState<any[]>([]);
  const [result, setResult] = useState({
    risk_appetite: "",
    investment_strategy: "",
  });
  const [portfolioName, setPortfolioName] = useState("");
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("USDC");
  const { auth_token } = useOktoUser();
  useEffect(() => {
    if (!auth_token) {
      return;
    }
    getWallet();
  }, [auth_token]);
  const getWallet = async () => {
    const response = await fetch(
      "https://sandbox-api.okto.tech/api/v1/wallet",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": import.meta.env.VITE_PUBLIC_OKTO_KEY,
          Authorization: `Bearer ${auth_token}`,
          "User-Agent": "PostmanRuntime/7.37.3",
          Referer: "https://www.xyz.com",
        },
      }
    );
    const data = await response.json();
    setUserWallets(data.data.wallets);
  };
  const getChat = async () => {
    if (!auth_token) {
      toast.error("You are not logged in");
      return;
    }
    if (!userMessage) {
      return;
    }
    setChat((prev) => [...prev, { sender: "user", message: userMessage }]);
    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND}/api/create/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: JSON.stringify(chat),
        }),
      }
    );

    const data = await response.json();
    setUserMessage("");

    if (data.data.split("ENDING").length > 1) {
      setChat([]);
      setIsConversationEnd(true);
      setChat((prev) => [
        ...prev,
        { sender: "AI", message: data.data.split("ENDING")[0] },
      ]);
      setResult(JSON.parse(data.data.split("ENDING")[1]));
    } else {
      setChat((prev) => [...prev, { sender: "AI", message: data.data }]);
    }
  };

  const createPortfolio = async () => {
    console.log(result);
    const provider = new JsonRpcProvider(
      "https://rpc-amoy.polygon.technology/"
    );
    const iface = new ethers.Interface(abi);
    // const data = iface.encodeFunctionData("addPortfolio", [
    //   [
    //     selectedCurrency === "POL"
    //       ? parseEther(initialInvestment.toString())
    //       : 0,
    //     "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    //     selectedCurrency === "USDC" ? initialInvestment * 10 ** 6 : 0,
    //   ],
    // ]);
    const data = iface.encodeFunctionData("addPortfolio", [
      ["0", "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", "0"],
    ]);
    console.log((initialInvestment * 10 ** 6).toString());
    console.log(userWallets[0].address);
    console.log(data);
    const txResponse = await fetch(
      "https://sandbox-api.okto.tech/api/v1/rawtransaction/execute",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network_name: "POLYGON_TESTNET_AMOY",
          transaction: {
            from: userWallets[0].address,
            to: "0xEea9f969Be81cFFF70a6B68F6146E0A029F7C26E",
            data: data,
            value: parseEther("1").toString(),
          },
        }),
      }
    );
    console.log(txResponse.status);
    const txData = await txResponse.json();
    console.log(txData);
    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND}/api/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify({
          portfolio_name: portfolioName,
          initial_investment: initialInvestment,
          currency: selectedCurrency,
          appetite: result.risk_appetite,
          strategy: result.investment_strategy,
        }),
      }
    );
    if (response.ok) {
      toast.success("Portfolio Created");
    } else {
      toast.error("Failed to create portfolio");
    }
  };
  return (
    <div className="bg-slate-700 h-screen  items-start w-screen text-white flex flex-col pt-14 pb-5 px-2">
      {!isConversationEnd && (
        <>
          <div className="overflow-y-scroll w-full h-full space-y-4 pb-20">
            {chat.map((item, index) => (
              <div
                key={index}
                className={`${
                  item.sender === "user" ? "self-start" : "self-end"
                } p-2 bg-slate-800 rounded-md w-[fit-content]`}
              >
                {item.message}
              </div>
            ))}
          </div>
          <div className="fixed bottom-6 left-0 px-2 flex items-center justify-center w-full">
            <input
              type="text"
              value={userMessage}
              onSubmit={() => getChat()}
              onChange={(e) => setUserMessage(e.target.value)}
              className="bg-slate-800  text-white w-[98vw] p-2 rounded-md mt-auto"
              placeholder="Say something..."
            />
            <button
              onClick={() => getChat()}
              className="bg-slate-800 p-2 rounded-md ml-2"
            >
              Send
            </button>
          </div>
        </>
      )}
      {isConversationEnd && (
        <div className="flex flex-col items-center w-full justify-center h-full">
          <p>Conversation Ended</p>
          <p>Suggested Portfolio:</p>
          <p>Risk Strategy: {result?.risk_appetite}</p>
          <p>Investment Strategy: {result.investment_strategy}</p>
          <input
            onChange={(e) => setPortfolioName(e.target.value)}
            type="text"
            placeholder="Portfolio Name"
            className="bg-slate-800 text-white p-2 rounded-md mt-2"
          />
          <div className="flex">
            <input
              type="number"
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
              placeholder="Initial Investment"
              className="bg-slate-800 text-white p-2 rounded-md mt-2"
            />
            <select
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-slate-800 text-white p-2 rounded-md mt-2"
            >
              <option value="USDC">USDC</option>
              <option value="POL">POL</option>
            </select>
          </div>
          <button onClick={createPortfolio} className="mt-4">
            Create Portfolio
          </button>
          <button
            onClick={() => {
              setChat([]);
              setIsConversationEnd(false);
            }}
            className="bg-slate-800 p-2 rounded-md mt-2"
          >
            Start New Conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default index;
