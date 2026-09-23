import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, resetProducts } from "../Redux/Slices/productSlice.js";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProductSection from "../components/ProductSection";
import SimpleSection from "../components/textSection.jsx";
import FeaturedSection from "../components/FeaturedSection.jsx";
import ContactSection from "../components/ContactSection.jsx";
import FooterSection from "../components/FooterSection.jsx";
import TruckLoader from "../components/TruckLoader.jsx";
import BuyerSection from "../components/BuyerSection.jsx";
import MiddleHeroSection from "../components/MiddleHeroSection.jsx";
import AutoStrip from "../components/AutoStrip.jsx";

const Home = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const { products, loading, error, pages } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(resetProducts());
    setCurrentPage(1);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage }));
  }, [dispatch, currentPage]);

  
  if (loading && products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="pt-32 md:pt-48 min-h-screen flex items-center justify-center">
          <TruckLoader />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <HeroSection />
      {/* <FeaturedSection /> */}
            {/* <MiddleHeroSection/> */}
      <BuyerSection/>
      {/* <AutoStrip/> */}
      <ProductSection
        products={products}
        loading={loading}
        error={error}
        pages={pages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <SimpleSection />
      <ContactSection />
      <FooterSection/>
    </>
  );
};

export default Home;

