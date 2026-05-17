"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/site-data";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

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
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1">
            Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Contact{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Us
            </span>
          </h1>
          <p className="text-lg text-amber-100/80 max-w-2xl mx-auto">
            Have a question or ready to plan your retreat? Reach out to us and
            we&rsquo;ll be happy to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Contact Information
                </h2>
                <p className="text-gray-500">
                  Reach us by phone, email, or visit us in person.
                </p>
              </div>

              <div className="space-y-5">
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/50 flex items-center justify-center text-amber-800">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-gray-700 hover:text-amber-800 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-700">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200">
                <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm text-amber-700 font-medium">
                      Atwima Boko, Kumasi
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Map integration coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="border-0 ring-0 shadow-lg">
                <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Send Us a Message
                  </h2>

                  <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="Your first name"
                          className="border-gray-200 focus-visible:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Your last name"
                          className="border-gray-200 focus-visible:ring-amber-500"
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
                          className="border-gray-200 focus-visible:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+233 XXX XXX XXX"
                          className="border-gray-200 focus-visible:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What is this about?"
                        className="border-gray-200 focus-visible:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your retreat plans, group size, preferred dates, or any questions..."
                        rows={5}
                        className="border-gray-200 focus-visible:ring-amber-500 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-amber-800 hover:bg-amber-900 text-white gap-2 h-11"
                    >
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                      We typically respond within 24 hours during business days.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
