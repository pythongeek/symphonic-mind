import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  FolderOpen,
  Upload,
  X,
  Trash2,
  Brain,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  FileAudio,
  FileText,
  Music,
  Layers,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const DATASET_TYPE_ICONS: Record<string, typeof FileAudio> = {
  audio: FileAudio,
  lyrics: FileText,
  midi: Music,
  mixed: Layers,
};

const DATASET_TYPE_LABELS: Record<string, string> = {
  audio: "Audio Files",
  lyrics: "Lyrics Text",
  midi: "MIDI Files",
  mixed: "Mixed",
};

const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle; color: string; bg: string }
> = {
  ready: {
    icon: CheckCircle,
    color: "text-[#22c55e]",
    bg: "bg-[rgba(34,197,94,0.15)]",
  },
  processing: {
    icon: Loader2,
    color: "text-[#f59e0b]",
    bg: "bg-[rgba(245,158,11,0.15)]",
  },
  error: {
    icon: AlertCircle,
    color: "text-[#ef4444]",
    bg: "bg-[rgba(239,68,68,0.15)]",
  },
};

export default function TrainingHub() {
  const utils = trpc.useUtils();
  const { data: datasets, isLoading } = trpc.training.list.useQuery();
  const { data: stats } = trpc.training.stats.useQuery();
  const deleteMutation = trpc.training.delete.useMutation({
    onSuccess: () => {
      utils.training.list.invalidate();
      utils.training.stats.invalidate();
    },
  });
  const createMutation = trpc.training.create.useMutation({
    onSuccess: () => {
      utils.training.list.invalidate();
      utils.training.stats.invalidate();
      setShowUpload(false);
    },
  });

  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadType, setUploadType] = useState<"audio" | "lyrics" | "midi" | "mixed">("audio");
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);

  const handleCreateDataset = async () => {
    if (!uploadName.trim()) return;
    await createMutation.mutateAsync({
      name: uploadName,
      description: uploadDescription || undefined,
      datasetType: uploadType,
      fileCount: uploadFiles.length,
    });
    setUploadName("");
    setUploadDescription("");
    setUploadFiles([]);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1400px] mx-auto space-y-6"
    >
      {/* Stats + Actions */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <motion.div
            variants={itemVariants}
            className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 min-w-[200px]"
          >
            <p className="text-xs text-[#8a8aa0] uppercase tracking-wider font-medium mb-1">
              Total Datasets
            </p>
            <p className="text-2xl font-bold text-[#e8e8f0]">
              {stats?.total || 0}
            </p>
            <p className="text-xs text-[#5a5a70] mt-1">{stats?.totalSize || "0 GB"} total</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 min-w-[200px]"
          >
            <p className="text-xs text-[#8a8aa0] uppercase tracking-wider font-medium mb-1">
              Ready to Train
            </p>
            <p className="text-2xl font-bold text-[#e8e8f0]">
              {stats?.ready || 0}
            </p>
            <p className="text-xs text-[#5a5a70] mt-1">datasets available</p>
          </motion.div>
        </div>
        <motion.button
          variants={itemVariants}
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#00e5a0] text-[#0a0a0f] rounded-xl text-sm font-semibold hover:bg-[#00c48c] transition-colors"
        >
          <Plus size={18} />
          Upload New Dataset
        </motion.button>
      </div>

      {/* Datasets List */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-[#e8e8f0] mb-4">
          Your Datasets
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-[#12121a] border border-[#2a2a3a] rounded-xl skeleton-shimmer"
              />
            ))}
          </div>
        ) : datasets && datasets.length > 0 ? (
          <div className="space-y-3">
            {datasets.map((dataset) => {
              const TypeIcon = DATASET_TYPE_ICONS[dataset.datasetType] || FolderOpen;
              const statusConfig = STATUS_CONFIG[dataset.status] || STATUS_CONFIG.processing;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={dataset.id}
                  className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 flex items-center gap-4 hover:border-[#3a3a50] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[rgba(0,229,160,0.1)] flex items-center justify-center shrink-0">
                    <TypeIcon size={24} className="text-[#00e5a0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#e8e8f0]">
                      {dataset.name}
                    </h3>
                    <p className="text-xs text-[#5a5a70] mt-0.5 truncate">
                      {dataset.description || "No description"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[#8a8aa0]">
                        {dataset.fileCount} files
                      </span>
                      <span className="text-xs text-[#5a5a70]">|</span>
                      <span className="text-xs text-[#8a8aa0]">
                        {dataset.totalSize || "Unknown size"}
                      </span>
                      <span className="text-xs text-[#5a5a70]">|</span>
                      <span className="text-xs text-[#8a8aa0]">
                        {DATASET_TYPE_LABELS[dataset.datasetType]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                    >
                      <StatusIcon size={12} />
                      {dataset.status.charAt(0).toUpperCase() +
                        dataset.status.slice(1)}
                    </span>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(0,229,160,0.1)] text-[#00e5a0] rounded-lg text-xs font-medium hover:bg-[rgba(0,229,160,0.2)] transition-colors">
                      <Brain size={14} />
                      Train
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate({ id: dataset.id })}
                      className="p-2 text-[#5a5a70] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-12 text-center">
            <Database size={40} className="mx-auto text-[#2a2a3a] mb-3" />
            <p className="text-[#8a8aa0] text-sm">No datasets uploaded yet</p>
            <p className="text-[#5a5a70] text-xs mt-1">
              Upload audio, lyrics, or MIDI files to train custom models
            </p>
          </div>
        )}
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(10,10,15,0.7)] backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 w-[480px] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#e8e8f0]">
                  Upload Training Dataset
                </h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-[#5a5a70] hover:text-[#e8e8f0] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                    Dataset Name
                  </label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="My Vocal Dataset"
                    className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#5a5a70] focus:border-[#00e5a0] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Describe your dataset..."
                    className="w-full h-20 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#5a5a70] focus:border-[#00e5a0] focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-1.5 block">
                    Dataset Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      Object.keys(DATASET_TYPE_LABELS) as Array<
                        "audio" | "lyrics" | "midi" | "mixed"
                      >
                    ).map((type) => (
                      <button
                        key={type}
                        onClick={() => setUploadType(type)}
                        className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          uploadType === type
                            ? "bg-[rgba(0,229,160,0.15)] text-[#00e5a0] border border-[rgba(0,229,160,0.3)]"
                            : "bg-[#1a1a25] text-[#8a8aa0] border border-[#2a2a3a]"
                        }`}
                      >
                        {DATASET_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-[#2a2a3a] rounded-lg p-8 text-center">
                  <Upload size={24} className="mx-auto text-[#5a5a70] mb-2" />
                  <p className="text-sm text-[#8a8aa0]">
                    Drop files here or click to browse
                  </p>
                  <p className="text-xs text-[#5a5a70] mt-1">
                    Supports WAV, MP3, MIDI, TXT files
                  </p>
                </div>

                <button
                  onClick={handleCreateDataset}
                  disabled={!uploadName.trim() || createMutation.isPending}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    uploadName.trim()
                      ? "bg-[#00e5a0] text-[#0a0a0f] hover:bg-[#00c48c]"
                      : "bg-[#1a1a25] text-[#5a5a70] cursor-not-allowed"
                  }`}
                >
                  {createMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {createMutation.isPending ? "Creating..." : "Create Dataset"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
