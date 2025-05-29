"use client"

import Image from "next/image";
import RatingStar from "../common/rating-star";

interface TestimonialProps {
  name: string;
  avatar?: string;
  avatarAlt?: string;
  rating: number;
  testimonial: string;
}

const Testimonials = () => {
  const testimonials: TestimonialProps[] = [
    {
      name: "John Doe",
      avatar: "",
      avatarAlt: "John Doe",
      rating: 5,
      testimonial: "QueueHub saved us hours of waiting chaos. Our customers love the real-time updates!"
    },
    {
      name: "Jane Smith",
      avatar: "",
      avatarAlt: "Jane Smith",
      rating: 4.8,
      testimonial: "Simple, smart, and smooth. Our staff productivity skyrocketed since using QueueHub."
    },
    {
      name: "Alex Wong",
      avatar: "",
      avatarAlt: "Alex Wong",
      rating: 4.6,
      testimonial: "The reminder system is genius. No more no-shows. We love the flexibility QueueHub provides!"
    },
    {
      name: "John Doe",
      avatar: "",
      avatarAlt: "John Doe",
      rating: 3.5,
      testimonial: "This is a testimonial"
    },
    {
      name: "John Doe",
      avatar: "",
      avatarAlt: "John Doe",
      rating: 4.9,
      testimonial: "This is a testimonial"
    }
  ];

  return (
    <section className="mt-20 pt-10 font-regular-eng">
      <h1 className="text-3xl font-bold text-center mb-10">Testimonials</h1>
      <div className="overflow-x-auto pb-4">
        <div className="flex px-4 md:px-12 space-x-4">

          {testimonials.map((t, i) => (
              <div
                key={i}
                className="relative p-6 pt-8 flex-shrink-0"
              >
                {/* Avatar */}
                <div className="absolute top-0 left-12">
                    <div className="w-20 h-20 rounded-full border-3 border-secondary bg-gray-100 overflow-hidden shadow-sm">
                        {t.avatar ? (
                            <Image
                                src={t.avatar}
                                alt={t.avatarAlt || t.name}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">👤</div>
                        )}
                    </div>
                </div>

                <div className="border-1 border-border shadow-sm rounded-2xl p-6 pt-16 min-w-[300px] max-w-sm h-[250px] flex-shrink-0 overflow-hidden">

                    {/* Stars */}
                    <div className="mt-2 mb-2">
                        <RatingStar rating={t.rating} size={20}/>
                    </div>

                    {/* Testimonial */}
                    <p className="italic text-base text-black mt-2">{t.testimonial}</p>

                    {/* Name */}
                    <p className="mt-4 font-semibold text-sm text-gray-800">— {t.name}</p>

                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
