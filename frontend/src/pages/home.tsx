import Categories from '../components/home/categories';
import Hero from '../components/home/Hero';
import Map from '../components/home/map';
import Features from '../components/home/services';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <Categories />
      <Features />
      <Map />
    </div>
  );
};

export default HomePage;
