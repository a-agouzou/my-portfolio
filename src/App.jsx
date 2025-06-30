import React from "react";
import "./assets/styles/global.css";
import Portfolio from "./pages/Portfolio";
import AnnotationScrollReporter from "./components/AnnotationConnector"
function App() {
  const ANNOTATION_TOOL_ORIGIN = 'http://localhost:5173'; // Replace with the actual origin of your annotation tool
  return (
    <>
    {/* <AnnotationScrollReporter
      parentOrigin={ANNOTATION_TOOL_ORIGIN}
    /> */}
    <Portfolio />
    </>
  )
}

export default App;
