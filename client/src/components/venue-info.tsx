import { MapPin, Calendar, Monitor, Wifi } from "lucide-react";

export default function VenueInfo() {
  const venueDetails = [
    {
      icon: MapPin,
      title: "Address",
      description: "123 Gaming Street, Tech City\nMumbai, Maharashtra 400001",
      color: "hsl(158,64%,52%)"
    },
    {
      icon: Calendar,
      title: "Event Dates",
      description: "December 16-17, 2023\nTwo days of non-stop gaming",
      color: "hsl(261,83%,58%)"
    },
    {
      icon: Monitor,
      title: "Gaming Setup",
      description: "High-end gaming PCs with RTX 4080\n144Hz monitors • Gaming peripherals provided",
      color: "hsl(14,100%,60%)"
    },
    {
      icon: Wifi,
      title: "Network",
      description: "Dedicated gaming network\nUltra-low latency • 1Gbps internet",
      color: "hsl(185,100%,50%)"
    }
  ];

  return (
    <section className="py-20 bg-[hsl(215,28%,17%)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[hsl(158,64%,52%)]">
            Venue Information
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Esports tournament setup" 
              className="rounded-xl shadow-2xl"
            />
          </div>
          
          <div>
            <h3 className="text-3xl font-orbitron font-bold mb-6 text-[hsl(185,100%,50%)]">
              Gaming Arena Complex
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
