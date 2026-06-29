"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 };
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 200, damping: 25, mass: 0.5 };

function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ ...SPRING, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, className, direction = "left", delay = 0 }: { children: ReactNode; className?: string; direction?: "left" | "right"; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const x = direction === "left" ? -60 : 60;
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x }} transition={{ ...SPRING, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Phone",
    value: SITE.phone,
    href: `tel:${SITE.phone.replace(/\s/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  {
    icon: MapPin,
    label: "Address",
    value: SITE.fullAddress,
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Mon - Sat: 8:00 AM - 6:00 PM",
  },
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
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.contact}
          alt="Contact WPTC"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/50 to-stone-950/80" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-400">
              <span className="w-8 h-px bg-current" />
              Get in Touch
              <span className="w-8 h-px bg-current" />
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Contact{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Us
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Have a question or ready to plan your retreat? Reach out to us and
            we&rsquo;ll be happy to help.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <SlideIn direction="left" className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-900 mb-2">
                  Contact Information
                </h2>
                <p className="text-stone-500">
                  Reach us by phone, email, or visit us in person.
                </p>
              </div>

              <div className="space-y-5">
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-700">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-stone-700 hover:text-amber-700 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-stone-700">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 relative h-[250px] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={IMAGES.hero.home}
                  alt="Warriors Prayer Tower Complex"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-sm font-semibold text-white">
                    {SITE.address}
                  </p>
                  <p className="text-xs text-amber-300/80">Ghana, West Africa</p>
                </div>
              </div>
            </SlideIn>

            {/* Contact Form */}
            <SlideIn direction="right" delay={0.15} className="lg:col-span-3">
              <Card className="border-0 ring-0 shadow-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900 mb-6">
                    Send Us a Message
                  </h2>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="Your first name"
                          className="border-stone-200 focus-visible:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Your last name"
                          className="border-stone-200 focus-visible:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          className="border-stone-200 focus-visible:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+233 XXX XXX XXX"
                          className="border-stone-200 focus-visible:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What is this about?"
                        className="border-stone-200 focus-visible:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your retreat plans, group size, preferred dates, or any questions..."
                        rows={5}
                        className="border-stone-200 focus-visible:ring-amber-500 resize-none"
                      />
                    </div>

                    {sent && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Message sent! We&rsquo;ll get back to you within 24 hours.
                      </div>
                    )}

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={SPRING_SNAPPY}>
                      <Button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-stone-900 hover:bg-stone-800 text-white gap-2 h-11"
                      >
                        {sending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Sending...</>
                        ) : sent ? (
                          <><CheckCircle className="h-4 w-4" />Sent!</>
                        ) : (
                          <><Send className="h-4 w-4" />Send Message</>
                        )}
                      </Button>
                    </motion.div>

                    <p className="text-xs text-stone-400 text-center">
                      We typically respond within 24 hours during business days.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </SlideIn>
          </div>
        </div>
      </section>
    </>
  );
}
