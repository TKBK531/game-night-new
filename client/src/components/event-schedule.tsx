import { Clock, Play, Crosshair, Trophy, Medal, Star } from "lucide-react";
import { siteConfig } from "../../../shared/config";

export default function EventSchedule() {
  const scheduleData = [
    {
      day: siteConfig.schedule.eventDayName,
      date: siteConfig.schedule.eventDateFormatted,
      events: siteConfig.timeline.map((item, index) => ({
        time: item.time,
        title: item.event,
        description: item.description,
        icon: index % 4 === 0 ? Clock : index % 4 === 1 ? Star : index % 4 === 2 ? Play : Crosshair,
        color: index % 2 === 0 ? "#ff4654" : "#ba3a46"
      }))
    }
  ];

  return (
    <section id="schedule" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ffffff] animate-glow">
            Event Schedule
          </h2>
          <p className="text-xl text-gray-300">
            {siteConfig.event.description} - from {siteConfig.schedule.eventStartTime} to {siteConfig.schedule.eventEndTime}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {scheduleData.map((day, dayIndex) => (
            <div key={dayIndex} className="gaming-border rounded-xl p-8 hover-lift animate-slide-up">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-orbitron font-bold text-[#ff4654] mb-2">
                  {day.day}
                </h3>
                <p className="text-lg text-gray-400">{day.date}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {day.events.map((event, eventIndex) => {
                  const IconComponent = event.icon;
                  return (
                    <div key={eventIndex} className="flex items-center p-4 bg-[#242d3d]/50 rounded-lg hover:bg-[#242d3d]/70 transition-all hover-lift">
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center mr-4"
                        style={{ backgroundColor: `${event.color}20` }}
                      >
                        <IconComponent
                          className="text-xl"
                          style={{ color: event.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className="font-semibold text-lg"
                          style={{ color: event.color }}
                        >
                          {event.time}
                        </div>
                        <div className="text-gray-300 font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-gray-400 text-sm mt-1">{event.description}</div>
                        )}
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
