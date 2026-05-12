"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Star, Quote } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchAPI("/reviews")
      .then((res) => {
        console.log("REVIEW API:", res); // 🔍 debug

        let data: any[] = [];

        // ✅ handle all possible response shapes
        if (Array.isArray(res)) {
          data = res;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.reviews)) {
          data = res.reviews;
        } else {
          console.error("Unexpected review response:", res);
        }

        // ✅ filter only approved reviews
        const approved = data.filter((r: any) => r.isApproved !== false);

        setReviews(approved);
      })
      .catch((err) => {
        console.error("Review fetch error:", err);
        setReviews([]);
      });
  }, []);

  return (
    <section className="py-20 bg-dark-800/40">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 font-mono">
            Customer Reviews
          </span>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mb-3">
            What Our <span className="gradient-text">Customers Say</span>
          </h2>

          <p className="text-slate-400 font-body">
            Real feedback from our users
          </p>
        </div>

        {/* Slider */}
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{ delay: 3500 }}
          loop
          pagination={{ clickable: true, dynamicBullets: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {Array.isArray(reviews) &&
            reviews.map((review: any) => (
              <SwiperSlide key={review.id}>
                <div className="card-dark p-6 h-full">

                  {/* Quote */}
                  <Quote size={28} className="text-brand-500/40 mb-3" />

                  {/* Text */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-5 font-body italic">
                    &ldquo;{review.body || "No review text"}&rdquo;
                  </p>

                  {/* User */}
                  <div className="flex items-center gap-3 pt-4 border-t border-dark-600">

                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.reviewerName?.[0] || "U"}
                    </div>

                    <div>
                      <p className="text-white font-semibold text-sm">
                        {review.reviewerName || "Anonymous"}
                      </p>

                      <p className="text-slate-500 text-xs">
                        {review.reviewerRole || "Customer"}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: Number(review.rating) || 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>

                  </div>
                </div>
              </SwiperSlide>
            ))}
        </Swiper>

      </div>
    </section>
  );
}