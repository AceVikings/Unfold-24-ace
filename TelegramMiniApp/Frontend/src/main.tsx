import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import PrivyWalletProvider from "./context/PrivyProvider.js";
import UserAuthContext from "./context/UserAuthContext.tsx";
import { init } from "@telegram-apps/sdk-react";

// Initialize the package.
init();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserAuthContext>
      <PrivyWalletProvider>
        <App />
      </PrivyWalletProvider>
    </UserAuthContext>
  </StrictMode>
);
