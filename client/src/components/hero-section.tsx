import {
  Trophy,
  Calendar,
  Zap,
  Target,
  Gamepad2,
  Cpu,
  Shield,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { siteConfig } from "../../../shared/config";
import { ScrollReveal } from "./ui/scroll-reveal";
import { staggerVariants } from "@/hooks/use-scroll-reveal";
import { getTeamLogoUrl } from "../../../shared/team-logo-utils";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      {/* For true gamers: Some secrets require the perfect sequence of inputs... */}
      <div className="absolute inset-0 z-0">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff4654]/20 via-[#111823] to-[#ba3a46]/20"></div>

        {/* Moving geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-[#ff4654]/30 rotate-45 animate-float"></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 border-2 border-[#ba3a46]/30 rotate-12 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-32 w-20 h-20 border-2 border-[#ff4654]/30 rotate-45 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* Event Completed Title */}
        <ScrollReveal variant="fadeInDown" delay={0.2}>
          <div className="relative mb-12">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#ff4654]/20 via-[#ba3a46]/20 to-[#ff4654]/20 blur-xl rounded-full"></div>

            <motion.h1
              className="relative text-6xl md:text-8xl font-orbitron font-black mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              <span className="bg-gradient-to-r text-4xl md:text-6xl from-[#ff4654] to-[#ffffff] bg-clip-text text-transparent drop-shadow-[0_0_30px_#ff4654]">
                CSUP
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#ffffff] to-[#ba3a46] bg-clip-text text-transparent drop-shadow-[0_0_30px_#ba3a46]">
                {siteConfig.event.name}
              </span>
            </motion.h1>

            <motion.div
              className="text-3xl md:text-5xl font-orbitron font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              <span className="bg-gradient-to-r from-[#ba3a46] to-[#ff4654] bg-clip-text text-transparent animate-pulse-neon">
                {siteConfig.event.title} {siteConfig.event.year}
              </span>
            </motion.div>

            <motion.div
              className="text-2xl md:text-3xl font-orbitron font-bold text-green-400 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            >
              <Trophy className="inline mr-3 text-yellow-400" />
              EVENT COMPLETED!
              <Trophy className="inline ml-3 text-yellow-400" />
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Tournament Winners */}
        <ScrollReveal variant="fadeInUp" delay={0.4}>
          <div className="mb-12 space-y-8">
            <motion.div
              className="bg-gradient-to-r from-[#ff4654]/20 to-[#ba3a46]/20 rounded-xl p-8 backdrop-blur-sm border border-[#ff4654]/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-[#ff4654] mb-6">
                🏆 TOURNAMENT CHAMPIONS 🏆
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Valorant Winners */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-orbitron font-bold text-white mb-4">
                    <Gamepad2 className="inline mr-2 text-[#ff4654]" />
                    VALORANT
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-[#ff4654]/20 to-[#ba3a46]/20 rounded-lg p-4 border border-[#ff4654]/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={getTeamLogoUrl("Team Mythics")}
                            alt="Team Mythics Logo"
                            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 mr-4"
                          />
                          <div>
                            <div className="flex items-center">
                              <Trophy className="text-yellow-400 mr-2" size={20} />
                              <span className="text-xl font-bold text-yellow-400">1st Place</span>
                            </div>
                            <span className="text-lg font-bold text-[#ff4654]">Team Mythics</span>
                          </div>
                        </div>
                        <div className="text-3xl">🏆</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-[#ff4654]/10 to-[#ba3a46]/10 rounded-lg p-4 border border-[#ff4654]/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={getTeamLogoUrl("Tactical Naps")}
                            alt="Tactical Naps Logo"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-400 mr-4"
                          />
                          <div>
                            <div className="flex items-center">
                              <Target className="text-gray-300 mr-2" size={20} />
                              <span className="text-lg font-bold text-gray-300">2nd Place</span>
                            </div>
                            <span className="text-lg font-bold text-[#ff4654]">Tactical Naps</span>
                          </div>
                        </div>
                        <div className="text-2xl">🥈</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call of Duty Winners */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-orbitron font-bold text-white mb-4">
                    <Gamepad2 className="inline mr-2 text-[#ba3a46]" />
                    CALL OF DUTY
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-[#ba3a46]/20 to-[#ff4654]/20 rounded-lg p-4 border border-[#ba3a46]/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={getTeamLogoUrl("Mind Processing")}
                            alt="Mind Processing Logo"
                            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 mr-4"
                          />
                          <div>
                            <div className="flex items-center">
                              <Trophy className="text-yellow-400 mr-2" size={20} />
                              <span className="text-xl font-bold text-yellow-400">1st Place</span>
                            </div>
                            <span className="text-lg font-bold text-[#ba3a46]">Mind Processing</span>
                          </div>
                        </div>
                        <div className="text-3xl">🏆</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-[#ba3a46]/10 to-[#ff4654]/10 rounded-lg p-4 border border-[#ba3a46]/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={getTeamLogoUrl("Reapers")}
                            alt="Reapers Logo"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-400 mr-4"
                          />
                          <div>
                            <div className="flex items-center">
                              <Target className="text-gray-300 mr-2" size={20} />
                              <span className="text-lg font-bold text-gray-300">2nd Place</span>
                            </div>
                            <span className="text-lg font-bold text-[#ba3a46]">Reapers</span>
                          </div>
                        </div>
                        <div className="text-2xl">🥈</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Thank you message */}
            <motion.div
              className="text-xl md:text-2xl text-gray-300 font-medium space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <p className="mb-4">
                <Sparkles className="inline text-[#ff4654] mr-2" />
                Congratulations to all our amazing participants!
                <Sparkles className="inline text-[#ba3a46] ml-2" />
              </p>
              <p className="text-lg text-gray-400">
                Thank you for making Game Night: Reignite 25' an incredible success!
              </p>
              <p className="text-lg text-gray-400">
                We hope to see you again in our next bigger and better tournament!
              </p>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal variant="scaleIn" delay={0.6}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <motion.button
              onClick={() => scrollToSection("leaderboard")}
              className="group bg-[#ff4654]/20 border border-[#ff4654] text-[#ff4654] px-10 py-5 rounded-xl font-bold text-xl flex items-center justify-center hover-lift"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="mr-3 group-hover:animate-bounce" />
              View Final Results
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("tournament-showcase")}
              className="border-2 border-[#ff4654] text-[#ff4654] px-10 py-5 rounded-xl font-bold text-xl hover:bg-[#ff4654] hover:text-[#ffffff] transition-all flex items-center justify-center backdrop-blur-sm bg-[#ff4654]/10 hover-lift"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Gamepad2 className="mr-3" />
              View Highlights
            </motion.button>
          </div>
        </ScrollReveal>

        {/* Event Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          variants={staggerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Event Completed */}
          <motion.div
            className="gaming-border rounded-xl p-6 backdrop-blur-sm bg-[#111823]/50 hover-lift"
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.8 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <Trophy className="text-3xl mx-auto mb-3 text-yellow-400" />
            <div className="text-2xl font-orbitron font-bold text-green-400">
              SUCCESS!
            </div>
            <div className="text-gray-400">Event Completed</div>
          </motion.div>

          {/* Total Participants */}
          <motion.div
            className="gaming-border rounded-xl p-6 backdrop-blur-sm bg-[#111823]/50 hover-lift"
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.8 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
              },
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <Shield className="text-3xl mx-auto mb-3 text-[#ff4654]" />
            <div className="text-2xl font-orbitron font-bold text-[#ff4654]">
              16+ Teams
            </div>
            <div className="text-gray-400">Total Participants</div>
          </motion.div>

          {/* Prize Pool Distributed */}
          <motion.div
            className="gaming-border rounded-xl p-6 backdrop-blur-sm bg-[#111823]/50 hover-lift"
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.8 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.4 },
              },
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <Gamepad2 className="text-3xl mx-auto mb-3 text-[#ba3a46]" />
            <div className="text-2xl font-orbitron font-bold text-[#ba3a46]">
              100,000+ LKR
            </div>
            <div className="text-gray-400">Prize Pool Distributed</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Gaming Elements */}
      <motion.div
        className="absolute bottom-10 left-10 text-[#ff4654]"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Zap className="text-4xl" />
      </motion.div>
      <motion.div
        className="absolute top-20 right-10 text-[#ffffff]"
        animate={{
          y: [0, -15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Target className="text-4xl" />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-20 text-[#ba3a46]"
        animate={{
          y: [0, -25, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <Shield className="text-3xl" />
      </motion.div>
    </section>
  );
}
