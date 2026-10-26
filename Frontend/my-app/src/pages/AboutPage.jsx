import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";

const About = () => {
  return (
    <>
      <Navbar />

      <main className="pt-32 md:pt-48 bg-[#FFFAF3] text">
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <h1 className="font-serif text1 text-5xl md:text-6xl tracking-tight">
            About <span className="text-[#A8C7F0]">SHRÉEJI</span>
          </h1>

          <p className="mt-6 max-w-4xl text-[#111111] leading-relaxed">
            SHRÉEJI is a contemporary clothing brand dedicated exclusively to
            men and boys. Our purpose is simple — to create clothing that feels
            comfortable, looks refined, and lasts beyond trends. Every piece
            we offer is designed with real people, real routines, and real
            comfort in mind.
          </p>
        </section>


        <section className="bg-[#FFFAF3] py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-serif text1 text-3xl mb-8">Our Story</h2>

            <p className="text-[#111111] leading-relaxed max-w-4xl mb-6">
              SHRÉEJI was born from a simple observation — while fashion options
              were abundant, truly reliable, comfortable, and thoughtfully
              designed clothing for men and boys was surprisingly limited.
              Most brands focused either on fast trends or high prices, leaving
              a gap for everyday wear that balances quality, comfort, and
              affordability.
            </p>

            <p className="text-[#111111] leading-relaxed max-w-4xl">
              We set out to build a brand that understands daily life — school,
              work, movement, growth, and change. Our collections are designed
              to adapt seamlessly to everyday use while maintaining a clean,
              modern aesthetic.
            </p>
          </div>
        </section>

        {/* ================= WHAT WE DO ================= */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="font-serif text1 text-3xl mb-10 text-center">
            What We Do
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="border p-8 rounded-4xl hover:transform hover:scale-105 transition-transform duration-300">
              <h3 className="font-serif text-xl mb-4 text1">Men’s Wear</h3>
              <p className="text-[#111111] leading-relaxed text">
                Our men’s collection focuses on modern essentials — clothing
                that transitions easily from casual to everyday professional
                settings. Clean fits, breathable fabrics, and subtle design
                details define every product we create.
              </p>
            </div>

            <div className="border p-8 rounded-4xl hover:transform hover:scale-105 transition-transform duration-300">
              <h3 className="font-serif text-xl mb-4 text1">Boys’ Wear</h3>
              <p className="text-[#111111] leading-relaxed text">
                For boys, comfort and durability come first. Our designs allow
                free movement, soft feel, and long-lasting wear — perfect for
                growing energy and daily activities, without compromising on
                style.
              </p>
            </div>
          </div>
        </section>

        {/* ================= QUALITY & MATERIAL ================= */}
        <section className="bg-[#111111] text-[#FFFFFF] py-20 text hover:bg-[#A8C7F0] transition-colors">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-serif text-3xl mb-8 text1">Quality & Craftsmanship</h2>

            <p className="text-gray-300 leading-relaxed max-w-4xl mb-6">
              Quality is not an afterthought at SHRÉEJI — it is the foundation
              of everything we do. From fabric selection to stitching, each
              step is carefully reviewed to ensure long-term durability and
              comfort.
            </p>

            <p className="text-gray-300 leading-relaxed max-w-4xl">
              We prioritize breathable fabrics, strong seams, and consistent
              sizing. Our aim is to deliver products that customers trust and
              return to, season after season.
            </p>
          </div>
        </section>

        {/* ================= FOUNDER ================= */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="font-serif text-3xl mb-6 text1">Founder</h2>

          <p className="text-[#111111] leading-relaxed max-w-4xl mb-4">
            <strong className="text1">Rohit Shah</strong> founded SHRÉEJI with a clear belief:
            clothing should support confidence, not distract from it. With a
            background in technology and design, the brand reflects precision,
            clarity, and user-focused thinking.
          </p>

          <p className="text-[#111111] leading-relaxed max-w-4xl">
            The vision was to build a platform where fashion meets practicality
            — where customers feel assured in both quality and value.
          </p>
        </section>

        {/* ================= CUSTOMER PROMISE ================= */}
        <section className="bg-[#FFFAF3] py-20">
          <div className="max-w-7xl mx-auto px-6 text">
            <h2 className="font-serif text-3xl mb-8 text1" >Our Promise</h2>

            <ul className="space-y-4 text-[#111111] max-w-4xl">
              <li>• Honest pricing without compromising quality</li>
              <li>• Thoughtfully designed products for real use</li>
              <li>• Reliable customer support and transparent policies</li>
              <li>• Continuous improvement based on customer feedback</li>
            </ul>
          </div>
        </section>

        {/* ================= VISION ================= */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="font-serif text-3xl mb-6 text1">Our Vision</h2>

          <p className="text-[#111111] leading-relaxed max-w-3xl mx-auto">
            Our vision is to become a trusted destination for men’s and boys’
            fashion — known for quality, consistency, and long-term customer
            relationships. We believe great brands are built over time, through
            trust, reliability, and purpose.
          </p>
        </section>
      </main>

      <FooterSection />
    </>
  );
};

export default About;
