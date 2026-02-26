import React from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Airline = {
  name: string;
  code: string;
  logo: string;
  statusUrl: string;
  checkinUrl: string;
  contactUrl: string;
};

const WebCheckIn = () => {
  const airlines: Airline[] = [
    {
      name: "American Airlines",
      code: "AA",
      logo: "https://www.aa.com/content/images/chrome/rebrand/aa-logo.png",
      statusUrl: "https://www.aa.com/travelInformation/flights/status",
      checkinUrl: "https://www.aa.com/i18n/travel-info/check-in-and-arrival.jsp",
      contactUrl: "https://www.aa.com/contact/forms?topic=CR",
    },
    {
      name: "Delta Air Lines",
      code: "DL",
      logo: "https://www.tramatm.com/_next/image?url=https%3A%2F%2Ftrama-static.s3.eu-central-1.amazonaws.com%2Fimages%2Fhall-of-fame%2Flogos%2F141-logo.png&w=1920&q=75",
      statusUrl: "https://www.delta.com/flightstatus",
      checkinUrl: "https://www.delta.com/PCCOciWeb/app/index.html#/landing",
      contactUrl: "https://www.delta.com/us/en/need-help/overview",
    },
    {
      name: "United Airlines",
      code: "UA",
      logo: "https://static.vecteezy.com/system/resources/previews/070/344/209/non_2x/united-airlines-logo-transparent-united-airlines-icon-free-png.png",
      statusUrl: "https://www.united.com/en/us/flightstatus",
      checkinUrl: "https://www.united.com/en/us/checkin",
      contactUrl: "https://www.united.com/en/us/fly/help-center.html",
    },
    {
      name: "Southwest Airlines",
      code: "WN",
      logo: "https://static.vecteezy.com/system/resources/previews/073/495/040/non_2x/southwest-airlines-logo-glossy-circle-icon-with-transparent-background-free-png.png",
      statusUrl: "https://www.southwest.com/flight-status/",
      checkinUrl: "https://www.southwest.com/air/check-in/index.html",
      contactUrl: "https://support.southwest.com/helpcenter/s/",
    },
    {
      name: "Alaska Airlines",
      code: "AS",
      logo: "https://toppng.com/uploads/preview/vector-royalty-free-download-airlines-logo-png-transparent-alaska-air-logo-115636320212walq1avlu.png",
      statusUrl: "https://www.alaskaair.com/flightstatus?INT=sitemap-prodID:FlightStatus",
      checkinUrl: "https://reservations.alaskaair.com/checkin/",
      contactUrl: "https://www.alaskaair.com/content/about-us/help-contact",
    },
    {
      name: "JetBlue",
      code: "B6",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjtz3GgwxoYI1xpceBCcVCiXIu8qdxYsbJz6Nq74Cb&s",
      statusUrl: "https://www.jetblue.com/help/flight-status",
      checkinUrl: "https://www.spirit.com/#checkin",
      contactUrl: "https://www.jetblue.com/contact-us",
    },
    {
      name: "Spirit Airlines",
      code: "NK",
      logo: "https://images.seeklogo.com/logo-png/27/1/spirit-airlines-logo-png_seeklogo-278034.png",
      statusUrl: "https://www.spirit.com/flight-status",
      checkinUrl: "https://www.spirit.com/check-in",
      contactUrl: "https://customersupport.spirit.com/en-us/",
    },
    {
      name: "Frontier Airlines",
      code: "F9",
      logo: "https://1000logos.net/wp-content/uploads/2020/03/Frontier-Airlines-Logo.png",
      statusUrl: "https://www.flyfrontier.com/travel/my-trips/flight-status/",
      checkinUrl: "https://www.flyfrontier.com/travel/my-trips/check-in/",
      contactUrl: "https://www.flyfrontier.com/customer-service/",
    },
    {
      name: "Hawaiian Airlines",
      code: "HA",
      logo: "https://1000logos.net/wp-content/uploads/2020/03/Hawaiian-Airlines-Logo-640x400.png",
      statusUrl: "https://www.hawaiianairlines.com/flight-status",
      checkinUrl: "https://hawaiianair.custhelp.com/",
      contactUrl: "https://www.hawaiianairlines.com/contact-us",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Airlines Web Check-In | Chyeap</title>
        <meta
          name="description"
          content="Find official airline web check-in links, flight status pages, and contact update links."
        />
        <meta
          name="keywords"
          content="airline web check-in, web check in, flight status, online check-in, Chyeap"
        />
        <link rel="canonical" href="https://chyeap.com/webcheck-in" />
        <meta property="og:title" content="Airlines Web Check-In | Chyeap" />
        <meta
          property="og:description"
          content="Find official airline web check-in links, flight status pages, and contact update links."
        />
      </Helmet>

      <Header />

      <main className="flex-1 pt-20 pb-16">
        {/* Banner */}
        <section
          className="relative text-white overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.10)), url('https://crm.flightsmojo.in//UploadedImages/0ea1796b-0336-4bc8-abea-b7fd625d6feb.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container mx-auto px-4 py-12 md:py-16 text-center">
            <h1 className="text-3xl md:text-6xl font-bold">
              Airlines Web Check-In
            </h1>
            <p className="mt-2 text-white/90 max-w-3xl text-xl mx-auto">
              Use the official airline links below to check flight status,
              complete web check-in, or update contact details.
            </p>
          </div>
        </section>

        {/* Desktop table */}
        <section className="container mx-auto px-4 mt-10 hidden md:block">
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <div className="grid grid-cols-12 bg-muted/30 border-b border-border">
              <div className="col-span-3 p-4 font-semibold text-foreground">
                Airline
              </div>
              <div className="col-span-3 p-4 font-semibold text-foreground">
                Check Flight Status
              </div>
              <div className="col-span-3 p-4 font-semibold text-foreground">
                Web Check-In
              </div>
              <div className="col-span-3 p-4 font-semibold text-foreground">
                Update Contact Details
              </div>
            </div>

            {airlines.map((a) => (
              <div
                key={a.code}
                className="grid grid-cols-12 border-b border-border last:border-b-0"
              >
                <div className="col-span-3 p-4 flex items-center gap-3">
                  <img
                    src={a.logo}
                    alt={`${a.name} logo`}
                    className="h-10 w-10 object-contain"
                    loading="lazy"
                  />
                  <div className="font-semibold text-foreground">{a.name}</div>
                </div>

                <div className="col-span-3 p-4 break-all">
                  <a
                    href={a.statusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {a.statusUrl}
                  </a>
                </div>

                <div className="col-span-3 p-4 break-all">
                  <a
                    href={a.checkinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {a.checkinUrl}
                  </a>
                </div>

                <div className="col-span-3 p-4 break-all">
                  <a
                    href={a.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {a.contactUrl}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Links open on official airline websites.
          </p>
        </section>

        {/* Mobile stacked cards */}
        <section className="container mx-auto px-4 mt-10 md:hidden">
          <div className="space-y-4">
            {airlines.map((a) => (
              <div
                key={a.code}
                className="rounded-xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={a.logo}
                    alt={`${a.name} logo`}
                    className="h-10 w-10 object-contain"
                    loading="lazy"
                  />
                  <div className="font-semibold text-foreground">{a.name}</div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Check Flight Status
                    </div>
                    <a
                      href={a.statusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all font-medium"
                    >
                      {a.statusUrl}
                    </a>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Web Check-In
                    </div>
                    <a
                      href={a.checkinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all font-medium"
                    >
                      {a.checkinUrl}
                    </a>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Update Contact Details
                    </div>
                    <a
                      href={a.contactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all font-medium"
                    >
                      {a.contactUrl}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WebCheckIn;
