import Menubar from "./Components/Menubar";
import Sidebar from "./Components/Sidebar";
import { useState , useEffect} from "react";
import "./App.css";
import Dashboard from "./Pages/Dashboard";
import { Routes, Route, useLocation } from "react-router-dom";
import User from "./Pages/User"; 
import Login from "./Inner_sections/Login";
import Signup from "./Inner_sections/Signup";
import Setting from "./Pages/Setting";
import AssetCapture from "./Pages/AssetCapture";
import Classification from "./Pages/Classification";
import Inventory from "./Pages/Inventory";
import ProtectedRoute from "./Components/ProtectedRoute";
import MisReport from "./Pages/MisReport";
const App = () => {
  const [profileUser, setProfileUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state
  const location = useLocation(); // Use location to track the current route

  // Read from localStorage when the app loads
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setProfileUser(storedUsername);
    }
  }, []);

    // Check if the current route is part of the user section
  const isUserPage = location.pathname.startsWith("/user");
  // Go back to homepage and hide User section

  const removeUser = () => {
    // setIsUserVisible(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen); // toggle function

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
  <div className="app-wrapper">
    <button className="toggle-btn" onClick={toggleSidebar}>☰</button>
    <section className={`first-container ${isSidebarOpen ? "open" : ""} ${isUserPage ? 'blurred' : ''}`}>
      <Sidebar toggleSidebar={toggleSidebar} closeSidebar={closeSidebar}/>
    </section>

    <section className={`second-container ${isUserPage ? 'blurred' : ''}`}>
      <Menubar username={profileUser}/>
    </section>

    <section className={`third-container ${isUserPage ? 'blurred' : ''}`}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/assetCapture" element={<AssetCapture />} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/setting/*" element={<Setting />} />
        <Route path="/classification/*" element={<Classification />} />
        <Route path="/misreport" element={<ProtectedRoute><MisReport /></ProtectedRoute>} />
      </Routes>
    </section>

    <section className={`user-container ${isUserPage ? "visible" : "hidden"}`}>
      <Routes>
        <Route path="/user" element={<User removeUser={removeUser} />}>
          <Route path="login" element={<Login setProfileUser={setProfileUser} />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>
    </section>
  </div>
);

};

export default App;
