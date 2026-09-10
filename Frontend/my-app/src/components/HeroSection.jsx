import red from "../assets/red.png";
import boys1 from "../assets/boys1.png";
import men2 from "../assets/men2.png";

const HeroSection = () => {
  return (
    <section className="pt-24 min-h-screen bg-[#FAFAF8]">
      {/* Text Block */}
      <div className="px-6 md:px-12 py-10">
        <h1 className="text-6xl sm:text-6xl md:text-7xl lg:text-[99px] font-black uppercase leading-none tracking-tight">
          <span className="text-[#111111]">FASHION </span>

          <span className="text-[#B76E4D]">IS WHAT</span>

          <span className="text-[#111111]"> WE WEAR.</span>
        </h1>
      </div>
      <div className="flex justify-between mb-8 px-6 md:px-12 text-xs md:text-sm font-medium text-[#111111] w-full">
        <p className="max-w-xs text ">
          Create merch your way—easy and effortless. We'll print and deliver for
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
      >
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
        <div className="relative z-20 max-w-sm space-y-10 text-[#111111] text-center md:text-left">
          <div className="bg-[#FAFAF8] rounded-xl p-3 shadow-xl border border-[#EAEAEA] hover:scale-105 transition">
            <img
              src={red}
              alt="Card"
              className="w-full h-40 object-cover rounded-xl "
            />
            <p className="text-[#111111] mt-2 text-sm uppercase">
              Awesome Merch, No Inventory
            </p>
          </div>

          <p className="text-sm text-[#6B7280]">
            Your ideas, turned into merch—no hassle. We produce, pack, and ship
            while you focus on growing your brand.
          </p>

          <button className="mx-auto md:mx-0 flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-full text-sm transition hover:bg-blue-700 transition-colors">
            Learn More
          </button>
        </div>

        {/* Right Card (Hidden on mobile) */}
        {/* Right Card */}
        <div
          className="relative z-20
  bg-[#FAFAF8]
  rounded-xl
  p-4
  border border-[#EAEAEA]
  shadow-xl
  w-full md:w-[380px]
  hover:scale-105 transition"
        >
          <img
            src={boys1}
            alt="Card"
            className="w-full h-72 md:h-64 object-cover rounded"
          />
          <p className="text-[#111111] mt-3 text-sm uppercase">
            Awesome Merch, No Inventory
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
