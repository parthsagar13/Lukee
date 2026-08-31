import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Compass, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { IMAGES, TESTIMONIALS } from '../data/luxuryContent.js';

const VALUES = [
  {
    icon: Compass,
    title: 'Ethically Sourced',
    text: 'Kimberley Process compliant diamonds — conflict-free, traceably mined, and audited for community-centered sustainability.',
  },
  {
    icon: Award,
    title: 'Certified Brilliance',
    text: 'Every major stone above 0.5 carats ships with internationally recognized grading for cut, color, clarity, and carat.',
  },
  {
    icon: Heart,
    title: 'Bespoke Craft',
    text: 'Private consultations with our atelier — custom engagement and celebratory pieces shaped to your vision.',
  },
  {
    icon: Sparkles,
    title: 'Heirloom Finish',
    text: 'Hand-set, micro-paved, and polished by master goldsmiths so every silhouette ages with quiet grace.',
  },
];

const TIMELINE = [
  {
    year: '2012',
    title: 'The Atelier Opens',
    text: 'Lukee Jewels begins in a small workshop dedicated to precision setting and ethical sourcing.',
  },
  {
    year: '2016',
    title: 'First Flagship Salon',
    text: 'Our Bandra salon opens — inviting clients into private viewing rooms and bespoke consultations.',
  },
  {
    year: '2020',
    title: 'Certified Vault',
    text: 'Full lab documentation becomes standard across diamond pieces, with insured delivery nationwide.',
  },
  {
    year: '2024',
    title: 'Digital Concierge',
    text: 'Seamless online discovery meets atelier care — from virtual appointments to lifetime exchange.',
  },
  {
    year: '2026',
    title: 'Living Legacy',
    text: 'Bridal, daily, and festive collections crafted for moments that outlast trends.',
  },
];

const CRAFT_IMAGES = [
  { src: IMAGES.story, caption: 'Bench craftsmanship' },
  { src: IMAGES.diamond, caption: 'Diamond selection' },
  { src: IMAGES.gold, caption: 'Gold finishing' },
  { src: IMAGES.personalized, caption: 'Personal engraving' },
];

export const About: React.FC = () => {
  return (
    <div id="about-page" className="text-ivory">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={IMAGES.about}
          alt="Lukee Jewels atelier"
          className="absolute inset-0 w-full h-full object-cover animate-kenburns"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white space-y-5 py-24">
          <p className="section-eyebrow text-brand">Our Legacy</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide text-white">
            Uncompromising Standards Since 2012
          </h1>
          <div className="w-14 h-px bg-brand mx-auto" />
          <p className="text-sm sm:text-base text-white/80 font-light max-w-xl mx-auto leading-relaxed">
            Fine jewellery forged with patience, certified brilliance, and the quiet confidence of heirloom design.
          </p>
        </div>
      </section>

      {/* Narrative */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/5] overflow-hidden luxury-shadow"
          >
            <img
              src={IMAGES.story}
              alt="Crafting fine jewellery"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="section-eyebrow">The Brand Story</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">The Soul of Fine Artistry</h2>
            <div className="w-14 h-px bg-brand" />
            <p className="text-muted text-sm leading-relaxed">
              Founded by visionary gemologist Lucas Lukee, our atelier is dedicated to a singular mission:
              crafting breathtaking fine jewellery that bridges modern design and classic, heirloom-grade longevity.
            </p>
            <p className="text-muted text-sm leading-relaxed">
              We reject mass manufacturing. Every piece is individually forged, micro-paved, and hand-finished by
              master goldsmiths. From the balance of a platinum shank to the alignment of diamond prongs, our team
              spends dozens of hours refining each silhouette.
            </p>
            <Link to="/shop" className="btn-primary mt-2">
              Explore the Collection <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <p className="section-eyebrow">What We Stand For</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">Our Values</h2>
            <div className="w-14 h-px bg-brand mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white border border-line p-7 text-center space-y-4 luxury-shadow"
              >
                <div className="w-12 h-12 mx-auto border border-line bg-white text-brand flex items-center justify-center">
                  <v.icon size={22} className="stroke-1" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-ink">{v.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship gallery */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <p className="section-eyebrow">Atelier Moments</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">Craftsmanship</h2>
            <div className="w-14 h-px bg-brand mx-auto" />
            <p className="text-sm text-muted max-w-xl mx-auto">
              From stone selection to final polish — every step is deliberate, measured, and made to last generations.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CRAFT_IMAGES.map((item) => (
              <figure key={item.caption} className="group relative aspect-[3/4] overflow-hidden luxury-shadow">
                <img
                  src={item.src}
                  alt={item.caption}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5">
                  <span className="text-[0.65rem] uppercase tracking-[0.22em] text-white/90">
                    {item.caption}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img
          src={IMAGES.promo}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-6">
          <p className="font-serif text-2xl sm:text-3xl italic font-light leading-relaxed text-white">
            &ldquo;A jewellery purchase is not merely an exchange of material wealth. It is the solidifying of a
            memory, an emotion, and a milestone that will outlive us.&rdquo;
          </p>
          <span className="section-eyebrow text-brand block">— Lucas Lukee, Founder</span>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <p className="section-eyebrow">Milestones</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">Our Journey</h2>
            <div className="w-14 h-px bg-brand mx-auto" />
          </div>
          <ol className="relative space-y-0 border-l border-line ml-3 sm:ml-4">
            {TIMELINE.map((item) => (
              <li key={item.year} className="relative pl-8 sm:pl-10 pb-10 last:pb-0">
                <span className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-brand border-2 border-ivory" />
                <p className="section-eyebrow mb-1">{item.year}</p>
                <h3 className="font-serif text-xl font-semibold text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Client voices */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <p className="section-eyebrow">Client Voices</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">Worn &amp; Loved</h2>
            <div className="w-14 h-px bg-brand mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.name}
                className="bg-white border border-line p-6 space-y-4 luxury-shadow"
              >
                <p className="text-sm text-muted leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <footer className="pt-3 border-t border-line">
                  <p className="font-serif text-lg text-ink">{t.name}</p>
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brand">{t.city}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-ink text-white">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <p className="section-eyebrow text-brand">Begin Your Story</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-white">
            Visit the atelier or shop the vault
          </h2>
          <p className="text-sm text-white/70 max-w-lg mx-auto">
            Book a private consultation with our concierge, or discover certified pieces ready to ship.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to="/contact" className="btn-gold">
              Book Appointment
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] hover:border-brand hover:text-brand transition-all duration-300"
            >
              Shop Collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
