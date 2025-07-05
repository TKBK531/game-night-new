import { Gamepad2, Mail, Phone, MapPin } from "lucide-react";
import { FaDiscord, FaTwitch, FaYoutube, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { siteConfig } from "../../../shared/config";
import { ScrollReveal } from "./ui/scroll-reveal";
import { staggerVariants } from "@/hooks/use-scroll-reveal";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0a0f1a] border-t border-[#ff4654]/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid md:grid-cols-4 gap-8"
          variants={staggerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" }
              }
            }}
          >
            <motion.div
              className="text-xl font-orbitron font-bold mb-4 flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Gamepad2 className="mr-2 text-[#ff4654]" />
              </motion.div>
              <span className="text-[#ff4654]">{siteConfig.event.name.split(' ')[0]}</span>
              <span className="text-[#ffffff]"> {siteConfig.event.name.split(' ')[1]}</span>
            </motion.div>
            <p className="text-gray-400">
              {siteConfig.event.description}
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" }
              }
            }}
          >
            <h4 className="font-semibold text-[#ff4654] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => scrollToSection('tournaments')}
                  className="hover:text-[hsl(280,100%,70%)] transition-colors cursor-pointer"
                >
                  Tournaments
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('schedule')}
                  className="hover:text-[hsl(280,100%,70%)] transition-colors cursor-pointer"
                >
                  Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('funzone')}
                  className="hover:text-[hsl(280,100%,70%)] transition-colors cursor-pointer"
                >
                  Fun Zone
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('game')}
                  className="hover:text-[hsl(280,100%,70%)] transition-colors cursor-pointer"
                >
                  Game
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('register')}
                  className="hover:text-[hsl(280,100%,70%)] transition-colors cursor-pointer"
                >
                  Register
                </button>
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" }
              }
            }}
          >
            <h4 className="font-semibold text-[#ba3a46] mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <motion.li className="flex items-center" whileHover={{ x: 5 }}>
                <Mail className="text-[#ba3a46] mr-2" size={16} />
                {siteConfig.contact.email}
              </motion.li>
              <motion.li className="flex items-center" whileHover={{ x: 5 }}>
                <Phone className="text-[#ba3a46] mr-2" size={16} />
                {siteConfig.contact.phone}
              </motion.li>
              <motion.li className="flex items-center" whileHover={{ x: 5 }}>
                <MapPin className="text-[#ba3a46] mr-2" size={16} />
                {siteConfig.venue.city}, {siteConfig.venue.state}
              </motion.li>
            </ul>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" }
              }
            }}
          >
            <h4 className="font-semibold text-[#ffffff] mb-4">Follow Us</h4>
            <motion.div className="flex space-x-4">
              <motion.a
                href="https://www.facebook.com/CsupFB"
                target="_blank"
                className="text-gray-400 hover:text-[#ff4654] transition-colors"
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaFacebook className="text-2xl" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/company/computer-society-university-of-peradeniya-csup/"
                target="_blank"
                className="text-gray-400 hover:text-[#ba3a46] transition-colors"
                whileHover={{ scale: 1.2, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaLinkedin className="text-2xl" />
              </motion.a>
              <motion.a
                href="https://youtube.com/@csup-computersocietyuniver1554?si=BXlLHmY5bIPBfcCF"
                target="_blank"
                className="text-gray-400 hover:text-[#ff4654] transition-colors"
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaYoutube className="text-2xl" />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/csup_insta/"
                target="_blank"
                className="text-gray-400 hover:text-[#ffffff] transition-colors"
                whileHover={{ scale: 1.2, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaInstagram className="text-2xl" />
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>

        <ScrollReveal variant="fadeInUp" delay={0.8}>
          <div className="border-t border-[#242d3d] mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {siteConfig.event.year} {siteConfig.event.name}. All rights reserved.</p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
