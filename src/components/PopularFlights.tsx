const airlines = [
  {
    name: "Virgin Atlantic",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Virgin_Atlantic_logo.svg",
  },
  {
    name: "Gulf Air",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUUpDipSVClCKWAM5O2krqGSWqal5XGeztdQ&s",
  },
  {
    name: "Oman Air",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu067JemC1GRfI4cJcSI5rKyzS0iTK8JSUvA&s",
  },
  {
    name: "American Airlines",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn2SKXRlALaCj6dUxlhGDcsqSwxzKMz_4tRQ&s",
  },
  {
    name: "Delta Air Lines",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Delta_logo.svg",
  },
  {
    name: "British Airways",
    logo: "https://i.pinimg.com/564x/49/57/07/4957072a43937ac100d9e2052fc95d70.jpg",
  },
];

const PopularFlights = () => {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Premium Airline Partners
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We partner with the world's most trusted carriers to ensure a safe and comfortable journey.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto">
          {airlines.map((airline) => (
            <div
              key={airline.name}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 md:p-6 flex items-center justify-center h-20 md:h-24 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-300 group cursor-pointer"
            >
              <img
                src={airline.logo}
                alt={airline.name}
                className="h-8 md:h-10 w-auto object-contain max-w-[100px] md:max-w-[120px] group-hover:opacity-100 transition-opacity  group-hover:grayscale-0 card-unified"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `<span class="text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">${airline.name}</span>`;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularFlights;
