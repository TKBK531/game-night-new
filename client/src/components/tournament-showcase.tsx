import { useQuery } from "@tanstack/react-query";
import { Users, Trophy, Clock } from "lucide-react";

export default function TournamentShowcase() {
  const { data: stats } = useQuery({
    queryKey: ['/api/teams/stats'],
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="tournaments" className="py-20 bg-[hsl(215,28%,17%)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[hsl(185,100%,50%)]">
            Main Events
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Compete in the most popular FPS games with professional setups and amazing prizes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Valorant Tournament Card */}
          <div className="gaming-border rounded-xl p-8 hover:scale-105 transition-transform group">
            <div className="relative mb-6">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Valorant gameplay setup" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-4 left-4 bg-[hsl(261,83%,58%)]/90 px-3 py-1 rounded-full text-sm font-semibold">
                VALORANT
              </div>
            </div>
            
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-[hsl(261,83%,58%)]">
              Valorant Championship
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-300">
                <Users className="text-[hsl(261,83%,58%)] mr-3" />
                5 Players per Team
              </div>
              <div className="flex items-center text-gray-300">
                <Trophy className="text-[hsl(261,83%,58%)] mr-3" />
                ₹50,000 Prize Pool
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="text-[hsl(261,83%,58%)] mr-3" />
                Tournament Format: Single Elimination
              </div>
            </div>
            
            {/* Gaming-style progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Teams Registered</span>
                <span>{stats?.valorant.registered || 0}/{stats?.valorant.total || 32}</span>
              </div>
              <div className="w-full bg-[hsl(215,16%,29%)] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[hsl(261,83%,58%)] to-[hsl(185,100%,50%)] h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${((stats?.valorant.registered || 0) / (stats?.valorant.total || 32)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button 
              onClick={() => scrollToSection('register')}
              className="w-full gaming-button py-3 rounded-lg font-semibold"
            >
              Register for Valorant
            </button>
          </div>

          {/* Call of Duty Tournament Card */}
          <div className="gaming-border rounded-xl p-8 hover:scale-105 transition-transform group">
            <div className="relative mb-6">
              <img 
                src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Call of Duty gameplay setup" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-4 left-4 bg-[hsl(14,100%,60%)]/90 px-3 py-1 rounded-full text-sm font-semibold">
                CALL OF DUTY
              </div>
            </div>
            
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-[hsl(14,100%,60%)]">
              COD Warzone Battle
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-300">
                <Users className="text-[hsl(14,100%,60%)] mr-3" />
                5 Players per Team
              </div>
              <div className="flex items-center text-gray-300">
                <Trophy className="text-[hsl(14,100%,60%)] mr-3" />
                ₹75,000 Prize Pool
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="text-[hsl(14,100%,60%)] mr-3" />
                Tournament Format: Battle Royale
              </div>
            </div>
            
            {/* Gaming-style progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Teams Registered</span>
                <span>{stats?.cod.registered || 0}/{stats?.cod.total || 32}</span>
              </div>
              <div className="w-full bg-[hsl(215,16%,29%)] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[hsl(14,100%,60%)] to-red-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${((stats?.cod.registered || 0) / (stats?.cod.total || 32)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button 
              onClick={() => scrollToSection('register')}
              className="w-full gaming-button py-3 rounded-lg font-semibold"
            >
              Register for COD
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
