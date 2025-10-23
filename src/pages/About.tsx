import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {/* MODIFICATION 1: Added 'text-blue-700' to the main heading */}
            <h1 className="text-4xl font-bold mb-4 text-blue-700">About Us</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              At Cheap Flights, we’re passionate about making travel dreams come
              true. We believe every journey can be life changing a chance to
              explore, unwind, and discover the beauty of the world. Whether
              you’re planning a relaxing beach escape, a cultural adventure, or a
              quick weekend getaway, we’re here to help you find the best deals
              to make it happen.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 text-gray-700 leading-relaxed">
            <p>
              Traveling within your budget shouldn’t mean compromising on quality
              or comfort. That’s why we bring you unbeatable prices on flights,
              hotels, and rental cars from trusted global partners.
            </p>

            {/* MODIFICATION 2: 
              Created the "rectangle box" with a blue theme.
              - 'bg-blue-50' gives the light blue background.
              - 'border border-blue-200' adds the rectangle border.
              - 'rounded-lg p-6 shadow-sm' creates the box shape and padding.
              - The new h2 has 'text-blue-700' to match the main title's tint.
              - The paragraphs inside have a darker 'text-blue-900' tint.
            */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm space-y-4">
              <h2 className="text-2xl font-semibold text-blue-700">
                Our Mission
              </h2>
              <p className="text-blue-900/90">
                Our mission is simple: to make travel affordable, easy, and
                enjoyable for everyone.
              </p>
              <p className="text-blue-900/90">
                With a deep understanding of what travelers need, Cheap Flights
                offers a smooth, hassle-free booking experience designed to save
                you time and money. From comparing prices to securing
                last-minute deals, we handle the hard part so you can focus on
                your next adventure.
              </p>
            </div>
            {/* === END OF NEW BOX === */}

            <p>
              We’re committed to providing exceptional service from the moment
              you book until you return home. And if you find a better deal
              elsewhere, simply email us at{" "}
              <a
                href="mailto:help@chyeap.com"
                className="text-primary font-medium hover:underline"
              >
                help@chyeap.com
              </a>{" "}
               we’ll do our best to beat it!
            </p>
            <p>
              At Cheap Flights, great journeys start with great fares. Let’s make
              your next trip unforgettable.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
