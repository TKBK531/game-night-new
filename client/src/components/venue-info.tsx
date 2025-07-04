import { MapPin, Calendar, Monitor, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "../../../shared/config";
import { ScrollReveal } from "./ui/scroll-reveal";
import { staggerVariants } from "@/hooks/use-scroll-reveal";

export default function VenueInfo() {
  const venueDetails = [
    {
      icon: MapPin,
      title: "Address",
      description: `${siteConfig.venue.address}\n${siteConfig.venue.city}, ${siteConfig.venue.state} ${siteConfig.venue.pincode}`,
      color: "#ff4654"
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
    <section className="py-20 bg-[#1a2332]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fadeInUp">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ffffff]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Venue Information
            </motion.h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal variant="fadeInLeft" delay={0.2}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Esports tournament setup"
                className="rounded-xl shadow-2xl hover-lift"
              />
            </motion.div>
          </ScrollReveal>

          <ScrollReveal variant="fadeInRight" delay={0.4}>
            <div>
              <motion.h3
                className="text-3xl font-orbitron font-bold mb-6 text-[#ff4654]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {siteConfig.venue.name}
              </motion.h3>

              <motion.div
                className="space-y-4"
                variants={staggerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {venueDetails.map((detail, index) => {
                  const IconComponent = detail.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex items-start"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.6, ease: "easeOut" }
                        }
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                      >
                        <IconComponent
                          className="text-xl mr-4 mt-1"
                          style={{ color: detail.color }}
                        />
                      </motion.div>
                      <div>
                        <motion.div
                          className="font-semibold"
                          style={{ color: detail.color }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {detail.title}
                        </motion.div>
                        <div className="text-gray-300 whitespace-pre-line">
                          {detail.description}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
