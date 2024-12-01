import { useEffect } from "react";

import "./App.css";
import { useWallets } from "@privy-io/react-auth";
function App() {
  const { wallets } = useWallets();
  useEffect(() => {
    console.log(wallets);
  }, []);
  return (
    <div>
      <h1>Telegram Mini App</h1>
      <p>Wallets: {wallets.length}</p>
    </div>
  );
}

export default App;
