import { Trophy, Calendar, Wifi, Crosshair } from "lucide-react";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
          alt="Gaming event atmosphere" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(221,39%,11%)] via-[hsl(221,39%,11%)]/70 to-transparent"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="relative mb-8">
          <h1 className="text-5xl md:text-7xl font-orbitron font-black mb-4 animate-glow relative">
            <span className="text-[hsl(185,100%,50%)] drop-shadow-[0_0_20px_hsl(185,100%,50%)]">GAME</span>
            <span className="text-[hsl(14,100%,60%)] drop-shadow-[0_0_20px_hsl(14,100%,60%)]"> NIGHT</span>
          </h1>
          <div className="text-2xl md:text-4xl font-orbitron font-bold text-[hsl(261,83%,58%)] animate-pulse-neon">
            REIGNITE 25'
          </div>
          {/* Gaming decorative elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-l-4 border-t-4 border-[hsl(185,100%,50%)] animate-pulse"></div>
          <div className="absolute -top-4 -right-4 w-8 h-8 border-r-4 border-t-4 border-[hsl(14,100%,60%)] animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-4 border-b-4 border-[hsl(261,83%,58%)] animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-4 border-b-4 border-[hsl(158,64%,52%)] animate-pulse"></div>
        </div>
        <p className="text-lg md:text-xl mb-8 text-gray-300 font-semibold">
          Ultimate Esports Tournament Experience • One Day • Maximum Action
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => scrollToSection('register')}
            className="gaming-button px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center"
          >
            <Trophy className="mr-2" />
            Register Your Team
          </button>
          <button 
            onClick={() => scrollToSection('schedule')}
            className="border-2 border-[hsl(185,100%,50%)] text-[hsl(185,100%,50%)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[hsl(185,100%,50%)] hover:text-[hsl(221,39%,11%)] transition-all flex items-center justify-center"
          >
            <Calendar className="mr-2" />
            View Schedule
          </button>
        </div>
      </div>

      {/* Floating Gaming Elements */}
      <div className="absolute bottom-10 left-10 text-[hsl(158,64%,52%)] animate-pulse">
        <Wifi className="text-3xl" />
      </div>
      <div className="absolute top-20 right-10 text-[hsl(261,83%,58%)] animate-pulse">
        <Crosshair className="text-3xl" />
      </div>
    </section>
  );
}
