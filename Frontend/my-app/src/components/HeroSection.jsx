import red from "../assets/red.png";
import boys1 from "../assets/boys1.png";
import men2 from "../assets/men2.png";

const HeroSection = () => {
  return (
    <section className="pt-24 min-h-screen">
      {/* Text Block */}
      <div className="px-6 md:px-12 py-10">
        <h1 className="text-6xl sm:text-6xl md:text-7xl hover:cursor-pointer hover:transition-transform hover:scale-105 lg:text-[99px] font-black uppercase leading-none tracking-tight">
          <span className="text-black ">FASHION </span>

          <span className="outline-text">IS WHAT</span>

          <span className="text-black"> WE WEAR.</span>
        </h1>
      </div>
      <div className="flex justify-between mb-8  px-6 md:px-12 text-xs md:text-sm font-medium text-black w-full">
        <p className="max-w-xs text ">
          Create merch your way—easy and effortless. We’ll print and deliver for
          you.
        </p>

        <p className="max-w-xs text">
          We handle it all. You do what you do best—create and sell.
        </p>
      </div>

      <div
        className="relative text w-full overflow-visible px-6 md:px-12
             py-16 md:py-17
             flex flex-col md:flex-row
             items-center md:items-center
             justify-center md:justify-between
             gap-10 md:gap-0"
        style={{
          background:
            "linear-gradient(90deg, #7a0a0a 0%, #c01616 50%, #ff4b4b 100%)",
        }}
      >
        {/* Faint Background Text */}
        <h2 className="absolute left-6  -translate-y-1/2 text-[12vw] font-black uppercase text-white opacity-10">
          TREND
        </h2>

        {/* Right faint text */}
        <h2 className="absolute right-6 top-96 -translate-y-1/2 text-[12vw] font-black uppercase text-white opacity-10">
          TREND
        </h2>

        {/* Center Model Image */}
        <img
          src={men2}
          alt="Model"
          className="
      relative md:absolute
      md:bottom-[-10px]
      md:left-1/2
      md:-translate-x-1/2
      h-[129%] md:h-[130%]
      object-contain
      z-10
      pointer-events-none hover:scale-105 transition
    "
        />

        {/* Left Content */}
        <div className="relative z-20 max-w-sm space-y-10 text-white text-center md:text-left">
          <div className="bg-white rounded-xl p-3 shadow-lg hover:scale-105 transition">
            <img
              src={red}
              alt="Card"
              className="w-full h-40 object-cover rounded-xl "
            />
            <p className="text-black  mt-2 text text-sm uppercase">
              Awesome Merch, No Inventory
            </p>
          </div>

          <p className="text-sm text-white/90">
            Your ideas, turned into merch—no hassle. We produce, pack, and ship
            while you focus on growing your brand.
          </p>

          <button className="mx-auto md:mx-0 flex text items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm ">
            Learn More
            <span className="bg-black text-white rounded-full text-xl px-2 py-1">
              →
            </span>
          </button>
        </div>

        {/* Right Card (Hidden on mobile) */}
        {/* Right Card */}
        <div
          className="relative z-20 bg-white rounded-lg p-4 shadow-lg 
                w-full md:w-[380px] 
                hover:scale-105 transition"
        >
          <img
            src={boys1}
            alt="Card"
            className="w-full h-72 md:h-64 object-cover rounded"
          />
          <p className="text-black text mt-3 text-sm uppercase">
            Awesome Merch, No Inventory
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
