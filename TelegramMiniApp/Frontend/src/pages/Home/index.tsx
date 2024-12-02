import { useEffect, useState } from "react";
import { useUserDetails } from "../../context/UserAuthContext";
import { useOktoUser } from "../../context/OktoUserContext";
import { Link } from "react-router-dom";
import { BiDollar, BiWallet } from "react-icons/bi";
import { BsGraphUp } from "react-icons/bs";
const index = () => {
  const { userDetails } = useUserDetails();
  const { auth_token } = useOktoUser();
  const [userStats, setUserStats] = useState<any>({});

  const getUserStats = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND}/api/stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    setUserStats(data);
  };

  useEffect(() => {
    if (!auth_token) {
      return;
    }
    getUserStats();
  }, [auth_token]);
  return (
    <div className="bg-slate-700 h-screen w-full py-20 p-6">
      {/* Welcome Section */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white">
          Welcome back,{" "}
          <span className="text-blue-400">{userDetails?.first_name}</span>
        </h1>
      </div>

      {auth_token ? (
        <>
          <h2 className="text-xl font-semibold text-white mb-6">
            Portfolio Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-slate-800 rounded-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <BiDollar className="text-2xl text-green-400" />
                <h3 className="text-gray-400">Net Fund Invested</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                ${userStats.totalInvestment}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <BsGraphUp className="text-2xl text-blue-400" />
                <h3 className="text-gray-400">Net Fund Value</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                ${userStats.totalValue}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <BiWallet className="text-2xl text-purple-400" />
                <h3 className="text-gray-400">Total Funds Created</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {userStats.portfoliosCreated}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-800 rounded-lg p-8 text-center max-w-md mx-auto mt-20">
          <h2 className="text-xl font-semibold text-white mb-4">
            Welcome to Portfolio Manager
          </h2>
          <p className="text-gray-400 mb-6">
            First time here? Authenticate with Okto to start managing your
            portfolio.
          </p>
          <Link
            to="/settings"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Get Started →
          </Link>
        </div>
      )}
    </div>
  );
};

export default index;
