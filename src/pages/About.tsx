import React from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>About CheapFlights | Your Trusted US Travel Booking Partner</title>
        <meta name="description" content="Learn about CheapFlights - America's trusted travel booking platform. We help millions of travelers find the best deals on flights, hotels, and car rentals across the USA." />
        <meta name="keywords" content="about CheapFlights, US travel company, travel booking platform, flight deals company, trusted travel partner" />
        <link rel="canonical" href="https://cheapflights.com/about" />
        <meta property="og:title" content="About CheapFlights | Your Trusted US Travel Booking Partner" />
        <meta property="og:description" content="Learn about CheapFlights - America's trusted travel booking platform." />
      </Helmet>
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gradient-vibrant">About CheapFlights</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              At CheapFlights, we're passionate about making travel dreams come
              true. We believe every journey can be life changing — a chance to
              explore, unwind, and discover the beauty of the world. Whether
              you're planning a relaxing beach escape, a cultural adventure, or a
              quick weekend getaway, we're here to help you find the best deals
              to make it happen.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 text-foreground/80 leading-relaxed">
            <p>
              Traveling within your budget shouldn't mean compromising on quality
              or comfort. That's why we bring you unbeatable prices on flights,
              hotels, and rental cars from trusted global partners.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-2xl font-semibold text-primary">
                Our Mission
              </h2>
              <p className="text-foreground/90">
                Our mission is simple: to make travel affordable, easy, and
                enjoyable for everyone.
              </p>
              <p className="text-foreground/90">
                With a deep understanding of what travelers need, CheapFlights
                offers a smooth, hassle-free booking experience designed to save
                you time and money. From comparing prices to securing
                last-minute deals, we handle the hard part so you can focus on
                your next adventure.
              </p>
            </div>

            <p>
              We're committed to providing exceptional service from the moment
              you book until you return home. And if you find a better deal
              elsewhere, simply email us at{" "}
              <a
                href="mailto:support@cheapflights.com"
                className="text-primary font-medium hover:underline"
              >
                support@cheapflights.com
              </a>{" "}
              — we'll do our best to beat it!
            </p>
            <p>
              At CheapFlights, great journeys start with great fares. Let's make
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
