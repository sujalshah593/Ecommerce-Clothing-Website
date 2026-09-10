import React from 'react'
import { Instagram, Facebook, Twitter, ChevronRight } from 'lucide-react'

const ContactSection = () => {
  return (
    <>
    <section className="bg-[#F2ECE4] py-32 border-y border-[#EAEAEA]">
          <div className="px-6 md:px-12 max-w-3xl mx-auto text-center space-y-8 font-serif">
            <span className="text-[10px] text1 font-bold uppercase tracking-[0.5em] text-accent">Newsletter</span>
            <h2 className="text-4xl md:text-6xl text1 font-serif">Stay Informed</h2>
            <p className="text-muted-foreground leading-relaxed text md:text-base">
              Be the first to hear about new collection launches, exclusive events, and the latest from the VÃ‰RO
              Journal.
            </p>
            <form className="flex flex-col md:flex-row gap-0 pt-4 max-w-xl mx-auto border-b border-primary">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="flex-1 bg-transparent py-4 text-[10px] text tracking-[0.2em] uppercase focus:outline-none"
              />
              <button className="py-4 md:px-8 text-[10px] text1 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 group bg-blue-600 text-white transition-colors rounded-none hover:bg-blue-700 transition-colors">
                Subscribe <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </section>

    </>
  )
}

export default ContactSection
