import { Gamepad2, Mail, Phone, MapPin } from "lucide-react";
import { FaDiscord, FaTwitch, FaYoutube, FaInstagram } from "react-icons/fa";
import { siteConfig } from "../../../shared/config";

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
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-orbitron font-bold mb-4 flex items-center">
              <Gamepad2 className="mr-2 text-[#ff4654]" />
              <span className="text-[#ff4654]">{siteConfig.event.name.split(' ')[0]}</span>
              <span className="text-[#ffffff]"> {siteConfig.event.name.split(' ')[1]}</span>
            </div>
            <p className="text-gray-400">
              {siteConfig.event.description}
            </p>
          </div>

          <div>
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
          </div>

          <div>
            <h4 className="font-semibold text-[#ba3a46] mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <Mail className="text-[#ba3a46] mr-2" size={16} />
                {siteConfig.contact.email}
              </li>
              <li className="flex items-center">
                <Phone className="text-[#ba3a46] mr-2" size={16} />
                {siteConfig.contact.phone}
              </li>
              <li className="flex items-center">
                <MapPin className="text-[#ba3a46] mr-2" size={16} />
                {siteConfig.venue.city}, {siteConfig.venue.state}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#ffffff] mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#ff4654] transition-colors">
                <FaDiscord className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#ba3a46] transition-colors">
                <FaTwitch className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#ff4654] transition-colors">
                <FaYoutube className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#ffffff] transition-colors">
                <FaInstagram className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#242d3d] mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {siteConfig.event.year} {siteConfig.event.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
