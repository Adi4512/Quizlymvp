import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
      </Routes>
      <Footer />
      <Analytics />
    </Router>
   
  );
}

export default App;
