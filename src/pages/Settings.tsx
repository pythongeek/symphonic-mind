import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  User,
  Key,
  Cpu,
  Bell,
  CreditCard,
  Camera,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
} from "lucide-react";

type TabId = "profile" | "api" | "model" | "notifications" | "billing";

const tabs: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "api", label: "API Keys", icon: Key },
  { id: "model", label: "Model Config", icon: Cpu },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [showApiKey, setShowApiKey] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#1a1a25] flex items-center justify-center text-2xl font-bold text-[#00e5a0]">
                      {name[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00e5a0] flex items-center justify-center hover:bg-[#00c48c] transition-colors">
                    <Camera size={14} className="text-[#0a0a0f]" />
                  </button>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#e8e8f0]">
                    {user?.name || "User"}
                  </h3>
                  <p className="text-sm text-[#5a5a70]">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,160,0.15)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#5a5a70] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full h-24 bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#5a5a70] focus:border-[#00e5a0] focus:outline-none transition-all resize-none"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#00e5a0] text-[#0a0a0f] rounded-lg text-sm font-semibold hover:bg-[#00c48c] transition-colors"
                >
                  {savedMessage ? (
                    <>
                      <Check size={16} />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        );

      case "api":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                API Key
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm font-mono text-[#e8e8f0] flex items-center">
                  {showApiKey
                    ? "yue_sk_abc123def456ghi789jkl012mno345pqr678stu"
                    : "yue_sk_***************************************"}
                </div>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-[#8a8aa0] hover:text-[#e8e8f0] transition-colors"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button className="px-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-[#8a8aa0] hover:text-[#e8e8f0] transition-colors">
                  <RefreshCw size={16} />
                </button>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                Usage Statistics
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                  <p className="text-2xl font-bold text-[#e8e8f0]">1,247</p>
                  <p className="text-xs text-[#8a8aa0] mt-1">Total Requests</p>
                </div>
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                  <p className="text-2xl font-bold text-[#e8e8f0]">42</p>
                  <p className="text-xs text-[#8a8aa0] mt-1">Today</p>
                </div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                Rate Limits
              </label>
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a8aa0]">Requests per minute</span>
                  <span className="text-[#e8e8f0] font-medium">60</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a8aa0]">Requests per hour</span>
                  <span className="text-[#e8e8f0] font-medium">1,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a8aa0]">Requests per day</span>
                  <span className="text-[#e8e8f0] font-medium">10,000</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      case "model":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                Default Model
              </label>
              <select className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none transition-all appearance-none cursor-pointer">
                <option>YuE-s1-7B-anneal-en-cot</option>
                <option>YuE-s1-7B-anneal-en-icl</option>
                <option>YuE-s1-7B-anneal-zh-cot</option>
                <option>YuE-s1-7B-anneal-zh-icl</option>
              </select>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                Default Generation Mode
              </label>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2.5 bg-[rgba(0,229,160,0.15)] text-[#00e5a0] border border-[rgba(0,229,160,0.3)] rounded-lg text-sm font-medium">
                  Chain of Thought
                </button>
                <button className="flex-1 px-4 py-2.5 bg-[#1a1a25] text-[#8a8aa0] border border-[#2a2a3a] rounded-lg text-sm font-medium hover:bg-[#2a2a3a]">
                  In-Context Learning
                </button>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                Output Format
              </label>
              <select className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none transition-all appearance-none cursor-pointer">
                <option>WAV (Uncompressed)</option>
                <option>MP3 (Compressed)</option>
                <option>FLAC (Lossless)</option>
              </select>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                Default Quality
              </label>
              <select className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none transition-all appearance-none cursor-pointer">
                <option>Standard</option>
                <option>High</option>
                <option>Studio</option>
              </select>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                GPU Preference
              </label>
              <select className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none transition-all appearance-none cursor-pointer">
                <option>Auto-detect</option>
                <option>RTX 4090</option>
                <option>A100 (80GB)</option>
                <option>H800</option>
              </select>
            </motion.div>
            <motion.div variants={itemVariants}>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00e5a0] text-[#0a0a0f] rounded-lg text-sm font-semibold hover:bg-[#00c48c] transition-colors"
              >
                {savedMessage ? (
                  <>
                    <Check size={16} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        );

      case "notifications":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {[
              { label: "Generation Complete", desc: "Get notified when a track finishes generating" },
              { label: "Training Complete", desc: "Get notified when model training finishes" },
              { label: "Weekly Digest", desc: "Receive a weekly summary of your studio activity" },
              { label: "New Features", desc: "Be the first to know about new features and updates" },
              { label: "Usage Alerts", desc: "Get alerts when approaching rate limits" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center justify-between bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#e8e8f0]">{item.label}</p>
                  <p className="text-xs text-[#5a5a70] mt-0.5">{item.desc}</p>
                </div>
                <button
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    index < 3 ? "bg-[#00e5a0]" : "bg-[#2a2a3a]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      index < 3 ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </motion.div>
            ))}
            <motion.div variants={itemVariants}>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00e5a0] text-[#0a0a0f] rounded-lg text-sm font-semibold hover:bg-[#00c48c] transition-colors mt-4"
              >
                {savedMessage ? (
                  <>
                    <Check size={16} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        );

      case "billing":
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                Current Plan
              </label>
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[#00e5a0]">Pro Plan</p>
                    <p className="text-sm text-[#8a8aa0] mt-0.5">$29/month</p>
                  </div>
                  <span className="px-3 py-1 bg-[rgba(0,229,160,0.15)] text-[#00e5a0] text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                Usage This Month
              </label>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#8a8aa0]">Generation Minutes</span>
                    <span className="text-[#e8e8f0]">45 / 120 min</span>
                  </div>
                  <div className="h-2 bg-[#1a1a25] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00e5a0] rounded-full transition-all"
                      style={{ width: "37.5%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#8a8aa0]">Storage</span>
                    <span className="text-[#e8e8f0]">2.3 / 10 GB</span>
                  </div>
                  <div className="h-2 bg-[#1a1a25] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4f6ef7] rounded-full transition-all"
                      style={{ width: "23%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#8a8aa0]">Training Jobs</span>
                    <span className="text-[#e8e8f0]">1 / 5</span>
                  </div>
                  <div className="h-2 bg-[#1a1a25] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8b5cf6] rounded-full transition-all"
                      style={{ width: "20%" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-40 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[rgba(0,229,160,0.08)] text-[#00e5a0]"
                    : "text-[#8a8aa0] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#e8e8f0]"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 min-h-[500px]">
          <h2 className="text-lg font-semibold text-[#e8e8f0] mb-6">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
