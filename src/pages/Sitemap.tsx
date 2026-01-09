import { useEffect } from "react";
import { Link } from "react-router-dom";
import { siteMapData } from "../data/sitemapData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Sitemap() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-10 pt-24 pb-20">
        <h1 className="text-3xl font-bold mb-8">Site Map</h1>

        <div className="space-y-10">
          {siteMapData.map((section) => {
            const hideArrow = section.title === "Traveler Assistance";

            return (
              <div key={section.title}>
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>

                <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {section.links.map((item: any, index: number) => {
                    /* OBJECT LINKS */
                    if (typeof item === "object" && item.label) {
                      const Icon = item.icon;

                      return (
                        <li key={item.label + index}>
                          <Link
                            to={item.href}
                            className="group flex items-center gap-2 text-gray-500 transition-all duration-300 ease-in-out hover:text-blue-500"
                          >
                            {!hideArrow && <span className="opacity-60">&gt;</span>}

                            {Icon && (
                              <Icon
                                size={14}
                                className="transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
                              />
                            )}

                            <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-0.5">
                              {item.label}
                            </span>
                          </Link>
                        </li>
                      );
                    }

                    /* STRING LINKS */
                    return (
                      <li
                        key={item + index}
                        className="text-gray-500 transition-all duration-300 ease-in-out hover:text-blue-500"
                      >
                        {!hideArrow && <span className="opacity-60 mr-1">&gt;</span>}
                        {item}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
}
