import Hero from "./components/Hero";
import Timeline from "./components/Timeline";
import Venue from "./components/Venue";
import Gallery from "./components/Gallery";
import RSVP from "./components/RSVP";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import { useGuest } from "./hooks/useGuest";

function App() {
  const { guest, loading, error } = useGuest();

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-10 text-center">
        <h1 className="text-4xl">Invité non trouvé</h1>
        <p className="mt-4 text-[#433F39]/70">
          Le lien utilisé est peut-être incorrect. Contactez-nous si le problème persiste.
        </p>
      </div>
    );
  }

  return (
    <>
      <Hero guest={guest} />
      <Timeline />
      <Gallery />
      <Venue />
      <section id="rsvp">
        {guest ? (
          <RSVP guest={guest} />
        ) : (
          <div className="p-10 text-center">
            <p>Ajoutez votre code d'invité à l'URL pour confirmer votre présence.</p>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}

export default App;