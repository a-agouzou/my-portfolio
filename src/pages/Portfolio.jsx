import React from "react";
import Header from "../components/Header";
import Hero from "../sections/Hero";
import About from "../sections/About";
import Projects from "../sections/Projects";
import Contact from "../sections/Contact";
import Footer from "../components/Footer";
import backgroundImage from "../assets/images/background.png";
import { Link } from "react-router";

const Portfolio = () => {
  return (
    <div
      className="min-h-screen w-full text-white relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/5"></div>

      <div className="relative z-10">
        <Header />
        <Hero />
        <About />
        <Projects />
        <Contact />
        <Footer />
        {/* button to navigate to /test page */}
        <div className="fixed bottom-4 right-4">
          <Link
            to="/test"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
          >
            Go to Test Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
