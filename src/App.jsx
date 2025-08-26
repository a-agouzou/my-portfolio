import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./assets/styles/global.css";
import Portfolio from "./pages/Portfolio";
import Test from "./pages/Test";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        {/* <Route path="/test" element={<Test />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
