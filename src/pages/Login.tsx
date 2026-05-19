import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { Music, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f]" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-[#12121a]/80 backdrop-blur-xl border border-[#2a2a3a] rounded-2xl p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="YuE Studio" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#e8e8f0] mb-2">
              Welcome to YuE Studio
            </h1>
            <p className="text-sm text-[#8a8aa0]">
              AI-powered music generation studio. Create studio-level production
              music with YuE.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {[
              "Generate full songs with vocals & accompaniment",
              "200+ genre tags for precise style control",
              "Train custom models with your own data",
              "Multi-language lyrics support",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[#8a8aa0]">
                <Music size={14} className="text-[#00e5a0] shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
            className="w-full py-3 bg-[#00e5a0] text-[#0a0a0f] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#00c48c] transition-colors glow-pulse"
          >
            Sign in with Kimi
            <ArrowRight size={18} />
          </button>

          <p className="text-xs text-[#5a5a70] text-center mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}
