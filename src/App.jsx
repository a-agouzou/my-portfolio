import React from "react";
import "./assets/styles/global.css";
import Portfolio from "./pages/Portfolio";
import AnnotationConnector from "./components/AnnotationConnector"
function App() {
  return (
    <>
    <AnnotationConnector/>
    <Portfolio />
    </>
  )
}

export default App;
