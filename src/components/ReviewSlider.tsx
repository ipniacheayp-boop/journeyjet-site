"use client";

import { useState } from "react";

const reviews = [
  {
    name: "Amanda Lee",
    message:
      "Fast response and very clear communication throughout the entire process. The support team made sure all my questions were answered properly.",
    date: "5 days ago",
    rating: 5,
  },
  {
    name: "James Walker",
    message:
      "Booking changes were handled smoothly without any hassle. The representative was polite, patient, and knowledgeable.",
    date: "1 week ago",
    rating: 4,
  },
  {
    name: "Sophia Martinez",
    message:
      "I had an issue with my itinerary and the support team resolved it quickly. They kept me informed at every step, which I really appreciated.",
    date: "1 week ago",
    rating: 5,
  },
  {
    name: "Daniel Thompson",
    message:
      "Customer support was responsive and efficient. Even though my request was a bit complicated, they managed everything professionally.",
    date: "8 days ago",
    rating: 4,
  },
  {
    name: "Lourdes",
    message:
      "Dino from the Support Team and Travel expert Mia were both quick in getting my issue resolved. They explained everything clearly and followed up to ensure there were no further problems.",
    date: "2 days ago",
    rating: 5,
  },
  {
    name: "Nelson Collazo",
    message:
      "Mia was professional, courteous, and pleasantly helpful as I needed to change my booking at the last minute. The process was smooth and stress-free.",
    date: "3 days ago",
    rating: 5,
  },
  {
    name: "Rigo Morales",
    message:
      "Mia was extremely helpful in getting my e-tickets confirmed and sent on time. I really appreciated the quick turnaround and clear communication.",
    date: "4 days ago",
    rating: 4,
  },
  {
    name: "Priya Sharma",
    message:
      "Great experience overall. The agent was friendly and took the time to understand my concern before offering the best solution.",
    date: "9 days ago",
    rating: 5,
  },
  {
    name: "Michael Brown",
    message:
      "I was initially worried about my booking, but the support team reassured me and fixed the issue faster than expected.",
    date: "10 days ago",
    rating: 4,
  },
  {
    name: "Ayesha Khan",
    message:
      "Excellent service and very prompt responses. The team followed up after resolving my issue to ensure everything was working fine.",
    date: "12 days ago",
    rating: 5,
  },
  {
    name: "Chris Johnson",
    message:
      "The entire experience was smooth and well-handled. I felt confident knowing my request was being taken care of properly.",
    date: "2 weeks ago",
    rating: 4,
  },
];

export default function TrustpilotSlider() {
  const [index, setIndex] = useState(0);

  return (
    <div className="w-[700px] h-[160px] flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4">
      {/* Left Arrow */}
      <button
        onClick={() =>
          setIndex((i) => (i - 1 + reviews.length) % reviews.length)
        }
        className="w-9 h-9 flex items-center justify-center rounded-full border border-white/40 text-white text-xl hover:bg-white/20 transition shrink-0"
      >
        ‹
      </button>

      {/* Review */}
      <div className="flex-1 px-4 text-center text-white overflow-hidden">
        {/* Stars */}
        <div className="flex justify-center mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${
                i < reviews[index].rating ? "text-green-400" : "text-white/30"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        <p className="text-sm md:text-base leading-relaxed line-clamp-3">
          “{reviews[index].message}”
        </p>

        <p className="mt-2 text-xs text-white/70">
          {reviews[index].name} · {reviews[index].date}
        </p>
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => setIndex((i) => (i + 1) % reviews.length)}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-white/40 text-white text-xl hover:bg-white/20 transition shrink-0"
      >
        ›
      </button>
    </div>
  );
}
