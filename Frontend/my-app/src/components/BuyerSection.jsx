import React from "react";
import boys from "../assets/boys.png";
import men from "../assets/men.png";
import { ArrowRight, MoveUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const BuyerSection = () => {
  return (
    <>
      <section className="bg-white mb-20">
        <div className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT COLUMN - Boys */}
          <div className="space-y-8">
            {/* Boys Card */}
            <div className="relative group overflow-hidden bg-[#FFFFFF] border border-[#EAEAEA] shadow-sm rounded-xl">
              <img
                src={boys}
                alt="Boys"
                className="w-full h-[850px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#111111]/10 group-hover:bg-[#111111]/20 transition-all"></div>
              <div className="absolute bottom-6 left-6 space-y-2">
                <h4 className="text-xl text1 text-[#FFFFFF] font-semibold">
                  Ready-to-Wear
                </h4>
                <Link
                  to="/Boys"
                  className="text-[10px] text font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-[#FAFAF8] pb-1"
                >
                  For Kids
                </Link>
              </div>
            </div>

            {/* Text Below Boys */}
            <div className="flex justify-between items-start gap-6">
              <div>
                <h3 className="text-4xl text font-black uppercase leading-tight">
                  More Than Style It's Identity
                </h3>
                <p className="text-sm text text-[#6B7280] mt-3">
                  Built for movement, comfort, and everyday adventure.
                </p>
              </div>

              <div
                className="w-20 h-13 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <MoveUpRight size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-start gap-6">
              <div>
                <h3 className="text-4xl text font-black uppercase leading-tight">
                  Tailored for Confidence
                </h3>
                <p className="text-sm text text-[#6B7280] mt-3">
                  Modern craftsmanship meets timeless structure.
                </p>
              </div>

              <div
                className="w-20 h-15 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <MoveUpRight size={20} />
              </div>
            </div>

            {/* Men Card */}
            <div className="relative group overflow-hidden bg-[#FFFFFF] border border-[#EAEAEA] shadow-sm rounded-xl">
              <img
                src={men}
                alt="Men"
                className="w-full h-[900px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#111111]/10 group-hover:bg-[#111111]/20 transition-all"></div>
              <div className="absolute bottom-8 left-8 space-y-2">
                <h4 className="text-3xl text1 text-[#FFFFFF] font-semibold">
                  Modern Tailoring
                </h4>
                <Link
                  to="/Mens"
                  className="text-[10px] text font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-[#FAFAF8] pb-1"
                >
                  Shop Mens
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  );
};

export default BuyerSection;
