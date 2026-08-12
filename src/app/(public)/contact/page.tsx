"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 };

function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ ...SPRING, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const CONTACT_INFO = [
  { icon: Phone, label: "Phone", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
  { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: MapPin, label: "Address", value: SITE.fullAddress },
  { icon: Clock, label: "Office Hours", value: "Mon - Sat: 8:00 AM - 6:00 PM" },
];

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setSent(false);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden bg-luxury">
        <Image src={IMAGES.hero.contact} alt="Contact Us" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Get in Touch</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-4">
              Contact Us
            </h1>
            <p className="text-warm-muted text-base max-w-2xl mx-auto">
              Have a question or ready to plan your retreat? Reach out and we&rsquo;ll be happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28 bg-luxury">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
            {/* Contact Info */}
            <FadeIn className="lg:col-span-2 space-y-6">
              <div>
                <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Contact</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white mb-2">
                  Contact Information
                </h2>
                <div className="w-10 h-px bg-gold/25 mb-4" />
                <p className="text-warm-muted text-sm">Reach us by phone, email, or visit us in person.</p>
              </div>

              <div className="space-y-5">
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 border border-gold/15 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-gold/50" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gold/50 uppercase tracking-[0.15em] font-semibold mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-warm-white/80 hover:text-gold transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm text-warm-white/80">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 relative h-[220px] overflow-hidden border border-gold/10">
                <Image src={IMAGES.hero.home} alt="WPTC" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-sm font-semibold text-warm-white">{SITE.address}</p>
                  <p className="text-xs text-warm-white/50">Ghana, West Africa</p>
                </div>
              </div>
            </FadeIn>

            {/* Form */}
            <FadeIn delay={0.1} className="lg:col-span-3">
              <div className="bg-luxury-card border border-gold/10 overflow-hidden">
                <div className="h-px bg-gold/30" />
                <div className="p-6 md:p-8">
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white mb-6">Send Us a Message</h2>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-warm-muted text-xs tracking-wide">First Name</Label>
                        <Input id="firstName" placeholder="Your first name" className="bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-warm-muted text-xs tracking-wide">Last Name</Label>
                        <Input id="lastName" placeholder="Your last name" className="bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-warm-muted text-xs tracking-wide">Email</Label>
                        <Input id="email" type="email" placeholder="your@email.com" className="bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-warm-muted text-xs tracking-wide">Phone</Label>
                        <Input id="phone" type="tel" placeholder="+233 XXX XXX XXX" className="bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-warm-muted text-xs tracking-wide">Subject</Label>
                      <Input id="subject" placeholder="What is this about?" className="bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-warm-muted text-xs tracking-wide">Message</Label>
                      <Textarea id="message" placeholder="Tell us about your retreat plans, group size, preferred dates, or any questions..." rows={5} className="bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30 resize-none" />
                    </div>

                    {sent && (
                      <div className="flex items-center gap-2 p-3 border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-400">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Message sent! We&rsquo;ll get back to you within 24 hours.
                      </div>
                    )}

                    <Button type="submit" disabled={sending} className="w-full bg-gold text-luxury hover:bg-gold-bright gap-2 h-11 font-semibold text-[11px] tracking-[0.1em] uppercase">
                      {sending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Sending Message...</>
                      ) : sent ? (
                        <><CheckCircle className="h-4 w-4" />Sent!</>
                      ) : (
                        <><Send className="h-4 w-4" />Send Message</>
                      )}
                    </Button>

                    <p className="text-xs text-warm-muted/50 text-center">
                      We typically respond within 24 hours during business days.
                    </p>
                  </form>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
