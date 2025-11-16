import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/LandingPage4.png";
import header from "../assets/USM_header.png";

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  return (
    <div
      className="fixed inset-0 h-screen w-screen bg-cover bg-center sm:bg-right bg-no-repeat overflow-hidden p-0 m-0"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >

      {/* Right Side Light Purple Overlay */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-6/13 md:w-1/2 lg:w-6/13 bg-purple-100/60 backdrop-blur-sm z-0"></div>

      <img
        src={header}
        alt="Fixify Logo"
        className="absolute top-0 right-2 sm:right-5 md:right-4 mt-0 mr-0 w-32 sm:w-48 md:w-48 lg:w-55 h-12 sm:h-16 md:h-16 lg:h-20 object-contain z-20"
      />

      {/* Main Content */}
      <div
        className={`absolute left-1/2 sm:right-20 md:right-16 lg:right-30 top-1/2 sm:top-1/2 md:top-1/2 lg:top-1/2 -translate-x-1/2 sm:translate-x-0 md:translate-x-0 lg:translate-x-0 -translate-y-1/2 z-10 transition-all duration-1000 max-w-xs sm:max-w-lg md:max-w-md lg:max-w-xl w-11/12 text-center sm:text-right md:text-right lg:text-right
        ${isVisible ? "opacity-100 translate-y-0 sm:translate-x-0 md:translate-x-0 lg:translate-x-0" : "opacity-0 -translate-y-6 sm:-translate-x-6 md:-translate-x-6 lg:-translate-x-6"}`}
      >

        <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-8xl font-extrabold tracking-tight mb-4 sm:mb-6 md:mb-6 lg:mb-9 text-purple-800">
          Fixify.
        </h1>

        <p className="text-xs sm:text-sm md:text-sm lg:text-base text-purple-700 mb-8 sm:mb-10 md:mb-10 lg:mb-15 leading-relaxed">
          A better hostel starts with your feedback.<br className="hidden sm:inline" />
          Fixify is a smart and user-friendly platform designed <br className="hidden sm:inline" />
          to make hostel living better for everyone. Together, we Fixify <br className="hidden sm:inline" />
          your space making it 
          <span className="font-semibold"> better, faster, simpler</span>.
        </p>

        {/* Login Button */}
        <button
          onClick={() => navigate("/auth/login")}
          className="group relative inline-flex items-center justify-center px-5 sm:px-6 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-2.5 lg:py-3 text-sm sm:text-base md:text-base lg:text-lg font-semibold rounded-full bg-purple-700 text-white overflow-hidden transition-all duration-300 hover:bg-purple-800 shadow-lg"
        >
          <span className="relative z-10 flex items-center gap-2">
            Log In
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform duration-300"
              size={16}
            />
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </button>
      </div>

      {/* Floating Purple Blobs */}
      <div className="absolute top-10 left-10 w-24 sm:w-40 md:w-40 lg:w-48 h-24 sm:h-40 md:h-40 lg:h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-2 sm:right-10 md:right-8 lg:right-20 w-32 sm:w-56 md:w-56 lg:w-64 h-32 sm:h-56 md:h-56 lg:h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-300"></div>
    </div>
  );
};

export default LandingPage;
