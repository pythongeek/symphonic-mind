import { Link } from "react-router";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#00e5a0] mb-4">404</h1>
        <p className="text-lg text-[#e8e8f0] mb-2">Page not found</p>
        <p className="text-sm text-[#8a8aa0] mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00e5a0] text-[#0a0a0f] rounded-xl text-sm font-semibold hover:bg-[#00c48c] transition-colors"
        >
          <Home size={16} />
          Back to Studio
        </Link>
      </div>
    </div>
  );
}
