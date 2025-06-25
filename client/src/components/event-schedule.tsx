import { Clock, Play, Crosshair, Trophy, Medal, Star } from "lucide-react";

export default function EventSchedule() {
  const scheduleData = [
    {
      day: "Game Day",
      date: "Saturday, December 16, 2023",
      events: [
        {
          time: "9:00 AM",
          title: "Registration & Check-in",
          icon: Clock,
          color: "hsl(185,100%,50%)"
        },
        {
          time: "10:00 AM",
          title: "Opening Ceremony",
          icon: Star,
          color: "hsl(158,64%,52%)"
        },
        {
          time: "11:00 AM",
          title: "Valorant Quarter Finals",
          icon: Play,
          color: "hsl(261,83%,58%)"
        },
        {
          time: "1:00 PM",
          title: "Lunch Break & Fun Zone",
          icon: Clock,
          color: "hsl(185,100%,50%)"
        },
        {
          time: "2:00 PM",
          title: "COD Quarter Finals",
          icon: Crosshair,
          color: "hsl(14,100%,60%)"
        },
        {
          time: "3:30 PM",
          title: "Valorant Semi Finals",
          icon: Play,
          color: "hsl(261,83%,58%)"
        },
        {
          time: "4:30 PM",
          title: "COD Semi Finals",
          icon: Crosshair,
          color: "hsl(14,100%,60%)"
        },
        {
          time: "5:30 PM",
          title: "Grand Finals & Awards",
          icon: Trophy,
          color: "hsl(158,64%,52%)"
        }
      ]
    }
  ];

  return (
    <section id="schedule" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[hsl(158,64%,52%)]">
            Event Schedule
          </h2>
          <p className="text-xl text-gray-300">
            One epic day of non-stop gaming action - 8 hours of pure adrenaline
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {scheduleData.map((day, dayIndex) => (
            <div key={dayIndex} className="gaming-border rounded-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-orbitron font-bold text-[hsl(185,100%,50%)] mb-2">
                  {day.day}
                </h3>
                <p className="text-lg text-gray-400">{day.date}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {day.events.map((event, eventIndex) => {
                  const IconComponent = event.icon;
                  return (
                    <div key={eventIndex} className="flex items-center p-4 bg-[hsl(215,16%,29%)]/50 rounded-lg hover:bg-[hsl(215,16%,29%)]/70 transition-all">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center mr-4"
                        style={{ backgroundColor: `${event.color}20` }}
                      >
                        <IconComponent 
                          className="text-xl" 
                          style={{ color: event.color }}
                        />
                      </div>
                      <div>
                        <div 
                          className="font-semibold text-lg"
                          style={{ color: event.color }}
                        >
                          {event.time}
                        </div>
                        <div className="text-gray-300">{event.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
