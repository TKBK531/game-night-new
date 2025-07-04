import { Headphones, Music, Utensils } from "lucide-react";

export default function FunZone() {
  const activities = [
    {
      icon: Headphones,
      title: "VR Gaming",
      description: "Experience immersive virtual reality gaming with latest VR headsets",
      color: "#ff4654"
    },
    {
      icon: Music,
      title: "Gaming Lounge",
      description: "Relax in our gaming lounge with retro arcade machines and consoles",
      color: "#ff4654"
    },
    {
      icon: Utensils,
      title: "Gaming Cafe",
      description: "Fuel up with gaming-themed food and energy drinks",
      color: "#ff4654"
    }
  ];

  return (
    <section id="funzone" className="py-20 bg-[#1a2332]/50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ba3a46] animate-glow">
            Fun Zone Activities
          </h2>
          <p className="text-xl text-gray-300">
            More than just tournaments - enjoy the complete gaming experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div key={index} className="text-center p-6 gaming-border rounded-xl hover-lift animate-bounce-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${activity.color}20` }}
                >
                  <IconComponent 
                    className="text-3xl" 
                    style={{ color: activity.color }}
                  />
                </div>
                <h3 
                  className="text-xl font-orbitron font-bold mb-3"
                  style={{ color: activity.color }}
                >
                  {activity.title}
                </h3>
                <p className="text-gray-300">{activity.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
