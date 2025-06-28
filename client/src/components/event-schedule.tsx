import { Clock, Play, Crosshair, Trophy, Medal, Star } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "../../../shared/config";
import { ScrollReveal } from "./ui/scroll-reveal";
import { staggerVariants } from "@/hooks/use-scroll-reveal";

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
        <ScrollReveal variant="fadeInUp">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ffffff]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Event Schedule
            </motion.h2>
            <p className="text-xl text-gray-300">
              {siteConfig.event.description} - from {siteConfig.schedule.eventStartTime} to {siteConfig.schedule.eventEndTime}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" delay={0.3}>
          <div className="max-w-4xl mx-auto">
            {scheduleData.map((day, dayIndex) => (
              <motion.div 
                key={dayIndex} 
                className="gaming-border rounded-xl p-8 hover-lift"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-3xl font-orbitron font-bold text-[#ff4654] mb-2">
                    {day.day}
                  </h3>
                  <p className="text-lg text-gray-400">{day.date}</p>
                </motion.div>

                <motion.div 
                  className="grid md:grid-cols-2 gap-4"
                  variants={staggerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                >
                  {day.events.map((event, eventIndex) => {
                    const IconComponent = event.icon;
                    return (
                      <motion.div 
                        key={eventIndex} 
                        className="flex items-center p-4 bg-[#242d3d]/50 rounded-lg hover:bg-[#242d3d]/70 transition-all hover-lift"
                        variants={{
                          hidden: { opacity: 0, x: eventIndex % 2 === 0 ? -50 : 50, scale: 0.9 },
                          visible: { 
                            opacity: 1, 
                            x: 0, 
                            scale: 1,
                            transition: { duration: 0.6, ease: "easeOut" }
                          }
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          backgroundColor: "rgba(36, 45, 61, 0.8)",
                          transition: { duration: 0.2 }
                        }}
                      >
                        <motion.div
                          className="w-16 h-16 rounded-lg flex items-center justify-center mr-4"
                          style={{ backgroundColor: `${event.color}20` }}
                          whileHover={{ 
                            scale: 1.1,
                            backgroundColor: `${event.color}30`
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            animate={{ 
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              ease: "easeInOut",
                              delay: eventIndex * 0.2
                            }}
                          >
                            <IconComponent
                              className="text-xl"
                              style={{ color: event.color }}
                            />
                          </motion.div>
                        </motion.div>
                        <motion.div 
                          className="flex-1"
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <motion.div
                            className="font-semibold text-lg"
                            style={{ color: event.color }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {event.time}
                          </motion.div>
                          <div className="text-gray-300 font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-gray-400 text-sm mt-1">{event.description}</div>
                          )}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
