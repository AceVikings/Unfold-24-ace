import { useEffect, useState } from "react";
import { useOktoUser } from "../../context/OktoUserContext";
import { BiDollar } from "react-icons/bi";
import { AiOutlineFund } from "react-icons/ai";
import { RiExchangeDollarLine } from "react-icons/ri";
import { Link } from "react-router-dom";
const index = () => {
  const [userPortfolios, setUserPortfolios] = useState<any[]>([]);
  const { auth_token } = useOktoUser();
  const getPortfolios = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND}/api/portfolios`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
      }
    );

    const data = await response.json();
    console.log(data.portfolios);
    setUserPortfolios(data.portfolios);
  };
  useEffect(() => {
    if (!auth_token) {
      return;
    }
    getPortfolios();
  }, [auth_token]);
  return (
    <div className="bg-slate-700  h-screen overflow-y-scroll  items-start w-screen text-white flex flex-col pt-14 pb-5 px-2">
      <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userPortfolios.map((portfolio, index) => (
          <div
            key={index}
            className="bg-slate-800 mx-auto rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{portfolio.name}</h2>
              <span className="bg-blue-500 px-2 py-1 rounded-full text-sm">
                {portfolio.currency}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BiDollar className="text-green-400 text-xl" />
                <div>
                  <p className="text-gray-400 text-sm">Initial Investment</p>
                  <p className="font-medium">
                    ${portfolio.initial_investment.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AiOutlineFund className="text-blue-400 text-xl" />
                <div>
                  <p className="text-gray-400 text-sm">Risk Appetite</p>
                  <p className="font-medium">
                    {portfolio.risk_appetite || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RiExchangeDollarLine className="text-purple-400 text-xl" />
                <div>
                  <p className="text-gray-400 text-sm">Investment Strategy</p>
                  <p className="font-medium">
                    {portfolio.investment_strategy || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <Link to={"/detail"}>
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md transition-colors">
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>

      {userPortfolios.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          No portfolios found. Create your first portfolio to get started.
        </div>
      )}
    </div>
  );
};

export default index;
