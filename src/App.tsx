import Hero from "./components/Hero";
import Countdown from "./components/Countdown";
import Timeline from "./components/Timeline";
import Venue from "./components/Venue";
import Gallery from "./components/Gallery";
import RSVP from "./components/RSVP";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import { MotionConfig } from "framer-motion";

import { useReducedMotion } from "./hooks/useReducedMotion";

function App() {
  const reducedMotion = useReducedMotion();
  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <a href="#main" className="skip-link">Aller au contenu</a>
      <Hero />
      <main id="main" tabIndex={-1}>
        <Countdown />
      <Timeline />
      <Gallery />
      <Venue />
      <section id="rsvp">
        <RSVP />
      </section>
      </main>
      <Footer />
      <ScrollToTop />
    </MotionConfig>
  );
}

export default App;