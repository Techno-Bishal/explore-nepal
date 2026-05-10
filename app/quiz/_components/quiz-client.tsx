"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain, Compass, Heart, Camera, BookOpen, Tent,
  TreePine, Sun, Moon, Sparkles, ArrowRight, ArrowLeft,
  Check, Loader2, Map
} from "lucide-react";
import Link from "next/link";

const PERSONALITIES = {
  "Adventure Explorer": {
    icon: "⛰️",
    color: "from-orange-500 to-red-500",
    description: "You thrive on adrenaline and love pushing boundaries. Nepal's rugged trails, high-altitude passes, and extreme sports call to your fearless spirit.",
    traits: ["Fearless", "Energetic", "Spontaneous", "Resilient"],
    recommendations: ["Everest Base Camp", "Annapurna Circuit", "Tilicho Lake", "Upper Mustang"],
  },
  "Peaceful Wanderer": {
    icon: "🧘",
    color: "from-teal-500 to-cyan-500",
    description: "You seek tranquility and spiritual connection. Nepal's serene monasteries, misty valleys, and sacred sites resonate deeply with your soul.",
    traits: ["Mindful", "Reflective", "Patient", "Spiritual"],
    recommendations: ["Lumbini", "Boudhanath", "Rara Lake", "Bandipur"],
  },
  "Culture Enthusiast": {
    icon: "🎭",
    color: "from-purple-500 to-pink-500",
    description: "You're fascinated by traditions, festivals, and local life. Nepal's living heritage, ancient temples, and vibrant communities fuel your curiosity.",
    traits: ["Curious", "Respectful", "Social", "Open-minded"],
    recommendations: ["Bhaktapur", "Patan", "Kathmandu", "Janakpur"],
  },
  "Nature Photographer": {
    icon: "📷",
    color: "from-green-500 to-emerald-500",
    description: "You see the world through your lens. Nepal's dramatic landscapes, rare wildlife, and golden sunrises are your perfect subjects.",
    traits: ["Observant", "Creative", "Patient", "Detail-oriented"],
    recommendations: ["Nagarkot", "Ghorepani Poon Hill", "Chitwan National Park", "Dhulikhel"],
  },
  "Budget Backpacker": {
    icon: "🎒",
    color: "from-amber-500 to-yellow-500",
    description: "You believe the best experiences don't need luxury. Nepal's affordable teahouses, local food stalls, and community homestays are your playground.",
    traits: ["Resourceful", "Flexible", "Adventurous", "Social"],
    recommendations: ["Pokhara", "Ghandruk", "Ilam", "Tansen"],
  },
  "Spiritual Seeker": {
    icon: "🙏",
    color: "from-indigo-500 to-violet-500",
    description: "You travel to connect with something greater. Nepal's sacred temples, meditation retreats, and pilgrimage routes speak to your inner journey.",
    traits: ["Devoted", "Contemplative", "Humble", "Seeking"],
    recommendations: ["Pashupatinath", "Muktinath", "Pathivara", "Halesi Mahadev"],
  },
};

type PersonalityKey = keyof typeof PERSONALITIES;

const QUESTIONS = [
  {
    id: 1,
    question: "It's your first morning in Nepal. What do you do?",
    icon: Sun,
    options: [
      { text: "Head to the highest viewpoint for sunrise", scores: { "Adventure Explorer": 3, "Nature Photographer": 2 } },
      { text: "Visit a local temple for morning prayers", scores: { "Spiritual Seeker": 3, "Peaceful Wanderer": 2 } },
      { text: "Explore the old town streets and markets", scores: { "Culture Enthusiast": 3, "Budget Backpacker": 1 } },
      { text: "Find a quiet garden and meditate", scores: { "Peaceful Wanderer": 3, "Spiritual Seeker": 1 } },
    ],
  },
  {
    id: 2,
    question: "Your ideal Nepal accommodation is...",
    icon: Tent,
    options: [
      { text: "A high-altitude mountain lodge", scores: { "Adventure Explorer": 3, "Nature Photographer": 1 } },
      { text: "A Buddhist monastery guesthouse", scores: { "Spiritual Seeker": 3, "Peaceful Wanderer": 2 } },
      { text: "A heritage Newari home stay", scores: { "Culture Enthusiast": 3, "Budget Backpacker": 1 } },
      { text: "A lakeside resort with mountain views", scores: { "Nature Photographer": 2, "Peaceful Wanderer": 2 } },
    ],
  },
  {
    id: 3,
    question: "Which activity excites you the most?",
    icon: Compass,
    options: [
      { text: "Paragliding over Pokhara valley", scores: { "Adventure Explorer": 3 } },
      { text: "Learning traditional Thangka painting", scores: { "Culture Enthusiast": 3, "Peaceful Wanderer": 1 } },
      { text: "Capturing rhinos in Chitwan at dawn", scores: { "Nature Photographer": 3 } },
      { text: "Joining a Vipassana meditation retreat", scores: { "Spiritual Seeker": 3, "Peaceful Wanderer": 1 } },
    ],
  },
  {
    id: 4,
    question: "What matters most in your travel experience?",
    icon: Heart,
    options: [
      { text: "Conquering challenges and personal limits", scores: { "Adventure Explorer": 3 } },
      { text: "Finding inner peace and clarity", scores: { "Peaceful Wanderer": 3, "Spiritual Seeker": 1 } },
      { text: "Understanding local traditions and history", scores: { "Culture Enthusiast": 3 } },
      { text: "Maximizing experiences on a tight budget", scores: { "Budget Backpacker": 3, "Adventure Explorer": 1 } },
    ],
  },
  {
    id: 5,
    question: "How do you plan to navigate Nepal?",
    icon: Map,
    options: [
      { text: "Off-the-beaten-path trails with a guide", scores: { "Adventure Explorer": 2, "Nature Photographer": 2 } },
      { text: "Following ancient pilgrimage routes", scores: { "Spiritual Seeker": 3, "Culture Enthusiast": 1 } },
      { text: "Public buses and local transport for authenticity", scores: { "Budget Backpacker": 3, "Culture Enthusiast": 1 } },
      { text: "Slow, mindful walks through villages", scores: { "Peaceful Wanderer": 3 } },
    ],
  },
  {
    id: 6,
    question: "Your must-have travel item in Nepal?",
    icon: BookOpen,
    options: [
      { text: "Trekking poles and crampons", scores: { "Adventure Explorer": 3 } },
      { text: "A professional camera with multiple lenses", scores: { "Nature Photographer": 3 } },
      { text: "A journal and sketch pad", scores: { "Peaceful Wanderer": 2, "Culture Enthusiast": 2 } },
      { text: "Prayer beads and a meditation cushion", scores: { "Spiritual Seeker": 3 } },
    ],
  },
  {
    id: 7,
    question: "Which Nepal season calls to you?",
    icon: TreePine,
    options: [
      { text: "Autumn — crystal-clear mountain views", scores: { "Adventure Explorer": 2, "Nature Photographer": 2 } },
      { text: "Spring — blooming rhododendrons everywhere", scores: { "Nature Photographer": 2, "Peaceful Wanderer": 2 } },
      { text: "Festival season — Dashain, Tihar celebrations", scores: { "Culture Enthusiast": 3, "Budget Backpacker": 1 } },
      { text: "Monsoon — fewer tourists, greener landscapes", scores: { "Budget Backpacker": 2, "Peaceful Wanderer": 2 } },
    ],
  },
];

export default function QuizClient() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<PersonalityKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [started, setStarted] = useState(false);

  const calculatePersonality = useCallback((allAnswers: number[]): PersonalityKey => {
    const scores: Record<string, number> = {};
    Object.keys(PERSONALITIES).forEach(p => (scores[p] = 0));

    allAnswers.forEach((answerIdx, qIdx) => {
      const option = QUESTIONS[qIdx]?.options[answerIdx];
      if (option) {
        Object.entries(option.scores).forEach(([personality, score]) => {
          scores[personality] = (scores[personality] || 0) + score;
        });
      }
    });

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as PersonalityKey;
  }, []);

  const handleAnswer = async (optionIdx: number) => {
    setSelectedOption(optionIdx);
    
    setTimeout(async () => {
      const newAnswers = [...answers, optionIdx];
      setAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Calculate result
        const personality = calculatePersonality(newAnswers);
        setResult(personality);

        // Save if logged in
        if (session?.user) {
          setSaving(true);
          try {
            const p = PERSONALITIES[personality];
            await fetch("/api/user/personality", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                personality,
                personalityIcon: p.icon,
                description: p.description,
                traits: p.traits,
                answers: newAnswers,
              }),
            });
          } catch (e) {
            console.error("Error saving personality:", e);
          }
          setSaving(false);
        }
      }
    }, 400);
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 1, y: 30 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="text-6xl md:text-8xl mb-6">🇳🇵</div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Discover Your Nepal Travel Personality
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Answer 7 quick questions to uncover your unique travel style and get personalized destination recommendations across Nepal.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
              {Object.entries(PERSONALITIES).map(([name, p]) => (
                <div key={name} className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50">
                  <span className="text-2xl">{p.icon}</span>
                  <p className="text-xs font-medium mt-1 text-muted-foreground">{name}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStarted(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Start the Quiz
              <ArrowRight className="w-5 h-5" />
            </button>
            {!session?.user && (
              <p className="text-sm text-muted-foreground mt-4">
                <Link href="/login" className="text-primary hover:underline">Sign in</Link> to save your results and unlock personalized recommendations.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  if (result) {
    const personality = PERSONALITIES[result];
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 1, scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            {saving ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Saving your travel personality...</p>
              </div>
            ) : (
              <>
                <div className="text-7xl md:text-9xl mb-6">{personality.icon}</div>
                <h2 className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Your Travel Personality</h2>
                <h1 className={`text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${personality.color} bg-clip-text text-transparent`}>
                  {result}
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                  {personality.description}
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {personality.traits.map(trait => (
                    <span key={trait} className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {trait}
                    </span>
                  ))}
                </div>

                <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                    <Mountain className="w-5 h-5 text-primary" />
                    Recommended Destinations for You
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {personality.recommendations.map(dest => (
                      <Link
                        key={dest}
                        href={`/destinations/${dest.toLowerCase().replace(/\s+/g, "-")}`}
                        className="p-3 bg-background/50 rounded-xl hover:bg-primary/5 transition-colors text-sm font-medium"
                      >
                        {dest}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      setStarted(true);
                      setCurrentQuestion(0);
                      setAnswers([]);
                      setResult(null);
                    }}
                    className="px-6 py-3 bg-card border border-border rounded-xl hover:bg-accent transition-colors font-medium"
                  >
                    Retake Quiz
                  </button>
                  <Link
                    href="/destinations"
                    className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Explore Destinations
                  </Link>
                  {session?.user && (
                    <Link
                      href="/dashboard"
                      className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      View Dashboard
                    </Link>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];
  const Icon = question.icon;
  const progress = ((currentQuestion) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
              <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 1, x: 30 }}
              animate={{ x: 0 }}
              exit={{ opacity: 1, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{question.question}</h2>
              </div>

              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === idx
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-accent/50 bg-card/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedOption === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {selectedOption === idx ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                      </div>
                      <span className="font-medium">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              {currentQuestion > 0 && (
                <button
                  onClick={goBack}
                  className="mt-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous question
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
