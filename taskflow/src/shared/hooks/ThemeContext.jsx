import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { message } from "antd";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const[userId,setUserId] = useState(null)

  // Ant Design message API
  const [messageApi, contextHolder] = message.useMessage();

  const toggleTheme = () => setIsDark(prev => !prev);

  // ✅ Reusable notification function
  const showMessage = (type, content) => {
    messageApi.open({ type, content });
  };

  // ✅ Decode token & set admin state
  const updateAdminFromToken = () => {
    const token = localStorage.getItem("Token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(!!decoded.isAdmin);
        console.log(decoded.id)
        setUserId(decoded.id)

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
    showMessage("success", "Logged in successfully!");
  };

  const logout = () => {
    localStorage.removeItem("Token");
    setIsAdmin(false);
    showMessage("info", "Logged out!");
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        isAdmin,
        userId,
        setUserId,
        setIsAdmin, // optional, direct control
        login,      // use after successful login
        logout,     // use after logout
        showMessage // 🔹 Now available globally
      }}
    >
      {contextHolder}
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
