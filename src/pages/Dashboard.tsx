import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import {
  Music,
  Database,
  Clock,
  TrendingUp,
  Play,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Dashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: recent } = trpc.dashboard.recentActivity.useQuery();

  const statCards = [
    {
      title: "Total Tracks",
      value: stats?.totalTracks?.toString() || "0",
      label: "Generated Tracks",
      icon: TrendingUp,
      iconColor: "text-[#00e5a0]",
      subtext: `+${stats?.recentTracks || 0} this week`,
      subColor: "text-[#00e5a0]",
    },
    {
      title: "Training Data",
      value: stats?.totalDatasetSize || "0 GB",
      label: "Training Datasets",
      icon: Database,
      iconColor: "text-[#4f6ef7]",
      subtext: `${stats?.totalDatasets || 0} datasets active`,
      subColor: "text-[#4f6ef7]",
    },
    {
      title: "This Month",
      value: stats?.thisMonthTracks?.toString() || "0",
      label: "Tracks Generated",
      icon: Music,
      iconColor: "text-[#8b5cf6]",
      subtext: "5 this week",
      subColor: "text-[#8b5cf6]",
    },
    {
      title: "Studio Time",
      value: "28h",
      label: "Generation Time",
      icon: Clock,
      iconColor: "text-[#f59e0b]",
      subtext: "-3h from last",
      subColor: "text-[#f59e0b]",
    },
  ];

  const statusColors: Record<string, string> = {
    completed: "bg-[rgba(34,197,94,0.15)] text-[#22c55e]",
    processing: "bg-[rgba(245,158,11,0.15)] text-[#f59e0b]",
    draft: "bg-[rgba(138,138,160,0.15)] text-[#8a8aa0]",
    failed: "bg-[rgba(239,68,68,0.15)] text-[#ef4444]",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[#8a8aa0] text-xs uppercase tracking-wider font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-[#e8e8f0]">{stat.value}</p>
              </div>
              <stat.icon className={stat.iconColor} size={20} />
            </div>
            <p className="text-xs text-[#5a5a70] mb-1">{stat.label}</p>
            <p className={`text-xs font-medium ${stat.subColor}`}>{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      {/* Activity Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#e8e8f0]">
            Generation Activity
          </h2>
          <div className="flex gap-1 bg-[#1a1a25] rounded-lg p-1">
            {["7 Days", "30 Days", "Year"].map((range) => (
              <button
                key={range}
                className="px-3 py-1 text-xs font-medium text-[#8a8aa0] hover:text-[#e8e8f0] rounded-md transition-colors"
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.activityData || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2a2a3a"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#5a5a70"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#5a5a70"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a25",
                  border: "1px solid #2a2a3a",
                  borderRadius: "8px",
                  color: "#e8e8f0",
                  fontSize: "13px",
                }}
                cursor={{ fill: "rgba(0,229,160,0.05)" }}
              />
              <Bar
                dataKey="tracks"
                fill="#00e5a0"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <Link
          to="/generate"
          className="flex items-center gap-2 px-5 py-3 bg-[#00e5a0] text-[#0a0a0f] rounded-xl text-sm font-semibold hover:bg-[#00c48c] transition-colors"
        >
          <Sparkles size={18} />
          Generate New Track
        </Link>
        <Link
          to="/training"
          className="flex items-center gap-2 px-5 py-3 bg-[#12121a] text-[#00e5a0] border border-[#00e5a0]/30 rounded-xl text-sm font-semibold hover:bg-[rgba(0,229,160,0.08)] transition-colors"
        >
          <Database size={18} />
          Upload Training Data
        </Link>
        <Link
          to="/library"
          className="flex items-center gap-2 px-5 py-3 bg-[#12121a] text-[#4f6ef7] border border-[#4f6ef7]/30 rounded-xl text-sm font-semibold hover:bg-[rgba(79,110,247,0.08)] transition-colors"
        >
          <FolderOpen size={18} />
          Browse Library
        </Link>
      </motion.div>

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-[#e8e8f0] mb-4">
          Recent Projects
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {(recent?.projects || []).slice(0, 6).map((project) => (
            <div
              key={project.id}
              className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden hover:border-[#3a3a50] transition-colors group"
            >
              <div className="aspect-video bg-gradient-to-br from-[#12121a] to-[#1a1a25] flex items-center justify-center relative overflow-hidden">
                <img
                  src="/track-placeholder.jpg"
                  alt=""
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-[#00e5a0] flex items-center justify-center">
                    <Play size={18} className="text-[#0a0a0f] ml-0.5" />
                  </div>
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#e8e8f0] truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-[#5a5a70] mt-1">
                      {project.genre || "No genre"} &bull; {project.sessionsCount}{" "}
                      sessions &bull;{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      statusColors[project.status] || statusColors.draft
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {(!recent?.projects || recent.projects.length === 0) && (
            <div className="col-span-3 bg-[#12121a] border border-[#2a2a3a] rounded-xl p-8 text-center">
              <Music size={32} className="mx-auto text-[#2a2a3a] mb-3" />
              <p className="text-[#8a8aa0] text-sm">No projects yet</p>
              <Link
                to="/generate"
                className="text-[#00e5a0] text-sm hover:underline mt-1 inline-block"
              >
                Create your first project
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
