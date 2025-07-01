import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    // <div className="bg-contain" style={{ backgroundImage: `url(${bgImage})` }}>
    <div className="bh-contain bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;
