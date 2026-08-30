import React from 'react';
import { Instagram, Facebook, Twitter, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom';

const FooterSection = () => {
  return (
    <>
        <footer className="bg-[#111111] text-[#FFFFFF] px-6 md:px-12 pt-24 pb-12 hover:bg-[#B76E4D] transition-colors">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 font-serif lg:gap-24 pb-24 border-b border-[#FAFAF8]/10">
            <div className="md:col-span-4 space-y-8">
              <a href="/" className="text-2xl font-bold tracking-tighter uppercase">
                SHRÉEJI<span className="text-accent">.</span>
              </a>
              <p className="text text-[#FFFFFF]/80 leading-relaxed max-w-sm">
                A design-driven clothing studio focused on creating timeless garments for the modern individual. We
                believe in the beauty of simplicity and the integrity of natural materials.
              </p>
              <div className="flex gap-6 text">
                {/* <Instagram className="w-5 h-5 hover:text-accent cursor-pointer transition-colors" />
                <Facebook className="w-5 h-5 hover:text-accent cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 hover:text-accent cursor-pointer transition-colors" /> */}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h5 className="text-[10px] text1 font-bold uppercase tracking-[0.3em] text-[#6B7280]">Shop</h5>
              <ul className="space-y-4 text-[10px] uppercase text tracking-widest font-bold">
                <li>
                  <Link to="/boys" className="hover:text-accent transition-colors">
                    Boys
                  </Link>
                </li>
                <li>
                  <Link to="/men" className="hover:text-accent transition-colors">
                    Men
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text1 text-[#6B7280]">About</h5>
              <ul className="space-y-4 text-[10px] uppercase text tracking-widest font-bold">
                <li>
                  <Link to="/about-us" className="hover:text-accent  transition-colors">
                    Journal
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="hover:text-accent transition-colors">
                    Owner
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="hover:text-accent transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text1 text-[#6B7280]">Customer Care</h5>
              <div className="space-y-4">
                <p className="text-[10px] text font-bold uppercase tracking-widest hover:text-accent transition-colors cursor-pointer border-b border-[#FAFAF8]/10 pb-2">
                  support@vero.com
                </p>
                <div className="grid text1 grid-cols-2 gap-4 text-[10px] uppercase tracking-widest font-bold text-[#FFFFFF]/80">
                  <Link to="/privacy-policy" className="hover:text-[#FFFFFF] transition-colors">
                    Shipping
                  </Link>
                  <Link to="/privacy-policy" className="hover:text-[#FFFFFF] transition-colors">
                    Exchanges
                  </Link>
                  <Link to="/privacy-policy" className="hover:text-[#FFFFFF] transition-colors">
                    Sustainability
                  </Link>
                  <Link to="/privacy-policy" className="hover:text-[#FFFFFF] transition-colors">
                    Privacy Policy
                  </Link  >
                </div>
              </div>
            </div>
          </div>
             <div className="max-w-7xl mx-auto pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-medium">
              © 2025 SHRÉEJI DESIGN STUDIO. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.4em] font-bold text-[#6B7280]">
              <span className="cursor-pointer hover:text-[#FFFFFF] transition-colors underline decoration-accent underline-offset-4">
                EN
              </span>
              <span className="cursor-pointer hover:text-[#FFFFFF] transition-colors">FR</span>
              <span className="cursor-pointer hover:text-[#FFFFFF] transition-colors">IT</span>
            </div>
          </div>
        </footer>
    </>
  )
}

export default FooterSection
