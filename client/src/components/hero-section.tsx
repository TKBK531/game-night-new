import { Trophy, Calendar, Zap, Target, Gamepad2, Cpu, Shield, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(280,100%,70%)]/20 via-[hsl(240,16%,8%)] to-[hsl(180,100%,60%)]/20"></div>
        
        {/* Moving geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-[hsl(280,100%,70%)]/30 rotate-45 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border-2 border-[hsl(180,100%,60%)]/30 rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 border-2 border-[hsl(320,100%,70%)]/30 rotate-45 animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <div className={`relative z-10 text-center max-w-6xl mx-auto px-4 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Main Title */}
        <div className="relative mb-12">
          <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(280,100%,70%)]/20 via-[hsl(180,100%,60%)]/20 to-[hsl(320,100%,70%)]/20 blur-xl rounded-full"></div>
          
          <h1 className="relative text-6xl md:text-8xl font-orbitron font-black mb-6 animate-glow">
            <span className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(180,100%,60%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_hsl(280,100%,70%)]">
              GAME
            </span>
            <br />
            <span className="bg-gradient-to-r from-[hsl(180,100%,60%)] to-[hsl(320,100%,70%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_hsl(320,100%,70%)]">
              NIGHT
            </span>
          </h1>
          
          <div className="text-3xl md:text-5xl font-orbitron font-bold mb-4">
            <span className="bg-gradient-to-r from-[hsl(320,100%,70%)] to-[hsl(280,100%,70%)] bg-clip-text text-transparent animate-pulse-neon">
              REIGNITE 25'
            </span>
          </div>
        </div>

        {/* Subtitle with icons */}
        <div className="mb-12 space-y-4">
          <p className="text-xl md:text-2xl text-gray-300 font-medium">
            <Sparkles className="inline text-[hsl(280,100%,70%)] mr-2" />
            Ultimate Esports Tournament Experience
            <Sparkles className="inline text-[hsl(180,100%,60%)] ml-2" />
          </p>
          <div className="flex justify-center items-center gap-6 text-lg text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="text-[hsl(320,100%,70%)]" />
              One Epic Day
            </div>
            <div className="w-2 h-2 bg-[hsl(280,100%,70%)] rounded-full animate-pulse"></div>
            <div className="flex items-center gap-2">
              <Target className="text-[hsl(180,100%,60%)]" />
              Maximum Action
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <button 
            onClick={() => scrollToSection('register')}
            className="group gaming-button px-10 py-5 rounded-xl font-bold text-xl flex items-center justify-center hover-lift"
          >
            <Trophy className="mr-3 group-hover:animate-bounce" />
            Register Your Team
          </button>
          <button 
            onClick={() => scrollToSection('schedule')}
            className="border-2 border-[hsl(180,100%,60%)] text-[hsl(180,100%,60%)] px-10 py-5 rounded-xl font-bold text-xl hover:bg-[hsl(180,100%,60%)] hover:text-[hsl(240,16%,8%)] transition-all flex items-center justify-center backdrop-blur-sm bg-[hsl(180,100%,60%)]/10 hover-lift"
          >
            <Calendar className="mr-3" />
            View Schedule
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="gaming-border rounded-xl p-6 backdrop-blur-sm bg-[hsl(240,16%,8%)]/50 hover-lift">
            <Gamepad2 className="text-3xl text-[hsl(280,100%,70%)] mx-auto mb-3 animate-pulse" />
            <div className="text-2xl font-orbitron font-bold text-[hsl(280,100%,70%)]">₹1.25L+</div>
            <div className="text-gray-400">Total Prize Pool</div>
          </div>
          <div className="gaming-border rounded-xl p-6 backdrop-blur-sm bg-[hsl(240,16%,8%)]/50 hover-lift">
            <Shield className="text-3xl text-[hsl(180,100%,60%)] mx-auto mb-3 animate-pulse" />
            <div className="text-2xl font-orbitron font-bold text-[hsl(180,100%,60%)]">16 Teams</div>
            <div className="text-gray-400">Elite Competitors</div>
          </div>
          <div className="gaming-border rounded-xl p-6 backdrop-blur-sm bg-[hsl(240,16%,8%)]/50 hover-lift">
            <Cpu className="text-3xl text-[hsl(320,100%,70%)] mx-auto mb-3 animate-pulse" />
            <div className="text-2xl font-orbitron font-bold text-[hsl(320,100%,70%)]">8 Hours</div>
            <div className="text-gray-400">Non-Stop Action</div>
          </div>
        </div>
      </div>

      {/* Floating Gaming Elements */}
      <div className="absolute bottom-10 left-10 text-[hsl(280,100%,70%)] animate-float">
        <Zap className="text-4xl" />
      </div>
      <div className="absolute top-20 right-10 text-[hsl(180,100%,60%)] animate-float" style={{ animationDelay: '1s' }}>
        <Target className="text-4xl" />
      </div>
      <div className="absolute bottom-20 right-20 text-[hsl(320,100%,70%)] animate-float" style={{ animationDelay: '2s' }}>
        <Shield className="text-3xl" />
      </div>
    </section>
  );
}
