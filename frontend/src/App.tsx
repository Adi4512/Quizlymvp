import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Dashboard from "./components/Dashboard";
import QuizPage from "./components/QuizPage";
import AuthCallback from "./components/AuthCallback";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import About from "./components/About";
import Pricing from "./components/Pricing";
import ContactUs from "./components/ContactUs";
import { Analytics } from "@vercel/analytics/react";
import Metrics from "./components/Metrics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/metrics" element={<Metrics />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
