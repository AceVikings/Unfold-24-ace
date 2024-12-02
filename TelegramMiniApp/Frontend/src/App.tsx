import { useEffect } from "react";

import "./App.css";
import { useWallets } from "@privy-io/react-auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Portfolios from "./pages/Portfolios";
import Settings from "./pages/Settings";
import { OktoProvider, BuildType } from "okto-sdk-react";
import { OktoUserProvider } from "./context/OktoUserContext";
import { ToastContainer } from "react-toastify";
import Detail from "./pages/Detail";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const { wallets } = useWallets();
  const OKTO_CLIENT_API_KEY = import.meta.env.OKTO_KEY;
  useEffect(() => {
    console.log(wallets);
  }, []);
  return (
    <OktoProvider apiKey={OKTO_CLIENT_API_KEY} buildType={BuildType.SANDBOX}>
      <OktoUserProvider>
        <ToastContainer />
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/portfolios" element={<Portfolios />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/detail/" element={<Detail />} />
          </Routes>
        </Router>
      </OktoUserProvider>
    </OktoProvider>

    // <div className="">
    //   <h1>Telegram Mini App</h1>
    //   <p>Wallets: {wallets.length}</p>
    // </div>
  );
}

export default App;
