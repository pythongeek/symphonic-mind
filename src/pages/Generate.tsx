import { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  Download,
  Save,
  FileAudio,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import WaveformVisualizer from "@/components/WaveformVisualizer";

const GENRE_TAGS = [
  "pop", "rock", "electronic", "classical", "jazz", "hip-hop", "r&b",
  "country", "folk", "metal", "punk", "blues", "soul", "funk", "disco",
  "ambient", "lo-fi", "synthwave", "trap", "edm", "house", "techno",
  "trance", "dubstep", "drum-and-bass", "reggae", "latin", "k-pop",
  "j-pop", "c-pop", "indie", "alternative", "progressive", "orchestral",
  "chamber", "opera", "acoustic", "unplugged", "live", "studio",
];

const MOODS = [
  "Uplifting", "Melancholic", "Energetic", "Calm", "Dark", "Bright",
  "Romantic", "Aggressive", "Dreamy", "Nostalgic", "Epic", "Playful",
  "Mysterious", "Hopeful", "Somber", "Exciting", "Peaceful", "Intense",
];

const GENDERS = ["Female", "Male", "Neutral"];
const TIMBRES = ["Airy", "Warm", "Bright", "Nasal", "Breathy", "Rich", "Clear", "Rough"];
const GENERATION_MODES = [
  { value: "cot" as const, label: "Chain of Thought (CoT)" },
  { value: "icl" as const, label: "In-Context Learning (ICL)" },
];

const LYRICS_PLACEHOLDER = `[verse]
Write your lyrics here
Line by line, express your vision
Let the melody guide your words

[chorus]
This is where the chorus goes
The emotional peak of your song
Repeat it, make it memorable

[verse]
Back to another verse
Tell your story, share your truth
Every word is a brushstroke

[bridge]
The bridge changes things up
A new perspective, a twist
Before the final chorus`;

export default function Generate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [gender, setGender] = useState("");
  const [timbre, setTimbre] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [trackName, setTrackName] = useState("");
  const [generationMode, setGenerationMode] = useState<"cot" | "icl">("cot");
  const [sessionsCount, setSessionsCount] = useState(2);
  const [repetitionPenalty, setRepetitionPenalty] = useState(1.1);
  const [maxNewTokens, setMaxNewTokens] = useState(3000);
  const [stage2BatchSize, setStage2BatchSize] = useState(4);
  const [seed, setSeed] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrack, setGeneratedTrack] = useState<{
    id: number;
    name: string;
    status: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateMutation = trpc.generation.startGeneration.useMutation({
    onSuccess: (data) => {
      if (data.track?.insertId) {
        setGeneratedTrack({
          id: Number(data.track.insertId),
          name: trackName,
          status: "processing",
        });
        // Start polling
        pollGenerationStatus(Number(data.track.insertId));
      }
    },
  });

  const { data: pollData } = trpc.generation.pollStatus.useQuery(
    { trackId: generatedTrack?.id || 0 },
    {
      enabled: !!generatedTrack && generatedTrack.status === "processing",
      refetchInterval: 3000,
    }
  );

  useEffect(() => {
    if (pollData?.track && pollData.track.status !== "processing") {
      setGeneratedTrack((prev) =>
        prev
          ? { ...prev, status: pollData.track!.status }
          : null
      );
      if (pollData.track.status === "completed") {
        setIsGenerating(false);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.8 },
          colors: ["#00e5a0", "#4f6ef7", "#8b5cf6", "#00c48c"],
          disableForReducedMotion: true,
        });
        utils.dashboard.stats.invalidate();
        utils.dashboard.recentActivity.invalidate();
      }
    }
  }, [pollData]);

  const pollGenerationStatus = useCallback(
    (_trackId: number) => {
      // Polling is handled by the useQuery hook above
    },
    []
  );

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!trackName.trim()) return;
    setIsGenerating(true);
    await generateMutation.mutateAsync({
      name: trackName,
      genre: selectedGenres.join(", "),
      mood: mood || undefined,
      gender: gender || undefined,
      timbre: timbre || undefined,
      lyrics: lyrics || undefined,
      generationMode,
      sessionsCount,
      maxNewTokens,
      repetitionPenalty,
      stage2BatchSize,
      seed: seed ? parseInt(seed) : undefined,
      tags: selectedGenres.join(", "),
    });
  };

  const isFormValid = trackName.trim() !== "";

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel - Controls */}
        <div className="w-[55%] flex flex-col gap-5 overflow-y-auto scrollbar-thin pr-2">
          {/* Track Name */}
          <div>
            <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-2 block">
              Track Name
            </label>
            <input
              type="text"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="Enter track name..."
              className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#e8e8f0] placeholder:text-[#5a5a70] focus:border-[#00e5a0] focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,160,0.15)] transition-all"
            />
          </div>

          {/* Genre Tags */}
          <div>
            <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-2 block">
              Genre Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_TAGS.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedGenres.includes(genre)
                      ? "bg-[rgba(0,229,160,0.15)] text-[#00e5a0] border border-[rgba(0,229,160,0.3)]"
                      : "bg-[#1a1a25] text-[#8a8aa0] border border-[#2a2a3a] hover:border-[#3a3a50]"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Mood, Gender, Timbre */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-2 block">
                Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select mood...</option>
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-2 block">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-2 block">
                Timbre
              </label>
              <select
                value={timbre}
                onChange={(e) => setTimbre(e.target.value)}
                className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                {TIMBRES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lyrics Editor */}
          <div>
            <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-2 block">
              Lyrics
            </label>
            <div className="relative">
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder={LYRICS_PLACEHOLDER}
                className="w-full h-64 bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4 text-sm text-[#e8e8f0] placeholder:text-[#5a5a70] focus:border-[#00e5a0] focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,160,0.15)] transition-all resize-none font-mono leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-xs text-[#5a5a70]">
                {lyrics.length} / 2000
              </div>
            </div>
          </div>

          {/* Audio Prompt Upload */}
          <div>
            <label className="text-xs font-medium text-[#8a8aa0] uppercase tracking-wider mb-2 block">
              Audio Prompt (Optional)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                audioFile
                  ? "border-[#00e5a0] bg-[rgba(0,229,160,0.05)]"
                  : "border-[#2a2a3a] hover:border-[#3a3a50]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAudioFile(file);
                }}
              />
              {audioFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileAudio size={20} className="text-[#00e5a0]" />
                  <span className="text-sm text-[#e8e8f0]">{audioFile.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioFile(null);
                    }}
                    className="text-[#5a5a70] hover:text-[#ef4444]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-[#5a5a70] mb-2" />
                  <p className="text-sm text-[#8a8aa0]">
                    Drop reference audio here or click to browse
                  </p>
                  <p className="text-xs text-[#5a5a70] mt-1">
                    30s recommended for style transfer
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-[#8a8aa0] hover:text-[#e8e8f0] transition-colors"
            >
              <SlidersHorizontal size={16} />
              Advanced Settings
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#8a8aa0] mb-1 block">
                        Generation Mode
                      </label>
                      <div className="flex gap-2">
                        {GENERATION_MODES.map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() => setGenerationMode(mode.value)}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              generationMode === mode.value
                                ? "bg-[rgba(0,229,160,0.15)] text-[#00e5a0] border border-[rgba(0,229,160,0.3)]"
                                : "bg-[#1a1a25] text-[#8a8aa0] border border-[#2a2a3a]"
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#8a8aa0] mb-1 block">
                        Number of Sessions: {sessionsCount}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={sessionsCount}
                        onChange={(e) => setSessionsCount(Number(e.target.value))}
                        className="w-full accent-[#00e5a0]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8a8aa0] mb-1 block">
                        Max New Tokens
                      </label>
                      <input
                        type="number"
                        value={maxNewTokens}
                        onChange={(e) => setMaxNewTokens(Number(e.target.value))}
                        className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8a8aa0] mb-1 block">
                        Stage 2 Batch Size
                      </label>
                      <input
                        type="number"
                        value={stage2BatchSize}
                        onChange={(e) => setStage2BatchSize(Number(e.target.value))}
                        className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#00e5a0] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8a8aa0] mb-1 block">
                        Repetition Penalty: {repetitionPenalty}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={2}
                        step={0.1}
                        value={repetitionPenalty}
                        onChange={(e) =>
                          setRepetitionPenalty(Number(e.target.value))
                        }
                        className="w-full accent-[#00e5a0]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8a8aa0] mb-1 block">
                        Seed (optional)
                      </label>
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        placeholder="Random"
                        className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] placeholder:text-[#5a5a70] focus:border-[#00e5a0] focus:outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!isFormValid || isGenerating}
            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isGenerating
                ? "bg-[rgba(0,229,160,0.3)] text-[#00e5a0] cursor-not-allowed"
                : isFormValid
                ? "bg-[#00e5a0] text-[#0a0a0f] hover:bg-[#00c48c] glow-pulse"
                : "bg-[#1a1a25] text-[#5a5a70] cursor-not-allowed"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Track
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-[45%] flex flex-col">
          <div className="flex-1 bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">
              Preview
            </h3>
            <div className="flex-1 flex items-center justify-center">
              {generatedTrack ? (
                <div className="w-full space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-[#12121a] to-[#1a1a25] rounded-lg flex items-center justify-center relative overflow-hidden">
                    <WaveformVisualizer
                      isPlaying={isPlaying}
                      isProcessing={generatedTrack.status === "processing"}
                    />
                    {generatedTrack.status === "processing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,10,15,0.5)]">
                        <div className="text-center">
                          <Loader2
                            size={32}
                            className="animate-spin text-[#00e5a0] mx-auto mb-2"
                          />
                          <p className="text-sm text-[#e8e8f0]">Generating...</p>
                          <p className="text-xs text-[#8a8aa0]">
                            This may take a few minutes
                          </p>
                        </div>
                      </div>
                    )}
                    {generatedTrack.status === "completed" && (
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-14 h-14 rounded-full bg-[#00e5a0] flex items-center justify-center hover:bg-[#00c48c] transition-colors shadow-lg">
                          {isPlaying ? (
                            <Pause size={24} className="text-[#0a0a0f]" />
                          ) : (
                            <Play size={24} className="text-[#0a0a0f] ml-1" />
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#e8e8f0]">
                      {generatedTrack.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          generatedTrack.status === "completed"
                            ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]"
                            : generatedTrack.status === "processing"
                            ? "bg-[rgba(245,158,11,0.15)] text-[#f59e0b]"
                            : "bg-[rgba(239,68,68,0.15)] text-[#ef4444]"
                        }`}
                      >
                        {generatedTrack.status}
                      </span>
                      {selectedGenres.length > 0 && (
                        <span className="text-xs text-[#8a8aa0]">
                          {selectedGenres.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  {generatedTrack.status === "completed" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-sm text-[#e8e8f0] hover:bg-[#2a2a3a] transition-colors"
                      >
                        {isPlaying ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                        {isPlaying ? "Pause" : "Play"}
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-sm text-[#e8e8f0] hover:bg-[#2a2a3a] transition-colors">
                        <Download size={16} />
                        Download WAV
                      </button>
                      <button
                        onClick={() => navigate("/library")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-sm text-[#e8e8f0] hover:bg-[#2a2a3a] transition-colors"
                      >
                        <Save size={16} />
                        Save to Library
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src="/generation-console.png"
                    alt=""
                    className="w-48 h-48 mx-auto mb-4 opacity-60"
                  />
                  <p className="text-sm text-[#8a8aa0]">
                    Your generated track will appear here
                  </p>
                  <p className="text-xs text-[#5a5a70] mt-1">
                    Fill in the details and click Generate
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
