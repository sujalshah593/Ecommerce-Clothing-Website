import React from "react";
import boys from "../assets/boys.png";
import men from "../assets/men.png";
import download from "../assets/download.jpg";
import { ArrowRight, MoveUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import left_image from "../assets/left_image.png";

const BuyerSection = () => {
  return (
    <>
      <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT COLUMN - Boys */}
          <div className="space-y-8">
            {/* Boys Card */}
            <div className="relative group overflow-hidden bg-zinc-100 rounded-xl">
              <img
                src={boys}
                alt="Boys"
                className="w-full h-[850px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute bottom-6 left-6 space-y-2">
                <h4 className="text-xl text1 text-white font-semibold">
                  Ready-to-Wear
                </h4>
                <Link
                  to="/Boys"
                  className="text-[10px] text font-bold uppercase tracking-widest text-white border-b border-white pb-1"
                >
                  For Kids
                </Link>
              </div>
            </div>

            {/* Text Below Boys */}
            <div className="flex justify-between items-start gap-6">
              <div>
                <h3 className="text-4xl text font-black uppercase leading-tight">
                  More Than Style — It's Identity
                </h3>
                <p className="text-sm text text-gray-500 mt-3">
                  Built for movement, comfort, and everyday adventure.
                </p>
              </div>

              <div
                className="w-20 h-13 rounded-full bg-black text-white flex items-center justify-center 
                  hover:scale-110 transition-transform duration-300 cursor-pointer"
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
                <p className="text-sm text text-gray-500 mt-3">
                  Modern craftsmanship meets timeless structure.
                </p>
              </div>

              <div
                className="w-20 h-15 rounded-full bg-black text-white flex items-center justify-center 
                  hover:scale-110 transition-transform duration-300 cursor-pointer"
              >
                <MoveUpRight size={20} />
              </div>
            </div>

            {/* Men Card */}
            <div className="relative group overflow-hidden bg-zinc-100 rounded-xl">
              <img
                src={men}
                alt="Men"
                className="w-full h-[900px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute bottom-8 left-8 space-y-2">
                <h4 className="text-3xl text1 text-white font-semibold">
                  Modern Tailoring
                </h4>
                <Link
                  to="/Mens"
                  className="text-[10px] text font-bold uppercase tracking-widest text-white border-b border-white pb-1"
                >
                  Shop Mens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BuyerSection;
