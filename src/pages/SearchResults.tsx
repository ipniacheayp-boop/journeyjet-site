import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import { mockDeals } from "@/data/mockDeals";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "flights";
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Search Results</h1>
            {origin && destination && (
              <p className="text-muted-foreground">
                Showing {type} from {origin} to {destination}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
