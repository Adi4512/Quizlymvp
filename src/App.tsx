import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Dashboard from "./components/Dashboard";
import AuthCallback from "./components/AuthCallback";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
