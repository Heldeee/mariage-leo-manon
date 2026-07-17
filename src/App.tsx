import Hero from "./components/Hero";
import Countdown from "./components/Countdown";
import Timeline from "./components/Timeline";
import Venue from "./components/Venue";
import Gallery from "./components/Gallery";
import RSVP from "./components/RSVP";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import ScrollToTop from "./components/ScrollToTop";
import { useGuest } from "./hooks/useGuest";

function App() {
  const { guest, loading, error } = useGuest();

  if (loading) return <Loader />;
  if (error) { /* ... inchangé ... */ }

  return (
    <>
      <Hero guest={guest} />
      <div id="countdown">
        <Countdown />
      </div>
      <Timeline />
      <Gallery />
      <Venue />
      <section id="rsvp">
        {guest ? <RSVP guest={guest} /> : <div className="p-10 text-center">...</div>}
      </section>
      <Footer />
      <ScrollToTop />
    </>
  );
}

export default App;