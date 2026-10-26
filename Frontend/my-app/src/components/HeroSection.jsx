import { ArrowRight } from "lucide-react";
import loginBanner from "../assets/login_banner.png"; 

const HeroSection = () => {
  return (
    <section className="w-full bg-[#FFFAF3] px-4 md:px-12 pt-32 md:pt-48 flex flex-col font-sans min-h-[calc(100vh-140px)]">
      {/* Top Text Content */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full mb-12 md:mb-16 gap-8">
        
        {/* Main Headline */}
        <h1 className="header text-5xl sm:text-6xl md:text-[5rem] lg:text-[90px] leading-[1.05] text-[#382A3A] tracking-tight uppercase max-w-4xl">
          STEP INTO THE FUTURE<br />
          OF <span className="text-[#A8C7F0] header">FASHION</span>
        </h1>

        {/* Right Sub-text and Button */}
        <div className="flex flex-col gap-8 md:mb-4 max-w-xs">
          <p className="text-xs md:text-sm font-semibold leading-[1.6] uppercase text-[#382A3A] tracking-wide">
            DISCOVER TRENDSETTING STYLES FOR MEN, WOMEN, AND KIDS — FROM TIMELESS CLASSICS TO BOLD STREETWEAR.
          </p>
          <button className="flex items-center justify-between border-2 border-[#A8C7F0] text-[#A8C7F0] rounded-full px-5 py-3 w-[260px] hover:bg-[#A8C7F0] hover:text-[#382A3A] transition duration-300 group">
            <span className="text-xs font-bold tracking-widest">SHOP NEW ARRIVALS</span>
            <ArrowRight className="w-4 h-4 text-[#A8C7F0] group-hover:text-[#382A3A] transition" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="w-full h-[300px] md:h-[750px] bg-[#D8C9FF]/20 border border-[#D8C9FF]/40 overflow-hidden mt-4 relative flex justify-center items-center rounded-t-2xl">
         <img 
           src={loginBanner} 
           alt="Mens Fashion" 
           className="w-full h-full object-contain mix-blend-multiply opacity-90" 
         />
      </div>
    </section>
  );
};

export default HeroSection;
