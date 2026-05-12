"use client";
import { useEffect, useRef, useState } from "react";
import { fetchAPI } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    fetchAPI("/products?featured=true")
      .then((res) => {
        console.log("PRODUCT API:", res); // 🔍 debug

        if (Array.isArray(res)) {
          setProducts(res);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else if (Array.isArray(res.products)) {
          setProducts(res.products);
        } else {
          console.error("Unexpected product response:", res);
          setProducts([]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section className="py-20 bg-dark-800/50">
      <div className="max-w-7xl mx-auto px-4">

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{ delay: 4000 }}
          loop
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {Array.isArray(products) &&
            products.map((product: any) => (
              <SwiperSlide key={product._id || product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
        </Swiper>

      </div>
    </section>
  );
}