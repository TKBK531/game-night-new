import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, MapPin, Timer, Users, Trophy, Gamepad2, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { siteConfig } from "../../../shared/config";
import { ScrollReveal } from "./ui/scroll-reveal";
import { getTeamLogoUrl } from "../../../shared/team-logo-utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  // Event has completed - no need for countdown logic
  const isEventCompleted = true;

  // Fetch team statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/teams/stats'],
  });

  return (
    <section id="countdown" className="py-20 bg-gradient-to-br from-[#0a0f1a] via-[#1a2332] to-[#0a0f1a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fadeInUp">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-green-400"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              🎉 Event Completed Successfully! 🎉
            </motion.h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Thank you to all participants for making Game Night: Reignite 25' an incredible success!
              See you in our next bigger and better tournament!
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" delay={0.3}>
          <motion.div
            className="gaming-border rounded-xl p-8 mb-12 bg-gradient-to-br from-green-900/20 to-green-700/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Event Completion Message */}
            <motion.div
              className="text-center bg-green-600/10 border border-green-400/30 rounded-lg p-8 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Timer className="mx-auto mb-4 text-green-400" size={64} />
              <h3 className="text-3xl font-bold text-green-400 mb-4">Tournament Champions Crowned!</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-[#ff4654]/20 to-[#ba3a46]/20 rounded-lg p-4 border border-[#ff4654]/30">
                  <h4 className="text-xl font-bold text-[#ff4654] mb-3">🏆 Valorant Champions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={getTeamLogoUrl("Team Mythics")}
                          alt="Team Mythics Logo"
                          className="w-8 h-8 rounded-full object-cover border border-yellow-400 mr-3"
                        />
                        <span className="text-yellow-400 font-bold text-lg">1st: Team Mythics</span>
                      </div>
                      <div className="text-2xl">🏆</div>
                    </div>
                    <div className="flex items-center">
                      <img
                        src={getTeamLogoUrl("Tactical Naps")}
                        alt="Tactical Naps Logo"
                        className="w-8 h-8 rounded-full object-cover border border-gray-400 mr-3"
                      />
                      <span className="text-gray-300 font-semibold">2nd: Tactical Naps</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-[#ba3a46]/20 to-[#ff4654]/20 rounded-lg p-4 border border-[#ba3a46]/30">
                  <h4 className="text-xl font-bold text-[#ba3a46] mb-3">🏆 Call of Duty Champions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={getTeamLogoUrl("Mind Processing")}
                          alt="Mind Processing Logo"
                          className="w-8 h-8 rounded-full object-cover border border-yellow-400 mr-3"
                        />
                        <span className="text-yellow-400 font-bold text-lg">1st: Mind Processing</span>
                      </div>
                      <div className="text-2xl">🏆</div>
                    </div>
                    <div className="flex items-center">
                      <img
                        src={getTeamLogoUrl("Silent Reapers")}
                        alt="Silent Reapers Logo"
                        className="w-8 h-8 rounded-full object-cover border border-gray-400 mr-3"
                      />
                      <span className="text-gray-300 font-semibold">2nd: Silent Reapers</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mt-4">
                All prize money has been distributed to the winning teams!
              </p>
            </motion.div>
          </motion.div>
        </ScrollReveal>

        {/* Tournament Statistics */}
        <ScrollReveal variant="fadeInUp" delay={0.6}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div
              className="text-center gaming-border rounded-lg p-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Users className="mx-auto mb-4 text-[#ff4654]" size={48} />
              <div className="text-3xl font-bold text-white mb-2">
                {(stats as any)?.totalTeams || '16+'}
              </div>
              <div className="text-gray-300">Teams Participated</div>
            </motion.div>

            <motion.div
              className="text-center gaming-border rounded-lg p-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Trophy className="mx-auto mb-4 text-yellow-500" size={48} />
              <div className="text-3xl font-bold text-white mb-2">4</div>
              <div className="text-gray-300">Champions Crowned</div>
            </motion.div>

            <motion.div
              className="text-center gaming-border rounded-lg p-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Gamepad2 className="mx-auto mb-4 text-blue-400" size={48} />
              <div className="text-3xl font-bold text-white mb-2">2</div>
              <div className="text-gray-300">Games Completed</div>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Thank You Message */}
        <ScrollReveal variant="fadeInUp" delay={0.8}>
          <motion.div
            className="text-center mt-12 p-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Heart className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-2xl font-bold text-white mb-4">Thank You!</h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Special thanks to all organizers, participants, and supporters who made
              Game Night: Reignite 25' an unforgettable experience.
              Until next time, keep gaming! 🎮
            </p>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
