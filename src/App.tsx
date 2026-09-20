import Hero from "./components/Hero";
import Countdown from "./components/Countdown";
import Timeline from "./components/Timeline";
import Venue from "./components/Venue";
import Gallery from "./components/Gallery";
import RSVP from "./components/RSVP";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <Hero />
      <div id="countdown">
        <Countdown />
      </div>
      <Timeline />
      <Gallery />
      <Venue />
      <section id="rsvp">
        <RSVP />
      </section>
      <Footer />
      <ScrollToTop />
    </>
  );
}

export default App;