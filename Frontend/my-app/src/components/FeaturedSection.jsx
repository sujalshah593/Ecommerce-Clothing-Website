import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import feature from "../assets/feature.avif";
import boys from "../assets/boys.png";
import boys1 from "../assets/boys1.png";
import men from "../assets/men.jpg";
import men2 from "../assets/men2.png";


const FeaturedSection = () => {
  return (
    <section className="bg-[#EEF3EC]">
      <div className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">

        {/* Left Image */}
        <div className="lg:col-span-6 relative hover:scale-105 transition rounded-2xl overflow-hidden">
          <img
            src={feature}
            alt="Editorial"
            className="w-[120%] h-[90%] object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-4xl md:text-5xl text1 lg:text-5xl font-black uppercase leading-tight">
            How you express identity, not just clothing.
          </h2>

          <p className="text-sm text font-bold uppercase tracking-widest text-[#6B7280]">
            / Latest Work 2025
          </p>

          <p className="text-[#111111] text text-sm md:text-base leading-relaxed">
            To us, fashion goes beyond passing trends—it serves as a language of
            expression. Our collections embody freedom, individuality, and
            authenticity.
          </p>

          <Link
            to="/about"
            className="inline-flex text items-center gap-2 font-semibold text-sm underline"
          >
            More About Us
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Thumbnails */}
          <div className="flex gap-3 pt-4">
            {[boys, boys1, men, men2].map((img, i) => (
              <div
                key={i}
                className="w-16  h-16 hover:scale-105 transition md:w-20 md:h-20 rounded-lg overflow-hidden"
              >
                <img
                  src={img}
                  alt="thumb"
                  className="w-full hover:scale-105 transition h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
