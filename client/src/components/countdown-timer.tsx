import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, MapPin, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { siteConfig } from "../../../shared/config";
import { ScrollReveal } from "./ui/scroll-reveal";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEventToday, setIsEventToday] = useState(false);

  // Fetch team statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/teams/stats'],
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date(`${siteConfig.schedule.eventDate} ${siteConfig.schedule.eventStartTime}`);
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsEventToday(false);
      } else {
        // Event has started or passed
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEventToday(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: "Days", value: timeLeft.days, color: "#ff4654" },
    { label: "Hours", value: timeLeft.hours, color: "#ba3a46" },
    { label: "Minutes", value: timeLeft.minutes, color: "#ff6b6b" },
    { label: "Seconds", value: timeLeft.seconds, color: "#ff9999" },
  ];

  return (
    <section id="countdown" className="py-20 bg-gradient-to-br from-[#0a0f1a] via-[#1a2332] to-[#0a0f1a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fadeInUp">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ff4654]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {isEventToday ? "Event is Live!" : "Event Countdown"}
            </motion.h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {isEventToday
                ? "The gaming tournament has begun! Join us for an epic experience!"
                : "Registration is now closed. Get ready for the ultimate gaming experience!"
              }
            </p>
          </div>
        </ScrollReveal>

        {!isEventToday && (
          <ScrollReveal variant="scaleIn" delay={0.3}>
            <motion.div
              className="gaming-border rounded-xl p-8 mb-12"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Countdown Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {timeUnits.map((unit, index) => (
                  <motion.div
                    key={unit.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <motion.div
                      className="gaming-border rounded-lg p-6 mb-3"
                      style={{ borderColor: unit.color }}
                      animate={{
                        boxShadow: [
                          `0 0 0px ${unit.color}`,
                          `0 0 20px ${unit.color}40`,
                          `0 0 0px ${unit.color}`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="text-4xl md:text-5xl font-orbitron font-bold"
                        style={{ color: unit.color }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {unit.value.toString().padStart(2, '0')}
                      </motion.div>
                    </motion.div>
                    <div className="text-lg font-semibold text-gray-300">{unit.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Registration Closed Notice */}
              <motion.div
                className="text-center bg-[#ff4654]/10 border border-[#ff4654]/30 rounded-lg p-6 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Timer className="mx-auto mb-4 text-[#ff4654]" size={48} />
                <h3 className="text-2xl font-bold text-[#ff4654] mb-2">Registration Closed</h3>
                <p className="text-gray-300">
                  Team registration has ended. Thank you to all teams who registered!
                  Good luck to all participants!
                </p>
              </motion.div>
            </motion.div>
          </ScrollReveal>
        )}

        {/* Event Details */}
        <ScrollReveal variant="fadeInUp" delay={0.6}>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.7 }}
          >
            <motion.div
              className="gaming-border rounded-lg p-6 text-center hover-lift"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Calendar className="mx-auto mb-4 text-[#ff4654]" size={32} />
              <h3 className="text-xl font-bold text-[#ff4654] mb-2">Event Date</h3>
              <p className="text-gray-300">{siteConfig.schedule.eventDateFormatted}</p>
            </motion.div>

            <motion.div
              className="gaming-border rounded-lg p-6 text-center hover-lift"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Clock className="mx-auto mb-4 text-[#ba3a46]" size={32} />
              <h3 className="text-xl font-bold text-[#ba3a46] mb-2">Event Time</h3>
              <p className="text-gray-300">
                {siteConfig.schedule.eventStartTime} - {siteConfig.schedule.eventEndTime}
              </p>
              <p className="text-sm text-gray-400 mt-1">{siteConfig.schedule.timezone}</p>
            </motion.div>

            <motion.div
              className="gaming-border rounded-lg p-6 text-center hover-lift"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MapPin className="mx-auto mb-4 text-[#ff6b6b]" size={32} />
              <h3 className="text-xl font-bold text-[#ff6b6b] mb-2">Venue</h3>
              <p className="text-gray-300">{siteConfig.venue.name}</p>
              <p className="text-sm text-gray-400 mt-1">{siteConfig.venue.city}</p>
            </motion.div>
          </motion.div>
        </ScrollReveal>

        {/* Tournament Status */}
        <ScrollReveal variant="fadeInUp" delay={0.9}>
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-[#ff4654] mb-4">Tournament Status</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div
                className="bg-[#ff4654]/10 border border-[#ff4654]/30 rounded-lg p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-[#ff4654] mb-2">Valorant Championship</h4>
                <p className="text-gray-300">{(stats as any)?.valorant?.registered || 0} Teams Registered • {siteConfig.tournaments.valorant.prizePool} Prize Pool</p>
              </motion.div>

              <motion.div
                className="bg-[#ba3a46]/10 border border-[#ba3a46]/30 rounded-lg p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-[#ba3a46] mb-2">Call of Duty Tournament</h4>
                <p className="text-gray-300">{(stats as any)?.cod?.confirmed || 0} Teams Registered • {siteConfig.tournaments.cod.prizePool} Prize Pool</p>
              </motion.div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
