import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import FocusAreas from './components/FocusAreas';
import Programmes from './components/Programmes';
import AboutAmbedkar from './components/AboutAmbedkar';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <HeroSlider />
      <FocusAreas />
      <Programmes />
      <AboutAmbedkar />
      <Footer />
    </>
  );
}