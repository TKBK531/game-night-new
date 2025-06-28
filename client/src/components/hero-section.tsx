import { Trophy, Calendar, Zap, Target, Gamepad2, Cpu, Shield, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "../../../shared/config";

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
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff4654]/20 via-[#111823] to-[#ba3a46]/20"></div>

        {/* Moving geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-[#ff4654]/30 rotate-45 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border-2 border-[#ba3a46]/30 rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 border-2 border-[#ff4654]/30 rotate-45 animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className={`relative z-10 text-center max-w-6xl mx-auto px-4 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Main Title */}
        <div className="relative mb-12 animate-slide-up">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#ff4654]/20 via-[#ba3a46]/20 to-[#ff4654]/20 blur-xl rounded-full"></div>

          <h1 className="relative text-6xl md:text-8xl font-orbitron font-black mb-6 animate-glow">
            <span className="bg-gradient-to-r from-[#ff4654] to-[#ffffff] bg-clip-text text-transparent drop-shadow-[0_0_30px_#ff4654]">
              {siteConfig.event.name.split(' ')[0]}
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#ffffff] to-[#ba3a46] bg-clip-text text-transparent drop-shadow-[0_0_30px_#ba3a46]">
              {siteConfig.event.name.split(' ')[1]} {siteConfig.event.year}
            </span>
          </h1>

          <div className="text-3xl md:text-5xl font-orbitron font-bold mb-4">
            <span className="bg-gradient-to-r from-[#ba3a46] to-[#ff4654] bg-clip-text text-transparent animate-pulse-neon">
              {siteConfig.event.title}
            </span>
          </div>
        </div>

        {/* Subtitle with icons */}
        <div className="mb-12 space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-xl md:text-2xl text-gray-300 font-medium">
            <Sparkles className="inline text-[#ff4654] mr-2" />
            {siteConfig.event.subtitle}
            <Sparkles className="inline text-[#ba3a46] ml-2" />
          </p>
          <div className="flex justify-center items-center gap-6 text-lg text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="text-[#ba3a46]" />
              {siteConfig.schedule.eventDate}
            </div>
            <div className="w-2 h-2 bg-[#ff4654] rounded-full animate-pulse"></div>
            <div className="flex items-center gap-2">
              <Target className="text-[#ff4654]" />
              {siteConfig.event.description}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => scrollToSection('register')}
            className="group gaming-button px-10 py-5 rounded-xl font-bold text-xl flex items-center justify-center hover-lift"
          >
            <Trophy className="mr-3 group-hover:animate-bounce" />
            Register Your Team
          </button>
          <button
            onClick={() => scrollToSection('schedule')}
            className="border-2 border-[#ff4654] text-[#ff4654] px-10 py-5 rounded-xl font-bold text-xl hover:bg-[#ff4654] hover:text-[#ffffff] transition-all flex items-center justify-center backdrop-blur-sm bg-[#ff4654]/10 hover-lift"
          >
            <Calendar className="mr-3" />
            View Schedule
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {siteConfig.heroStats.map((stat, index) => {
            // Calculate dynamic values
            let displayValue = "";
            let IconComponent;

            switch (stat.icon) {
              case "Gamepad2":
                IconComponent = Gamepad2;
                displayValue = Object.values(siteConfig.tournaments).reduce((total, tournament) => {
                  const prizeAmount = parseInt(tournament.prizePool.replace(/[LKR,\s]/g, ''));
                  return total + prizeAmount;
                }, 0).toLocaleString('en-LK') + " LKR+";
                break;
              case "Shield":
                IconComponent = Shield;
                displayValue = Object.values(siteConfig.tournaments).reduce((total, tournament) => total + tournament.maxTeams, 0) + " Teams";
                break;
              case "Cpu":
                IconComponent = Cpu;
                displayValue = `${siteConfig.schedule.eventStartTime} - ${siteConfig.schedule.eventEndTime}`;
                break;
              default:
                IconComponent = Gamepad2;
                displayValue = stat.value;
            }

            return (
              <div
                key={index}
                className={`gaming-border rounded-xl p-6 backdrop-blur-sm bg-[#111823]/50 hover-lift ${index === 0 ? 'animate-slide-in-left' :
                  index === 1 ? 'animate-slide-up' :
                    'animate-slide-in-right'
                  }`}
                style={{ animationDelay: stat.animationDelay }}
              >
                <IconComponent className="text-3xl mx-auto mb-3 animate-pulse" style={{ color: stat.color }} />
                <div className="text-2xl font-orbitron font-bold" style={{ color: stat.color }}>
                  {displayValue}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Gaming Elements */}
      <div className="absolute bottom-10 left-10 text-[#ff4654] animate-float">
        <Zap className="text-4xl" />
      </div>
      <div className="absolute top-20 right-10 text-[#ffffff] animate-float" style={{ animationDelay: '1s' }}>
        <Target className="text-4xl" />
      </div>
      <div className="absolute bottom-20 right-20 text-[#ba3a46] animate-float" style={{ animationDelay: '2s' }}>
        <Shield className="text-3xl" />
      </div>
    </section>
  );
}
