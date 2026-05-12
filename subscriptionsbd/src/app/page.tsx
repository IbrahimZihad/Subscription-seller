import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import AboutSection from "@/components/home/AboutSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturedBlogs from "@/components/home/FeaturedBlogs";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <AboutSection />
      <FeaturedProducts />
      <TestimonialsSection />
      <FeaturedBlogs />
    </>
  );
}
