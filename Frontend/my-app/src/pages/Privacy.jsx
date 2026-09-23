import Navbar from "../components/Navbar"
import FooterSection from "../components/FooterSection"

export default function PrivacyPolicyPage() {
  return (
    <>
    
    <Navbar/>
    <div className="min-h-screen font-sans bg-background text-foreground pt-32 md:pt-48">
      {/* Header */}
      <section className="px-6 md:px-12 max-w-4xl mx-auto mb-20">
        <div className="space-y-6">
          <span className="text-[10px] text font-bold uppercase tracking-[0.4em] text-muted-foreground">
            Last Updated: January 2026
          </span>
          <h1 className="text-5xl text1 md:text-7xl font-serif leading-[1.1]">
            Privacy <br />
            Policy
          </h1>
          <p className="text-lg text text-muted-foreground max-w-2xl leading-relaxed">
            At Shreeji, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you shop men’s and boys’ clothing with us.
          </p>
        </div>
      </section>

      {/* Quick Navigation (No Links) */}
      <section className="px-6 md:px-12 max-w-4xl mx-auto mb-20 py-12 border-y border-border">
        <h2 className="text-[10px] text1 font-bold uppercase tracking-[0.3em] mb-8 text-muted-foreground">
          Policy Overview
        </h2>
        <div className="grid text grid-cols-1 md:grid-cols-2 gap-6">
          <p className="text-sm font-medium text-muted-foreground">1. Information We Collect</p>
          <p className="text-sm font-medium text-muted-foreground">2. How We Use Your Information</p>
          <p className="text-sm font-medium text-muted-foreground">3. Sharing Your Information</p>
          <p className="text-sm font-medium text-muted-foreground">4. Data Security</p>
          <p className="text-sm font-medium text-muted-foreground">5. Cookies & Tracking</p>
          <p className="text-sm font-medium text-muted-foreground">6. Your Rights</p>
          <p className="text-sm font-medium text-muted-foreground">7. Contact Us</p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-6 md:px-12 max-w-4xl mx-auto space-y-20 pb-32">
        {/* Section 1 */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent text">01</span>
            <h3 className="text-3xl md:text-4xl font-serif text1">Information We Collect</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            We collect information you provide directly to us when you create an account, place an order, subscribe to updates, or contact customer support.
          </p>
          <ul className="space-y-4 text text-muted-foreground leading-relaxed max-w-2xl">
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Personal Information:</strong> Full name, email address, phone number, billing address, shipping address
              </span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Payment Information:</strong> Processed securely through third-party gateways; we do not store full card details
              </span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Order Details:</strong> Products purchased, order history, transaction status
              </span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Device & Usage Data:</strong> IP address, browser type, device information, pages visited, referring URLs
              </span>
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent text">02</span>
            <h3 className="text-3xl text1 md:text-4xl font-serif">How We Use Your Information</h3>
          </div>
          <p className="text-muted-foreground text leading-relaxed max-w-2xl">
            We use your information to operate and improve our e-commerce services.
          </p>
          <ul className="space-y-4 text-muted-foreground text leading-relaxed max-w-2xl">
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Processing and delivering your orders</span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Managing your account and preferences</span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Sending transactional emails and order updates</span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Providing customer support and resolving disputes</span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Improving website performance and user experience</span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Sending promotional offers (with your consent)</span>
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent text">03</span>
            <h3 className="text-3xl md:text-4xl font-serif text1">Sharing Your Information</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text max-w-2xl">
            We do not sell or rent your personal information. We may share your data only in limited situations:
          </p>
          <ul className="space-y-4 text-muted-foreground leading-relaxed text max-w-2xl">
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Service Providers:</strong> Payment gateways, courier partners, hosting providers, and email services
              </span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Legal Compliance:</strong> If required by law or government authorities
              </span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Business Transfers:</strong> In case of a merger, acquisition, or asset sale
              </span>
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text text-accent">04</span>
            <h3 className="text-3xl md:text-4xl font-serif text1">Data Security</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl text">
            We use reasonable administrative, technical, and physical safeguards to protect your personal information. All payment transactions are secured via SSL encryption. However, no online transmission or storage system can be guaranteed 100% secure.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text text-accent">05</span>
            <h3 className="text-3xl md:text-4xl font-serif text1">Cookies & Tracking</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text max-w-2xl">
            We use cookies and similar technologies to improve functionality and understand site usage.
          </p>
          <ul className="space-y-4 text-muted-foreground text leading-relaxed max-w-2xl">
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Essential Cookies:</strong> Required for core website operations
              </span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Analytics Cookies:</strong> Help us measure and improve performance
              </span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Marketing Cookies:</strong> Used for personalized promotions (optional)
              </span>
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed max-w-2xl text pt-4">
            You can disable cookies in your browser settings, but some features may not work correctly.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text text-accent">06</span>
            <h3 className="text-3xl md:text-4xl font-serif text1">Your Rights</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text max-w-2xl">
            Subject to applicable laws, you may have the right to:
          </p>
          <ul className="space-y-4 text-muted-foreground text leading-relaxed max-w-2xl">
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Access your personal information</span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Correct inaccurate or incomplete data</span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Request deletion of your information</span>
            </li>
            <li className="flex gap-4">
              <span className="text-accent font-bold">•</span>
              <span>Opt out of marketing communications</span>
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed text max-w-2xl pt-4">
            To exercise your rights, contact us using the details below.
          </p>
        </div>

        {/* Section 7 */}
        <div className="space-y-6 py-12 border-t border-border">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase text tracking-[0.3em] text-accent">07</span>
            <h3 className="text-3xl md:text-4xl font-serif text1">Contact Us</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text max-w-2xl">
            If you have any questions about this Privacy Policy or your personal data, please contact us:
          </p>
          <div className="space-y-3 text-muted-foreground text">
            <p><strong className="text1">Email:</strong> support@shreeji.com</p>
            <p><strong className="text1">Phone:</strong> +91-XXXXXXXXXX</p>
            <p><strong className="text1">Address:</strong> Shreeji, India</p>
          </div>
          <p className="text-[10px] text text-muted-foreground/60 pt-8 italic">
            This Privacy Policy may be updated from time to time. The revised version will be posted on this page with an updated date.
          </p>
        </div>
      </section>
    </div>
    <FooterSection/>
    </>
  )
}
