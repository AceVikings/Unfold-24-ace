import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link } from "react-router-dom";

const index = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {} = useWallets();

  const menuItems = [
    { name: "My Portfolios", path: "/portfolios" },
    { name: "Create", path: "/create" },
    { name: "Settings", path: "/settings" },
  ];

  const pathNameToTitle = (path: string) => {
    switch (path) {
      case "/portfolios":
        return "My Portfolios";
      case "/create":
        return "Create";
      case "/settings":
        return "Settings";
      case "/detail":
        return "Detail";
      default:
        return "Home";
    }
  };

  return (
    <>
      <div className="bg-slate-800 z-50 flex items-center justify-between absolute top-0 left-0 px-2 py-2 w-screen">
        <Link to="/">
          <img src="/logo.png" alt="logo" className="h-8" />
        </Link>
        <p>{pathNameToTitle(window.location.pathname)}</p>
        <button className="" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <AiOutlineClose size={24} color="white" />
          ) : (
            <RxHamburgerMenu size={24} color="white" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-slate-800 rounded-bl-lg shadow-lg transition-all duration-300 ease-in-out">
          <div className="flex flex-col py-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-white hover:bg-slate-700 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default index;
