import { useEffect } from "react";

import "./App.css";
import { useWallets } from "@privy-io/react-auth";
function App() {
  const { wallets } = useWallets();
  useEffect(() => {
    console.log(wallets);
  }, []);
  return <div></div>;
}

export default App;
