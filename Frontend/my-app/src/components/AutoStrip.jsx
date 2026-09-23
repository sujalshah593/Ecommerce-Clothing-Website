import React from "react";

const AutoStrip = () => {
  return (
    <div className="relative overflow-hidden bg-[#111111] text-[#FFFFFF] py-10 hover:bg-blue-600 transition-colors">
      
      <div className="whitespace-nowrap animate-marquee font-bold uppercase tracking-widest text-xl">
        Modern Tailoring &nbsp;&nbsp;&nbsp; ✦ Street Essentials &nbsp;&nbsp;&nbsp; ✦ Premium Cotton &nbsp;&nbsp;&nbsp; ✦ Express Identity &nbsp;&nbsp;&nbsp; ✦ Limited Drop &nbsp;&nbsp;&nbsp; ✦ 
        Modern Tailoring &nbsp;&nbsp;&nbsp; ✦ Street Essentials &nbsp;&nbsp;&nbsp; ✦ Premium Cotton &nbsp;&nbsp;&nbsp; ✦ Express Identity &nbsp;&nbsp;&nbsp; ✦ Limited Drop ✦  &nbsp;&nbsp;
         Modern Tailoring &nbsp;&nbsp;&nbsp; ✦ Street Essentials &nbsp;&nbsp;&nbsp; ✦ Premium Cotton &nbsp;&nbsp;&nbsp; ✦ Express Identity &nbsp;&nbsp;&nbsp; ✦ Limited Drop ✦ 
      </div>

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          .animate-marquee {
            display: inline-block;
            min-width: 200%;
            animation: marquee 18s linear infinite;
          }
        `}
      </style>

    </div>
  );
};

export default AutoStrip;
