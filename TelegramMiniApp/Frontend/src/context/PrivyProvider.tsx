"use client";
import { defineChain } from "viem";

import { ReactNode, useCallback, useEffect } from "react";
import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { useUserDetails } from "./UserAuthContext";
import { ethers } from "ethers";
import Cookies from "js-cookie";
import api from "../api";

const Capx = defineChain({
  id: Number(import.meta.env.VITE_PUBLIC_CAPX_CHAIN_ID),
  name: import.meta.env.VITE_PUBLIC_CAPX_CHAIN_NETWORK_NAME,
  network: import.meta.env.VITE_PUBLIC_CAPX_CHAIN_NETWORK_NAME,
  logoUrl: "https://internal.app.capx.fi/favicon.png",
  nativeCurrency: {
    decimals: 18,
    name: "ether",
    symbol: import.meta.env.VITE_PUBLIC_CAPX_CHAIN_CURRENCY,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_PUBLIC_CAPX_CHAIN_RPC_URL],
      webSocket: [import.meta.env.VITE_PUBLIC_CAPX_WEB_SOCKET_URL],
    },
    public: {
      http: [import.meta.env.VITE_PUBLIC_CAPX_CHAIN_RPC_URL],
      webSocket: [import.meta.env.VITE_PUBLIC_CAPX_WEB_SOCKET_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: import.meta.env.VITE_PUBLIC_CAPX_CHAIN_EXPLORE_URL,
    },
  },
});
interface PrivyWrapperProps {
  children: ReactNode;
}
const PrivyWrapper = ({ children }: PrivyWrapperProps) => {
  const { txDetails, userDetails, getUserDetails } = useUserDetails();
  const { wallets } = useWallets();
  const { user, authenticated, createWallet } = usePrivy();

  const mintXId = async () => {
    const startTime = performance.now();
    if (Object.keys(txDetails).length > 0) {
      try {
        await api.post("/wallet/faucet");
      } catch (error) {
        console.log(error, "request faucet error");
      }
      try {
        const wallet = wallets.find(
          (wallet) => wallet.walletClientType === "privy"
        );
        await wallet?.switchChain(import.meta.env.VITE_PUBLIC_CAPX_CHAIN_ID);
        let providerInstance = await wallet?.getEthersProvider();
        const signer = providerInstance?.getSigner();
        const contract = new ethers.Contract(
          txDetails.contract_address,
          txDetails.contract_abi,
          signer
        );
        const txResponse = await signer?.sendTransaction({
          to: txDetails.contract_address,
          data: contract.interface.encodeFunctionData("createProfile", [
            txDetails.input_params._profileParams,
            txDetails.input_params._profileData,
          ]),
          chainId: 10245,
        });

        const recipt = await txResponse?.wait();
        const endTime = performance.now();
        console.log(endTime - startTime, "XID transaction time");
        console.log(recipt, "mint tx recipt");
        await getUserDetails();
        return true;
      } catch (error) {
        console.log(error, "mint transaction error");
        return false;
      }
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    (async () => {
      if (txDetails && userDetails?.version < 3 && wallets.length > 0) {
        const isMinted = await mintXId();
        if (!isMinted) {
          timer = setInterval(async () => {
            const isXIdMinted = await mintXId();
            if (isXIdMinted) {
              clearInterval(timer);
            }
          }, 300000);
        }
      }
    })();

    return () => clearInterval(timer);
  }, [Object.keys(txDetails).length, wallets.length]);

  useEffect(() => {
    (async () => {
      if (authenticated) {
        if (!user?.wallet) {
          await createWallet();
        }
      }
    })();
  }, [authenticated]);
  return <>{wallets.length > 0 ? children : <p>Loading...</p>}</>;
};

interface PrivyWalletProviderProps {
  children: ReactNode;
}
export default function PrivyWalletProvider({
  children,
}: PrivyWalletProviderProps) {
  const { isUserCreated } = useUserDetails();

  const getCustomToken = useCallback(async () => {
    if (isUserCreated) {
      const idToken = Cookies.get("access_token");
      return idToken;
    } else {
      return undefined;
    }
  }, [isUserCreated]);

  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PUBLIC_PRIVY_APP_ID}
      config={{
        supportedChains: [Capx],
        defaultChain: Capx,
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          logo: "https://internal.app.capx.fi/favicon.png",
          showWalletLoginFirst: false,
        },
        customAuth: {
          isLoading: isUserCreated,
          getCustomAccessToken: getCustomToken,
        },
      }}
    >
      <PrivyWrapper>{children}</PrivyWrapper>
    </PrivyProvider>
  );
}
