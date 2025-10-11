import { Phone, Mail } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-blue-50 to-white px-4">
      <h1 className="text-5xl font-bold text-primary mb-4">Our Agent Will Contact You Soon</h1>
      <p className="text-lg text-gray-600 mb-6">The page you’re looking for doesn’t exist or something went wrong.</p>

      <div className="flex flex-col items-center gap-2 text-gray-700">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <a href="tel:+18001234567" className="hover:underline">
            +1 800 123 4567
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <a href="mailto:support@travelbooking.com" className="hover:underline">
            support@travelbooking.com
          </a>
        </div>
      </div>

      <a
        href="/"
        className="mt-8 inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary/90 transition"
      >
        Go Back Home
      </a>
    </div>
  );
};

export default NotFound;
