import { useQuery } from "@tanstack/react-query";
import { Users, Trophy, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "../../../shared/config";
import { ScrollReveal } from "./ui/scroll-reveal";
import { staggerVariants } from "@/hooks/use-scroll-reveal";

export default function TournamentShowcase() {
  const { data: stats } = useQuery({
    queryKey: ['/api/teams/stats'],
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="tournaments" className="py-20 bg-[#1a2332]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fadeInUp">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ff4654]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Main Events
            </motion.h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Compete in the most popular FPS games with professional setups and amazing prizes
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={staggerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Valorant Tournament Card */}
          <motion.div
            className="gaming-border rounded-xl p-8 hover-lift transition-transform group"
            variants={{
              hidden: { opacity: 0, y: 50, rotateY: -15 },
              visible: {
                opacity: 1,
                y: 0,
                rotateY: 0,
                transition: { duration: 0.8, ease: "easeOut" }
              }
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="relative mb-6 overflow-hidden rounded-lg">
              <motion.img
                src="https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/54d784be3db8503ec574ff45e912ea098cc10352-854x484.png"
                alt="Valorant gameplay setup"
                className="w-full h-48 object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute top-4 left-4 bg-[#ff4654]/90 px-3 py-1 rounded-full text-sm font-semibold"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                VALORANT
              </motion.div>
            </div>

            <motion.h3
              className="text-2xl font-orbitron font-bold mb-4 text-[#ff4654]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {siteConfig.tournaments.valorant.name}
            </motion.h3>

            <motion.div
              className="space-y-3 mb-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.4
                  }
                }
              }}
              initial="hidden"
              whileInView="visible"
            >
              <motion.div
                className="flex items-center text-gray-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <Users className="text-[#ff4654] mr-3" />
                {siteConfig.tournaments.valorant.teamSize} Players per Team
              </motion.div>
              <motion.div
                className="flex items-center text-gray-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <Trophy className="text-[#ff4654] mr-3" />
                {siteConfig.tournaments.valorant.prizePool} Prize Pool
              </motion.div>
              <motion.div
                className="flex items-center text-gray-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <Clock className="text-[#ff4654] mr-3" />
                Fee: {siteConfig.tournaments.valorant.registrationFee}
              </motion.div>
            </motion.div>

            {/* Gaming-style progress bar */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex justify-between text-sm mb-2">
                <span>Teams Registered</span>
                <span>{(stats as any)?.valorant?.registered || 0}/{siteConfig.tournaments.valorant.maxTeams}</span>
              </div>
              <div className="w-full bg-[#242d3d] rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#ff4654] to-[#ba3a46] h-3 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(((stats as any)?.valorant?.registered || 0) / siteConfig.tournaments.valorant.maxTeams) * 100}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                ></motion.div>
              </div>
            </motion.div>

            <motion.button
              onClick={() => scrollToSection('register')}
              className="w-full gaming-button py-3 rounded-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Register for Valorant
            </motion.button>
          </motion.div>

          {/* Call of Duty Tournament Card */}
          <motion.div
            className="gaming-border rounded-xl p-8 hover-lift transition-transform group"
            variants={{
              hidden: { opacity: 0, y: 50, rotateY: 15 },
              visible: {
                opacity: 1,
                y: 0,
                rotateY: 0,
                transition: { duration: 0.8, ease: "easeOut" }
              }
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="relative mb-6 overflow-hidden rounded-lg">
              <motion.img
                src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/d96bb958-4e6c-4ce0-9447-fbe226fbbecf/dgg8vm0-9a405c1a-312c-4843-8f02-22932b23a873.jpg"
                alt="Call of Duty gameplay setup"
                className="w-full h-48 object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute top-4 left-4 bg-[#ba3a46]/90 px-3 py-1 rounded-full text-sm font-semibold"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                CALL OF DUTY
              </motion.div>
            </div>

            <motion.h3
              className="text-2xl font-orbitron font-bold mb-4 text-[#ba3a46]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {siteConfig.tournaments.cod.name}
            </motion.h3>

            <motion.div
              className="space-y-3 mb-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.4
                  }
                }
              }}
              initial="hidden"
              whileInView="visible"
            >
              <motion.div
                className="flex items-center text-gray-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <Users className="text-[#ba3a46] mr-3" />
                {siteConfig.tournaments.cod.teamSize} Players per Team
              </motion.div>
              <motion.div
                className="flex items-center text-gray-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <Trophy className="text-[#ba3a46] mr-3" />
                {siteConfig.tournaments.cod.prizePool} Prize Pool
              </motion.div>
              <motion.div
                className="flex items-center text-gray-300"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <Clock className="text-[#ba3a46] mr-3" />
                Fee: {siteConfig.tournaments.cod.registrationFee}
              </motion.div>
            </motion.div>

            {/* Gaming-style progress bar */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex justify-between text-sm mb-2">
                <span>Teams Registered</span>
                <span>{(stats as any)?.cod?.registered || 0}/{siteConfig.tournaments.cod.maxTeams}</span>
              </div>
              <div className="w-full bg-[#242d3d] rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#ba3a46] to-[#ff4654] h-3 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(((stats as any)?.cod?.registered || 0) / siteConfig.tournaments.cod.maxTeams) * 100}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                ></motion.div>
              </div>
            </motion.div>

            <motion.button
              onClick={() => scrollToSection('register')}
              className="w-full gaming-button py-3 rounded-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Register for COD
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
