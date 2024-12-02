import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import axios from "axios";
import Cookies from "js-cookie";
import api from "../api";
import { setTokenCookies } from "../utils";

const UserDetailsContext = createContext<UserDetailsContextType>({
  userDetails: {},
  isUserCreated: false,
  txDetails: {},
  getUserDetails: async () => {},
});
interface UserDetailsContextType {
  userDetails: any;
  isUserCreated: boolean;
  txDetails: any;
  getUserDetails: () => Promise<void>;
}
interface UserAuthContextProps {
  children: ReactNode;
}
const UserAuthContext = ({ children }: UserAuthContextProps) => {
  const [userDetails, setUserDetails] = useState({});
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [txDetails, setTxDetails] = useState({});

  const initDataRaw = useLaunchParams()?.initDataRaw;

  const createUser = useCallback(async (initData: any) => {
    const { data: userInfo } = await api.post(
      `/users/auth`,
      {},
      {
        headers: {
          "x-initdata": initData,
        },
      }
    );
    setTokenCookies(
      userInfo?.result.access_token,
      userInfo?.result.refresh_token
    );

    setUserDetails(userInfo?.result?.user);
    console.log("HERE, CREATED");
    setIsUserCreated(true);
    setTxDetails(userInfo?.result?.signup_tx || {});
  }, []);

  const getUserDetails = useCallback(async () => {
    const { data: userInfo } = await api.get("/users");
    setUserDetails(userInfo?.result?.user);
    setIsUserCreated(true);
    console.log("HERE, CREATED");

    setTxDetails(userInfo?.result?.signup_tx || {});
  }, []);

  useEffect(() => {
    (async () => {
      if (initDataRaw) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_PUBLIC_VERIFY_API_ENDPOINT}`,
            {
              initData: initDataRaw,
            }
          );
          const refresh_token = Cookies.get("refresh_token");
          if (!refresh_token) {
            await createUser(data.initData);
          } else {
            await getUserDetails();
          }
        } catch (err: any) {
          console.log(err.message);
        }
      }
    })();
  }, [initDataRaw]);

  return (
    <UserDetailsContext.Provider
      value={{ userDetails, isUserCreated, txDetails, getUserDetails }}
    >
      {children}
    </UserDetailsContext.Provider>
  );
};

export default UserAuthContext;

export const useUserDetails = () => useContext(UserDetailsContext);
