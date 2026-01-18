import Link from 'next/link';
import ParticleBackground from '@/components/ParticleBackground';

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cosmic-primary via-cosmic-secondary to-cosmic-accent animate-fade-in">
          ThinkCompanion
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-slide-up">
          Your persistent personal AI cognitive companion
        </p>
        
        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto animate-slide-up">
          Not just another chatbot. ThinkCompanion remembers your goals, adapts to your learning style, 
          and becomes a better thinking partner the longer you work together.
        </p>
        
        <div className="flex gap-4 justify-center animate-slide-up">
          <Link
            href="/auth/signin"
            className="px-8 py-4 bg-cosmic-primary hover:bg-cosmic-secondary rounded-lg text-white font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-cosmic-primary/50"
          >
            Get Started
          </Link>
          
          <Link
            href="/chat"
            className="px-8 py-4 border-2 border-cosmic-border hover:border-cosmic-primary rounded-lg text-white font-semibold transition-all hover:scale-105"
          >
            Try Demo
          </Link>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-lg bg-cosmic-surface/50 border border-cosmic-border backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-3 text-cosmic-accent">Persistent Memory</h3>
            <p className="text-gray-400">
              Remembers your conversations, goals, and preferences across all sessions.
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-cosmic-surface/50 border border-cosmic-border backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-3 text-cosmic-secondary">Adaptive Learning</h3>
            <p className="text-gray-400">
              Learns your communication style and adapts to help you think better.
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-cosmic-surface/50 border border-cosmic-border backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-3 text-cosmic-primary">Growth Tracking</h3>
            <p className="text-gray-400">
              Tracks your skills, goals, and patterns to support your development.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
