import Stack from "../components/stack.jsx";
import boys from "../assets/boys.png";
import boys1 from "../assets/boys1.png";
import men from "../assets/men.jpg";
import feature from "../assets/feature.avif";

const images = [boys, boys1, men, feature];

const MiddleHeroSection = () => {
  return (
    <section className="relative bg-[#111111] text-[#FFFFFF] py-24 overflow-hidden hover:bg-[#B76E4D] transition-colors">
      {/* Top Headline */}
      <div className="text-center space-y-4 px-6">
        <h2 className="text-2xl text md:text-4xl font-black uppercase tracking-wide">
          Form meets motion. Freedom meets design.
        </h2>

        <div className="flex items-center text justify-center gap-4 text-xl md:text-3xl font-black uppercase">
          <img
            src={boys}
            alt=""
            className="w-14 h-14 object-cover rounded-lg"
          />
          <span>Designed to match your pace—wherever life takes you.</span>
        </div>
      </div>

      {/* Background Giant Text */}
      <h2 className="absolute text2 inset-0 flex items-center justify-center text-[20vw] font-black uppercase text-[#FFFFFF] opacity-5 pointer-events-none">
        FREEMEE
      </h2>

      {/* Center Stack */}
      <div className="relative z-10 flex justify-center items-center py-28">
        <div className="relative">
          {/* Red diagonal ribbon */}

          <div className="absolute text top-1/2 left-1/2 w-[150vw] -translate-x-1/2 -translate-y-1/2 rotate-[18deg] bg-[#111111] text-[#FFFFFF] font-bold uppercase text-2xl tracking-widest py-8 text-center z-0 hover:bg-[#B76E4D] transition-colors">
            NEWFASHION ✦&nbsp;&nbsp; NEWFASHION ✦&nbsp;&nbsp; NEWFASHION
            ✦&nbsp;&nbsp; NEWFASHION ✦&nbsp;&nbsp; NEWFASHION ✦&nbsp;&nbsp;
            NEWFASHION ✦&nbsp;&nbsp; NEWFASHION ✦&nbsp;&nbsp; NEWFASHION
          </div>

          {/* Stack Cards */}
          <div className="relative" style={{ width: 290, height: 400 }}>
            <Stack
              randomRotation={false}
              sensitivity={200}
              sendToBackOnClick={true}
              cards={images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`card-${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "16px",
                  }}
                />
              ))}
              autoplay={false}
            />
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="flex text flex-col md:flex-row justify-between gap-8 px-6 md:px-40 md:py-20 text-sm text-[#FFFFFF]/70">
        <p className="max-w-sm">
          To us, fashion goes beyond passing trends—it serves as a language of
          expression. Our collections embody freedom, individuality, and
          authenticity.
        </p>

        <p className="max-w-sm md:text-right">
          Each piece is thoughtfully crafted to follow your lifestyle—whether
          you're on the go, traveling, or creating in your own space.
        </p>
      </div>
    </section>
  );
};

export default MiddleHeroSection;
