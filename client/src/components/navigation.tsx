import { useState } from "react";
import { Gamepad2, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "../../../shared/config";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      className="bg-[#111823]/90 backdrop-blur-sm border-b border-[#ff4654]/30 sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-secret-hint="The legendary sequence of arrows and letters..."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="text-xl font-orbitron font-bold relative"
              animate={{
                textShadow: [
                  "0 0 0px #ff4654",
                  "0 0 10px #ff4654",
                  "0 0 20px #ff4654",
                  "0 0 10px #ff4654",
                  "0 0 0px #ff4654",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeIn" }}
                className="inline-block"
              >
                <Gamepad2 className="inline mx-2 text-[#ff4654]" />
              </motion.div>
              <span className="text-[#ff4654]">
                {siteConfig.event.name.split(" ")[0]}
              </span>
              <span className="text-[#ffffff]">
                {" "}
                {siteConfig.event.name.split(" ")[1]}
              </span>
              <div className="text-xs text-[#ba3a46] font-bold">
                {siteConfig.event.title}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center space-x-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              onClick={() => scrollToSection("tournaments")}
              className="hover:text-[#ff4654] transition-colors cursor-pointer"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Tournaments
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("schedule")}
              className="hover:text-[#ff4654] transition-colors cursor-pointer"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("funzone")}
              className="hover:text-[#ff4654] transition-colors cursor-pointer"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Fun Zone
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("game")}
              className="hover:text-[#ff4654] transition-colors cursor-pointer"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Game
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("countdown")}
              className="hover:text-[#ff4654] transition-colors cursor-pointer"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Countdown
            </motion.button>
            {/* <motion.a
              href="/leaderboard"
              className="hover:text-[#ff4654] transition-colors cursor-pointer"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Leaderboard
            </motion.a>
            <motion.a
              href="/matches"
              className="hover:text-[#ff4654] transition-colors cursor-pointer"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Live Matches
            </motion.a> */}
            <motion.a
              href="/rules"
              className="hover:text-[#ff4654] transition-colors cursor-pointer"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Rules
            </motion.a>
            <motion.a
              href="/admin"
              className="hover:text-[#ff4654] transition-colors cursor-pointer text-sm"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.1, color: "#ff4654" }}
              whileTap={{ scale: 0.95 }}
            >
              Admin
            </motion.a>
          </motion.div>

          <motion.button
            className="md:hidden text-[#ff4654]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? (
              <X className="text-xl" />
            ) : (
              <Menu className="text-xl" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {" "}
              <div className="flex flex-col space-y-2">
                <motion.button
                  onClick={() => scrollToSection("tournaments")}
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2"
                  whileHover={{ x: 10 }}
                >
                  Tournaments
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection("schedule")}
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2"
                  whileHover={{ x: 10 }}
                >
                  Schedule
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection("funzone")}
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2"
                  whileHover={{ x: 10 }}
                >
                  Fun Zone
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection("game")}
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2"
                  whileHover={{ x: 10 }}
                >
                  Game
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection("countdown")}
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2"
                  whileHover={{ x: 10 }}
                >
                  Countdown
                </motion.button>
                <motion.a
                  href="/leaderboard"
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2 block"
                  whileHover={{ x: 10 }}
                >
                  Leaderboard
                </motion.a>
                <motion.a
                  href="/matches"
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2 block"
                  whileHover={{ x: 10 }}
                >
                  Live Matches
                </motion.a>
                <motion.a
                  href="/rules"
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2 block"
                  whileHover={{ x: 10 }}
                >
                  Rules
                </motion.a>
                <motion.a
                  href="/admin"
                  className="text-left hover:text-[#ff4654] transition-colors cursor-pointer py-2 block text-sm"
                  whileHover={{ x: 10 }}
                >
                  Admin
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
