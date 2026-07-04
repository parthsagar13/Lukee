import React from 'react';
import { Award, Compass, Heart, ShieldAlert } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div id="about-page" className="font-sans space-y-20 pb-16">
      {/* Editorial Banner */}
      <section className="relative h-[50vh] bg-[#11100e] overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80"
            alt="Handcrafting gold casting"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#11100e]/60"></div>
        </div>
        <div className="relative z-10 max-w-2xl space-y-4 text-white">
          <span className="text-xs tracking-[0.4em] text-gold-400 uppercase font-light block">Our Legacy</span>
          <h1 className="text-4xl sm:text-5xl font-light font-serif tracking-wide text-white">
            Uncompromising Standards <br />Since 2012
          </h1>
          <div className="w-12 h-[1px] bg-gold-400 mx-auto mt-4"></div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 leading-relaxed text-center">
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A]">The Soul of Fine Artistry</h2>
        <p className="text-xs sm:text-sm text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
          Founded in the historic jewelry district of New York by visionary gemologist Lucas Lukee, our atelier is dedicated to a singular, unwavering mission: crafting breathtaking fine jewelry that bridges modern design and classic, heirloom-grade longevity. 
        </p>
        <p className="text-xs sm:text-sm text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
          We reject the practices of mass manufacturing. Every piece in our showcase is individually forged, micro-paved, and hand-finished by master goldsmiths with a combined century of expertise in diamond setting. From the balance of a platinum shank to the alignment of diamond prongs, our team spends dozens of hours refining each item.
        </p>
      </section>

      {/* Brand values bento blocks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#F9F6F2] border border-gold-200 p-8 text-center space-y-4 rounded-sm">
            <div className="w-12 h-12 bg-[#FDFCFB] border border-gold-200 text-gold-500 rounded-full flex items-center justify-center mx-auto">
              <Compass size={22} className="stroke-1" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">Ethically Sourced</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-light">
              We operate strictly within the Kimberley Process. All Lukee diamonds are conflict-free, traceably mined, and audited to guarantee environmental and community-centered sustainability.
            </p>
          </div>

          <div className="bg-[#F9F6F2] border border-gold-200 p-8 text-center space-y-4 rounded-sm">
            <div className="w-12 h-12 bg-[#FDFCFB] border border-gold-200 text-gold-500 rounded-full flex items-center justify-center mx-auto">
              <Award size={22} className="stroke-1" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">Certified Brilliance</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-light">
              Every major diamond or gemstone over 0.5 carats is accompanied by a globally recognized grading certificate from GIA, detailing the color, cut, clarity, and carat weight.
            </p>
          </div>

          <div className="bg-[#F9F6F2] border border-gold-200 p-8 text-center space-y-4 rounded-sm">
            <div className="w-12 h-12 bg-[#FDFCFB] border border-gold-200 text-gold-500 rounded-full flex items-center justify-center mx-auto">
              <Heart size={22} className="stroke-1" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">Bespoke Customization</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-light">
              Through our private viewing rooms, clients collaborate directly with Lucas Lukee to forge completely unique engagement or celebratory pieces modeled to their direct vision.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Quote block */}
      <section className="bg-[#F9F6F2] border-y border-gold-200 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-serif text-2xl italic font-light leading-relaxed text-[#1A1A1A]">
            "A jewelry purchase is not merely an exchange of material wealth. It is the solidifying of a memory, an emotion, and a milestone that will outlive us. It deserves absolute perfection."
          </p>
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold-500 block font-semibold">
            — Lucas Lucas, Founder & Lead Architect
          </span>
        </div>
      </section>
    </div>
  );
};
