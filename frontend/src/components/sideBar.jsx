import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { useState } from "react";

const SideBar = ({ displaySideBar, setDisplaySideBar }) => {
  const location = useLocation();
  const { theme, changeTheme, availableThemes } = useTheme();
  const [showThemes, setShowThemes] = useState(false);

  return (
    <>
      <AnimatePresence>
        {displaySideBar && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeIn" }}
            className="z-10 fixed bg-[var(--color-1)] top-2 left-2 w-3xs text-[var(--color-3)] pb-3 transition-transform duration-800 transform translate-x-0 rounded-lg shadow-lg"
          >
            <div className="flex justify-end p-3">
              <button
                onClick={() => setDisplaySideBar(false)}
                className="text-2xl hover:text-red-500"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>
            <ul>
            <Link
                  to="/"
                  onClick={() => setDisplayProfileList(false)}
                  className={`${
                    location.pathname === "/" && "text-[var(--color-2)]"
                  }`}
                >
              <li className="px-4 mb-2 p-2 font-bold pointer-events-auto cursor-pointer hover:bg-[var(--color-3)] hover:text-[var(--color-2)]">
                  Home
              </li>
            </Link>

            <Link
                  to="/chatPage"
                  onClick={() => setDisplayProfileList(false)}
                  className={`${
                    location.pathname === "/chatPage" && "text-[var(--color-2)]"
                  }`}
                >
              <li className="px-4 mb-2 p-2 font-bold pointer-events-auto cursor-pointer hover:bg-[var(--color-3)] hover:text-[var(--color-2)]">
                  new chat
              </li>
            </Link>

              <ul className="mb-3 p-3 font-bold pointer-events-auto cursor-pointer ">
                <div
                  onClick={() => setShowThemes((prev) => !prev)}
                  className="p-2 hover:bg-[var(--color-3)] hover:text-[var(--color-2)]"
                >
                  Theme
                  <i
                    className={`bx ml-2 ${
                      showThemes ? "bx-chevron-up " : "bx-chevron-down"
                    }`}
                  ></i>
                </div>

                <AnimatePresence>
                  {showThemes && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-4 mt-1 p-1 overflow-hidden"
                    >
                      {availableThemes.map((th, idx) => (
                        <li
                          key={idx}
                          className="relative mb-1 flex items-center justify-between pointer-events-auto cursor-pointer hover:bg-[var(--color-3)] hover:text-[var(--color-2)]"
                          onClick={() => changeTheme(th)}
                        >
                          {th}
                          {theme === th && (
                            <i className="bx bx-check ml-2 text-xl text-white"></i>
                          )}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </ul>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideBar;