import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleTheme = () => setIsDark(prev => !prev);

  // ✅ Decode token & set admin state
  const updateAdminFromToken = () => {
    const token = localStorage.getItem("Token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(!!decoded.isAdmin);
      } catch (err) {
        console.error("Invalid token", err);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  // Run once on mount
  useEffect(() => {
    updateAdminFromToken();
  }, []);

  // Function to be called after login/logout
  const login = (token) => {
    localStorage.setItem("Token", token);
    updateAdminFromToken();
  };

  const logout = () => {
    localStorage.removeItem("Token");
    setIsAdmin(false);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        isAdmin,
        setIsAdmin, // optional, direct control
        login,      // use after successful login
        logout      // use after logout
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
