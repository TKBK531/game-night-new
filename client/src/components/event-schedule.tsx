import { Clock, Play, Crosshair, Trophy, Medal, Star } from "lucide-react";

export default function EventSchedule() {
  const scheduleData = [
    {
      day: "Day 1",
      date: "Saturday, December 16, 2023",
      events: [
        {
          time: "9:00 AM",
          title: "Registration & Check-in",
          icon: Clock,
          color: "hsl(185,100%,50%)"
        },
        {
          time: "11:00 AM",
          title: "Valorant Qualifiers",
          icon: Play,
          color: "hsl(261,83%,58%)"
        },
        {
          time: "2:00 PM",
          title: "COD Preliminary Rounds",
          icon: Crosshair,
          color: "hsl(14,100%,60%)"
        }
      ]
    },
    {
      day: "Day 2",
      date: "Sunday, December 17, 2023",
      events: [
        {
          time: "10:00 AM",
          title: "Valorant Finals",
          icon: Trophy,
          color: "hsl(261,83%,58%)"
        },
        {
          time: "1:00 PM",
          title: "COD Championship",
          icon: Medal,
          color: "hsl(14,100%,60%)"
        },
        {
          time: "5:00 PM",
          title: "Award Ceremony",
          icon: Star,
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
            Two days of intense gaming action
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {scheduleData.map((day, dayIndex) => (
            <div key={dayIndex} className="gaming-border rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-orbitron font-bold text-[hsl(185,100%,50%)] mb-2">
                  {day.day}
                </h3>
                <p className="text-gray-400">{day.date}</p>
              </div>
              
              <div className="space-y-4">
                {day.events.map((event, eventIndex) => {
                  const IconComponent = event.icon;
                  return (
                    <div key={eventIndex} className="flex items-center p-4 bg-[hsl(215,16%,29%)]/50 rounded-lg">
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
                          className="font-semibold"
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
