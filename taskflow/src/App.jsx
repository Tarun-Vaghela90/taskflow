import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import DashLayout from "./dashboard/DashLayout";
import Dashboard from "./dashboard/pages/dashboard/Dashboard";
import Projects from "./dashboard/pages/project/Projects";
import Tasks from "./dashboard/pages/Tasks/Tasks";
import ViewTask from "./dashboard/pages/Tasks/ViewTask";
import Login from "./user/Login";
import Signup from "./user/Signup";
import Viewproject from "./dashboard/pages/project/Viewproject";
import EditProfile from "./user/EditProfile";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ConfigProvider, theme, Button } from "antd";
import { useTheme } from "./shared/hooks/ThemeContext";
import Users from "./dashboard/pages/users/Users.jsx";

function App() {
  const token = localStorage.getItem("Token");
  const { isDark,isAdmin } = useTheme();

  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();

  const checkTokenExpiration = () => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      console.log("userID :" + decoded.id);
      setAdmin(decoded.isAdmin);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Invalid token", error);
      return true;
    }
  };

  useEffect(() => {
    if (checkTokenExpiration()) {
      toast.warning("Token expired. Please login again.");
      localStorage.removeItem("Token");
      navigate("/");
    }
  }, []);

  

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
        },
      }}
    >
      {/* Theme switcher button (fixed top-right) */}
      {/* <Button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        {isDark ? "Light Mode" : "Dark Mode"}
      </Button> */}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route
          path="/signup"
          element={admin ? <Signup /> : <Navigate to={"/"} />}
        />
        <Route path="profile/edit" element={<EditProfile />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={token ? <DashLayout /> : <Navigate to={"/"} />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/project/:id" element={<Viewproject />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<ViewTask />} />
          <Route path="users" element={isAdmin ? <Users />:<Navigate to={'/admin/dashboard'}/>} />
          {/* <Route path="users/:id" element={<ViewTask />} /> */}
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;
