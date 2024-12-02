import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const Index = () => {
  const [currentData, setCurrentData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);
  // Format data for display
  const formatData = (data: any) => {
    return data?.map((item: any) => ({
      ...item,
      price: parseFloat(item.price),
      formattedTime: item.timestamp,
    }));
  };

  useEffect(() => {
    getPriceData();
  }, []);

  const getPriceData = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND}/api/crypto-price-action`
    );
    const data = await response.json();
    console.log(data);
    setCurrentData(formatData(data.data));
    setCurrentPosition(data.position);
  };

  const startSimulation = async () => {
    setInterval(async () => {
      getPriceData();
    }, 2000);
  };

  return (
    <div className="bg-slate-700 h-screen w-full py-20 p-6">
      <div className="bg-slate-800 rounded-lg p-4 h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData}>
            <XAxis
              dataKey="formattedTime"
              stroke="#fff"
              domain={["auto", "auto"]}
            />
            <YAxis domain={[35000, 65000]} stroke="#fff" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "0.5rem",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center">
        <button
          onClick={startSimulation}
          className="bg-blue-500 px-4 py-2 rounded-lg mt-4"
        >
          Simulate
        </button>
        <button
          onClick={getPriceData}
          className="bg-blue-500 ml-4 px-4 py-2 rounded-lg mt-4"
        >
          Step
        </button>
        <div className="flex ml-4 flex-col">
          <p>AI Position</p>
          <p>{currentPosition}</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
