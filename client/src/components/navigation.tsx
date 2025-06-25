import { useState } from "react";
import { Gamepad2, Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-[hsl(215,28%,17%)]/90 backdrop-blur-sm border-b border-[hsl(185,100%,50%)]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-orbitron font-bold animate-glow relative">
              <Gamepad2 className="inline mr-2 text-[hsl(185,100%,50%)]" />
              <span className="text-[hsl(185,100%,50%)]">GAME</span>
              <span className="text-[hsl(14,100%,60%)]"> NIGHT</span>
              <div className="text-xs text-[hsl(261,83%,58%)] font-bold">REIGNITE 25'</div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('tournaments')}
              className="hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer"
            >
              Tournaments
            </button>
            <button 
              onClick={() => scrollToSection('schedule')}
              className="hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer"
            >
              Schedule
            </button>
            <button 
              onClick={() => scrollToSection('funzone')}
              className="hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer"
            >
              Fun Zone
            </button>
            <button 
              onClick={() => scrollToSection('game')}
              className="hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer"
            >
              Game
            </button>
            <button 
              onClick={() => scrollToSection('register')}
              className="hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer"
            >
              Register
            </button>
          </div>
          
          <button 
            className="md:hidden text-[hsl(185,100%,50%)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => scrollToSection('tournaments')}
                className="text-left hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer py-2"
              >
                Tournaments
              </button>
              <button 
                onClick={() => scrollToSection('schedule')}
                className="text-left hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer py-2"
              >
                Schedule
              </button>
              <button 
                onClick={() => scrollToSection('funzone')}
                className="text-left hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer py-2"
              >
                Fun Zone
              </button>
              <button 
                onClick={() => scrollToSection('game')}
                className="text-left hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer py-2"
              >
                Game
              </button>
              <button 
                onClick={() => scrollToSection('register')}
                className="text-left hover:text-[hsl(185,100%,50%)] transition-colors cursor-pointer py-2"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
