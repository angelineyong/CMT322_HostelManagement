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
      className="fixed inset-0 h-screen w-screen bg-cover bg-right bg-no-repeat overflow-hidden p-0 m-0"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >

      {/* Right Side Light Purple Overlay */}
      <div className="absolute right-0 top-0 h-full w-6/13 bg-purple-100/60 backdrop-blur-sm z-0"></div>

      <img
        src={header}
        alt="Fixify Logo"
        className="absolute top-0 right-5 mt-0 mr-0 w-55 h-20 object-contain z-20"
      />

      {/* Main Content */}
      <div
        className={`absolute right-30 top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 max-w-xl
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
      >

        <h1 className="text-8xl font-extrabold tracking-tight mb-9 text-purple-800 text-right">
          Fixify.
        </h1>

        <p className="text-base sm:text-lg md:text-base text-purple-700 mb-15 leading-relaxed text-right">
          A better hostel starts with your feedback.<br />
          Fixify is a smart and user-friendly platform designed <br />
          to make hostel living better for everyone. Together, we Fixify <br />
          your space making it 
          <span className="font-semibold"> better, faster, simpler</span>.
        </p>

        {/* Login Button */}
        <button
          onClick={() => navigate("/auth/login")}
          className="ml-30 group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-full bg-purple-700 text-white overflow-hidden transition-all duration-300 hover:bg-purple-800 shadow-lg"
        >
          <span className="relative z-10 flex items-center gap-2">
            Log In
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform duration-300"
              size={20}
            />
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </button>
      </div>

      {/* Floating Purple Blobs */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-300"></div>
    </div>
  );
};

export default LandingPage;
