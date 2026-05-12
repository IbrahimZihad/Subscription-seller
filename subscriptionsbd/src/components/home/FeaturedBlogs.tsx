"use client";
import { useEffect, useRef, useState } from "react";
import { fetchAPI } from "@/lib/api";
import BlogCard from "@/components/blog/BlogCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

export default function FeaturedBlogs() {
  const [posts, setPosts] = useState<any[]>([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    fetchAPI("/blog")
      .then((res) => {
        console.log("BLOG API:", res); // 🔍 debug

        if (Array.isArray(res)) {
          setPosts(res);
        } else if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else if (Array.isArray(res.posts)) {
          setPosts(res.posts);
        } else {
          console.error("Unexpected blog response:", res);
          setPosts([]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{ delay: 5000 }}
          loop
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {Array.isArray(posts) &&
            posts.map((post: any) => (
              <SwiperSlide key={post._id || post.id}>
                <BlogCard post={post} />
              </SwiperSlide>
            ))}
        </Swiper>

      </div>
    </section>
  );
}