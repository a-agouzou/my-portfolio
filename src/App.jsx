import { Route } from "react-router";
import "./assets/styles/global.css";
import Portfolio from "./pages/Portfolio";
import { BrowserRouter as Router } from "react-router-dom";
import Test from "./pages/Test";

function App() {
  return (
    <Router>
      <Route path="/" element={<Portfolio />} />
      <Route path="/test" element={<Test />} />
      {/* Add more routes as needed */}
    </Router>
  );
}

export default App;
