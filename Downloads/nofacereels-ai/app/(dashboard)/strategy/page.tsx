// app/page.tsx
import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { Sparkles, Video, Zap, Globe, Download, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg purple-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Nofacereels <span className="text-gradient">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="btn-primary text-sm py-2 px-5">
                Get Started Free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 gradient-bg">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Faceless Video Generation
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Create Viral Videos{' '}
            <span className="text-gradient">Without Showing</span>{' '}
            Your Face
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate unlimited AI-powered short-form videos for TikTok, Instagram Reels, and YouTube Shorts.
            Script → Voice → Images → Video. All automated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="btn-primary text-lg py-4 px-8 inline-flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Start Creating for Free
            </Link>
            <Link href="#features" className="btn-secondary text-lg py-4 px-8">
              See How It Works
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required · Unlimited videos</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600">From script to downloadable video in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI Script Generation',
                desc: 'Claude AI writes engaging scripts for any niche — scary stories, motivational content, true crime, and more.',
              },
              {
                icon: <Video className="w-6 h-6" />,
                title: 'AI Image & Video Scenes',
                desc: 'Replicate generates stunning images in 7 art styles: Comic, Ghibli, Disney, Pixel Art, and more.',
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Human-Quality Voiceover',
                desc: 'ElevenLabs converts your script to natural-sounding voiceovers with 4 voice options.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Auto Video Composition',
                desc: 'FFmpeg automatically composites images + voice + music + captions into a ready-to-post MP4.',
              },
              {
                icon: <Download className="w-6 h-6" />,
                title: 'One-Click Download',
                desc: 'Download your finished video and post it anywhere. No platform restrictions or auto-posting required.',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'AI Posting Strategy',
                desc: 'Get niche-specific posting schedules: best times, best days, and weekly calendar for maximum growth.',
              },
            ].map((f) => (
              <div key={f.title} className="card-hover p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niches */}
      <section className="py-24 px-6 gradient-bg">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">12 Proven Niches + Custom</h2>
          <p className="text-gray-600 mb-12">Pick a pre-built niche or define your own</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              '😱 Scary Stories', '🏛️ Historical Figures', '⚡ Greek Mythology',
              '📰 Important Events', '🔍 True Crime', '🧘 Stoic Motivation',
              '💝 Good Morals', '📖 Biblical Stories', '🎌 Anime Stories',
              '🏫 School Gossip', '💎 Heists', '🤝 Acts of Kindness', '✨ Custom Niche',
            ].map((niche) => (
              <span key={niche} className="bg-white border border-purple-200 text-purple-700 font-medium px-4 py-2 rounded-full text-sm shadow-sm">
                {niche}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="purple-gradient rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Go Viral?</h2>
            <p className="text-purple-100 text-lg mb-8">
              Join thousands of creators building faceless video channels with AI.
            </p>
            <Link href="/sign-up" className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-8 py-4 rounded-xl hover:bg-purple-50 transition-colors">
              <Sparkles className="w-5 h-5" />
              Create Your First Video Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-gray-400 text-sm">
        <p>© 2025 Nofacereels AI. Built with Next.js, Supabase, Clerk, and Anthropic.</p>
      </footer>
    </div>
  )
}
