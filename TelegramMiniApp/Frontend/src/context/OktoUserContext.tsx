import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface OktoUserContextProps {
  auth_token: string | null;
  setAuthToken: (auth_token: string | null) => void;
}

const OktoUserContext = createContext<OktoUserContextProps | undefined>(
  undefined
);

export const OktoUserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setAuthToken(token);
    }
  }, []);
  return (
    <OktoUserContext.Provider value={{ auth_token: authToken, setAuthToken }}>
      {children}
    </OktoUserContext.Provider>
  );
};

export const useOktoUser = (): OktoUserContextProps => {
  const context = useContext(OktoUserContext);
  if (!context) {
    throw new Error("useOktoUser must be used within an OktoUserProvider");
  }
  return context;
};
