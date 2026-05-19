import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Download,
  Trash2,
  Grid3X3,
  List,
  Music,
  X,
  Search,
} from "lucide-react";
import WaveformVisualizer from "@/components/WaveformVisualizer";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "name" | "duration";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Library() {
  const utils = trpc.useUtils();
  const { data: tracks, isLoading } = trpc.tracks.list.useQuery({
    limit: 50,
    offset: 0,
  });
  const deleteMutation = trpc.tracks.delete.useMutation({
    onSuccess: () => {
      utils.tracks.list.invalidate();
    },
  });

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedTrackData = tracks?.find((t) => t.id === selectedTrack);

  const filteredTracks = (tracks || [])
    .filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.genre || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const togglePlay = (trackId: number) => {
    if (playingTrack === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setPlayingTrack(trackId);
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statusColors: Record<string, string> = {
    completed: "bg-[rgba(34,197,94,0.15)] text-[#22c55e]",
    processing: "bg-[rgba(245,158,11,0.15)] text-[#f59e0b]",
    failed: "bg-[rgba(239,68,68,0.15)] text-[#ef4444]",
    draft: "bg-[rgba(138,138,160,0.15)] text-[#8a8aa0]",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1400px] mx-auto space-y-6"
    >
      {/* Controls */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a70]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks..."
              className="bg-[#12121a] border border-[#2a2a3a] rounded-lg pl-9 pr-4 py-2 text-sm text-[#e8e8f0] placeholder:text-[#5a5a70] focus:border-[#00e5a0] focus:outline-none w-64 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="flex items-center gap-1 bg-[#12121a] border border-[#2a2a3a] rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-[#1a1a25] text-[#e8e8f0]"
                : "text-[#5a5a70] hover:text-[#8a8aa0]"
            }`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "list"
                ? "bg-[#1a1a25] text-[#e8e8f0]"
                : "text-[#5a5a70] hover:text-[#8a8aa0]"
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </motion.div>

      {/* Tracks */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-4 gap-4"
              : "space-y-2"
          }
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`bg-[#12121a] border border-[#2a2a3a] skeleton-shimmer ${
                viewMode === "grid" ? "rounded-xl aspect-square" : "rounded-lg h-16"
              }`}
            />
          ))}
        </div>
      ) : filteredTracks.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-4 gap-4">
            {filteredTracks.map((track) => (
              <motion.div
                key={track.id}
                variants={itemVariants}
                className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden hover:border-[#3a3a50] transition-all group cursor-pointer"
                onClick={() => setSelectedTrack(track.id)}
              >
                <div className="aspect-square bg-gradient-to-br from-[#12121a] to-[#1a1a25] relative overflow-hidden">
                  <img
                    src="/track-placeholder.jpg"
                    alt=""
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(track.id);
                    }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#00e5a0] flex items-center justify-center">
                      {playingTrack === track.id && isPlaying ? (
                        <Pause size={20} className="text-[#0a0a0f]" />
                      ) : (
                        <Play size={20} className="text-[#0a0a0f] ml-0.5" />
                      )}
                    </div>
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-[#e8e8f0] truncate">
                    {track.name}
                  </h3>
                  <p className="text-xs text-[#5a5a70] mt-0.5">
                    {formatDuration(track.duration)} &bull; {track.genre || "Unknown"} &bull;{" "}
                    {new Date(track.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTracks.map((track) => (
              <motion.div
                key={track.id}
                variants={itemVariants}
                className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3 flex items-center gap-3 hover:border-[#3a3a50] transition-all group cursor-pointer"
                onClick={() => setSelectedTrack(track.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay(track.id);
                  }}
                  className="w-10 h-10 rounded-lg bg-[#1a1a25] flex items-center justify-center shrink-0 group-hover:bg-[rgba(0,229,160,0.15)] transition-colors"
                >
                  {playingTrack === track.id && isPlaying ? (
                    <Pause size={16} className="text-[#00e5a0]" />
                  ) : (
                    <Play size={16} className="text-[#8a8aa0] group-hover:text-[#00e5a0] ml-0.5" />
                  )}
                </button>
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <img
                    src="/track-placeholder.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#e8e8f0] truncate">
                    {track.name}
                  </h3>
                  <p className="text-xs text-[#5a5a70]">
                    {track.genre || "Unknown"} &bull;{" "}
                    {track.generationMode?.toUpperCase() || "COT"}
                  </p>
                </div>
                <span className="text-xs text-[#5a5a70]">
                  {formatDuration(track.duration)}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                    statusColors[track.status] || statusColors.draft
                  }`}
                >
                  {track.status}
                </span>
                <span className="text-xs text-[#5a5a70]">
                  {new Date(track.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate({ id: track.id });
                  }}
                  className="p-1.5 text-[#5a5a70] hover:text-[#ef4444] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-12 text-center">
          <Music size={40} className="mx-auto text-[#2a2a3a] mb-3" />
          <p className="text-[#8a8aa0] text-sm">No tracks found</p>
          <p className="text-[#5a5a70] text-xs mt-1">
            {searchQuery
              ? "Try a different search term"
              : "Generate your first track to see it here"}
          </p>
        </div>
      )}

      {/* Track Detail Slide-over */}
      <AnimatePresence>
        {selectedTrack && selectedTrackData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(10,10,15,0.7)] backdrop-blur-sm z-50"
            onClick={() => setSelectedTrack(null)}
          >
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute right-0 top-0 h-full w-[420px] max-w-full bg-[#12121a] border-l border-[#2a2a3a] overflow-y-auto scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#e8e8f0]">
                    Track Details
                  </h2>
                  <button
                    onClick={() => setSelectedTrack(null)}
                    className="text-[#5a5a70] hover:text-[#e8e8f0] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Waveform */}
                <div className="h-32 bg-[#1a1a25] rounded-xl mb-5 overflow-hidden">
                  <WaveformVisualizer
                    isPlaying={
                      playingTrack === selectedTrackData.id && isPlaying
                    }
                    isProcessing={selectedTrackData.status === "processing"}
                  />
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                      Name
                    </label>
                    <p className="text-sm font-semibold text-[#e8e8f0]">
                      {selectedTrackData.name}
                    </p>
                  </div>

                  {selectedTrackData.description && (
                    <div>
                      <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                        Description
                      </label>
                      <p className="text-sm text-[#8a8aa0]">
                        {selectedTrackData.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                        Duration
                      </label>
                      <p className="text-sm text-[#e8e8f0]">
                        {formatDuration(selectedTrackData.duration)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                        Genre
                      </label>
                      <p className="text-sm text-[#e8e8f0]">
                        {selectedTrackData.genre || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                        Mode
                      </label>
                      <p className="text-sm text-[#e8e8f0]">
                        {selectedTrackData.generationMode?.toUpperCase() || "COT"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                        Status
                      </label>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          statusColors[selectedTrackData.status] ||
                          statusColors.draft
                        }`}
                      >
                        {selectedTrackData.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                        Created
                      </label>
                      <p className="text-sm text-[#e8e8f0]">
                        {new Date(selectedTrackData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                        Sessions
                      </label>
                      <p className="text-sm text-[#e8e8f0]">
                        {selectedTrackData.sessionsCount || 2}
                      </p>
                    </div>
                  </div>

                  {selectedTrackData.tags && (
                    <div>
                      <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1 block">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {selectedTrackData.tags.split(",").map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-[rgba(0,229,160,0.1)] text-[#00e5a0] text-xs rounded-md"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-[#2a2a3a]">
                    <button
                      onClick={() => togglePlay(selectedTrackData.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00e5a0] text-[#0a0a0f] rounded-lg text-sm font-semibold hover:bg-[#00c48c] transition-colors"
                    >
                      {playingTrack === selectedTrackData.id && isPlaying ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      {playingTrack === selectedTrackData.id && isPlaying
                        ? "Pause"
                        : "Play"}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1a1a25] border border-[#2a2a3a] text-[#e8e8f0] rounded-lg text-sm font-medium hover:bg-[#2a2a3a] transition-colors">
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        deleteMutation.mutate({ id: selectedTrackData.id });
                        setSelectedTrack(null);
                      }}
                      className="px-3 py-2.5 bg-[#1a1a25] border border-[#2a2a3a] text-[#ef4444] rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
