import { Headphones, Music, Utensils } from "lucide-react";

export default function FunZone() {
  const activities = [
    {
      icon: Headphones,
      title: "VR Gaming",
      description: "Experience immersive virtual reality gaming with latest VR headsets",
      color: "hsl(185,100%,50%)"
    },
    {
      icon: Music,
      title: "Gaming Lounge",
      description: "Relax in our gaming lounge with retro arcade machines and consoles",
      color: "hsl(261,83%,58%)"
    },
    {
      icon: Utensils,
      title: "Gaming Cafe",
      description: "Fuel up with gaming-themed food and energy drinks",
      color: "hsl(158,64%,52%)"
    }
  ];

  return (
    <section id="funzone" className="py-20 bg-[hsl(215,28%,17%)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[hsl(14,100%,60%)]">
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
              <div key={index} className="text-center p-6 gaming-border rounded-xl">
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
