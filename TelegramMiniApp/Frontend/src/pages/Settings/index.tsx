import { useEffect, useState } from "react";
import { useOktoUser } from "../../context/OktoUserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { FiCopy } from "react-icons/fi";
import { formatEther, JsonRpcProvider } from "ethers";
const index = () => {
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const { setAuthToken, auth_token } = useOktoUser();
  const [otp, setOtp] = useState("");
  const [userWallets, setUserWallets] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleSendEmailOTP = async () => {
    try {
      const response = await fetch(
        "https://sandbox-api.okto.tech/api/v1/authenticate/email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": import.meta.env.VITE_PUBLIC_OKTO_KEY,
            "User-Agent": "PostmanRuntime/7.37.3",
            Referer: "https://www.xyz.com",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      console.log(data.data.token);
      setOtpToken(data.data.token);
      toast.success("OTP sent to your email");
    } catch (e) {
      console.log(e);
    }
  };

  const getWallet = async () => {
    console.log("Creating");
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
    console.log(response.ok);
    const data = await response.json();
    data.data.wallets.map((wallet: any) => {
      console.log(wallet.address);
      getUserBalance(wallet.address);
    });
    setUserWallets(data.data.wallets);
  };

  const handleSubmitOTP = async () => {
    const response = await fetch(
      "https://sandbox-api.okto.tech/api/v1/authenticate/email/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": import.meta.env.VITE_PUBLIC_OKTO_KEY,
          "User-Agent": "PostmanRuntime/7.37.3",
          Referer: "https://www.xyz.com",
        },
        body: JSON.stringify({ email, otp, token: otpToken }),
      }
    );
    if (!response.ok) {
      toast.error("Invalid OTP");
      setOtp("");
      return;
    }
    const data = await response.json();
    setAuthToken(data.data.auth_token);
    localStorage.setItem("auth_token", data.data.auth_token);
    setOtpToken("");
    setOtp("");
    navigate("/");
  };

  const handleLogout = async () => {
    const response = await fetch(
      "https://sandbox-api.okto.tech/api/v1/logout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": import.meta.env.VITE_PUBLIC_OKTO_KEY,
          Authorization: `Bearer ${auth_token}`,
          "User-Agent": "PostmanRuntime/7.37.3",
          Referer: "https://www.xyz.com",
        },
      }
    );
    if (response.ok) {
      setAuthToken("");
      localStorage.removeItem("auth_token");
      navigate("/");
      return;
    }

    toast.error("Failed to logout");
  };

  const getUserBalance = async (address: string) => {
    const provider = new JsonRpcProvider(
      "https://rpc-amoy.polygon.technology/"
    );
    const balance = await provider.getBalance(address);
    setUserBalance([...userBalance, formatEther(balance)]);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (auth_token) {
      getWallet();
    }
  }, [auth_token]);
  return (
    <div className="bg-slate-700 h-screen items-start w-screen text-white flex flex-col pt-14 pb-5 px-2">
      {auth_token ? (
        <>
          <h2 className="text-xl font-semibold text-white mb-6">
            Connected Wallets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userWallets.map((wallet, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* {networkIcons[wallet.network_name]} */}
                    <span className="font-semibold">{wallet.network_name}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      wallet.success
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {wallet.success ? "Connected" : "Error"}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between bg-slate-900 rounded-lg p-3 cursor-pointer hover:bg-slate-900/80"
                  onClick={() => {
                    navigator.clipboard.writeText(wallet.address);
                    toast.success("Address copied to clipboard!");
                  }}
                >
                  <span className="font-mono text-sm text-gray-300">
                    {truncateAddress(wallet.address)}
                  </span>
                  <FiCopy className="text-gray-400 hover:text-white transition-colors" />
                </div>
                <div className="mt-4">
                  <span className="text-gray-400">Balance</span>
                  <p className="text-white">{userBalance[0]} POL</p>
                </div>
              </div>
            ))}
          </div>

          {userWallets.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              No wallets connected. Connect a wallet to get started.
            </div>
          )}
          <button
            onClick={() => handleLogout()}
            className="flex items-center mt-12 gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <BiLogOut className="text-lg" />
            <span>Logout</span>
          </button>
        </>
      ) : otpToken !== "" ? (
        <div className="flex flex-col items-center h-full justify-center w-full">
          <input
            className="p-1 bg-slate-800 px-2 rounded-md"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={() => handleSubmitOTP()}
            className="text-white bg-slate-800 mt-2 p-2 rounded-md"
          >
            Authenticate
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center h-full justify-center w-full">
          <input
            type="email"
            className="p-1 bg-slate-800 px-2 rounded-md"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={() => handleSendEmailOTP()}
            className="text-white bg-slate-800 mt-2 p-2 rounded-md"
          >
            Authenticate with Okto
          </button>
        </div>
      )}
    </div>
  );
};

export default index;
