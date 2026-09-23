import React from "react";
import { ChevronRight } from "lucide-react";

const SimpleSection = () => {
  return (
    <>
      <section className="py-32 px-6 md:px-12 bg-white text-[#111111] text-center">
        <div className="max-w-4xl mx-auto space-y-8 reveal">
          <span className="text-[120px] leading-none text opacity-10 block">"</span>

          <h2 className="text-3xl md:text-6xl font-black text1 leading-[1.2]">
            Fashion is not just about clothes, it's about the narrative we
            choose to tell the world through our silhouette.
          </h2>
          <span className="text-xs uppercase tracking-[0.4em] text text-[#6B7280]">
            — Rohit Shah
          </span>
        </div>
      </section>
    </>
  );
};

export default SimpleSection;
