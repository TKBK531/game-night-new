import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import TournamentShowcase from "@/components/tournament-showcase";
import EventSchedule from "@/components/event-schedule";
import FunZone from "@/components/fun-zone";
import ReactionGame from "@/components/reaction-game";
import CountdownTimer from "@/components/countdown-timer";
import VenueInfo from "@/components/venue-info";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <Navigation />
      <HeroSection />
      <TournamentShowcase />
      {/* <EventSchedule /> */}
      {/* <FunZone /> */}
      <ReactionGame />
      <CountdownTimer />
      {/* <VenueInfo /> */}
      <Footer />
    </div>
  );
}
