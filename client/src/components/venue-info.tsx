import { MapPin, Calendar, Monitor, Wifi } from "lucide-react";
import { siteConfig } from "../../../shared/config";

export default function VenueInfo() {
  const venueDetails = [
    {
      icon: MapPin,
      title: "Address",
      description: `${siteConfig.venue.address}\n${siteConfig.venue.city}, ${siteConfig.venue.state} ${siteConfig.venue.pincode}`,
      color: "#ffffff"
    },
    {
      icon: Calendar,
      title: "Event Dates",
      description: `${siteConfig.schedule.eventDate}\n${siteConfig.schedule.eventStartTime} - ${siteConfig.schedule.eventEndTime}`,
      color: "#ff4654"
    },
    {
      icon: Monitor,
      title: "Gaming Setup",
      description: "High-end gaming PCs with RTX 4080\n144Hz monitors • Gaming peripherals provided",
      color: "#ba3a46"
    },
    {
      icon: Wifi,
      title: "Network",
      description: "Dedicated gaming network\nUltra-low latency • 1Gbps internet",
      color: "#ff4654"
    }
  ];

  return (
    <section className="py-20 bg-[#1a2332]/50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ffffff] animate-glow">
            Venue Information
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-bounce-in">
            <img
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Esports tournament setup"
              className="rounded-xl shadow-2xl hover-lift"
            />
          </div>

          <div>
            <h3 className="text-3xl font-orbitron font-bold mb-6 text-[#ff4654]">
              {siteConfig.venue.name}
            </h3>

            <div className="space-y-4">
              {venueDetails.map((detail, index) => {
                const IconComponent = detail.icon;
                return (
                  <div key={index} className="flex items-start">
                    <IconComponent
                      className="text-xl mr-4 mt-1"
                      style={{ color: detail.color }}
                    />
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: detail.color }}
                      >
                        {detail.title}
                      </div>
                      <div className="text-gray-300 whitespace-pre-line">
                        {detail.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
