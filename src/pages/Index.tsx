import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import TheorySection from "@/components/game/TheorySection";
import LevelsSection from "@/components/game/LevelsSection";
import QuizSection from "@/components/game/QuizSection";
import RatingSection from "@/components/game/RatingSection";
import AchievementsSection from "@/components/game/AchievementsSection";
import { PlayerStats } from "@/data/gameData";

type Tab = "theory" | "levels" | "quiz" | "rating" | "achievements";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "theory", label: "Теория", icon: "BookOpen" },
  { id: "levels", label: "Уровни", icon: "Layers" },
  { id: "quiz", label: "Тест", icon: "ClipboardList" },
  { id: "rating", label: "Рейтинг", icon: "Trophy" },
  { id: "achievements", label: "Награды", icon: "Star" },
];

const tips = [
  "💡 При наводнении отключи электричество до того, как вода войдёт в дом.",
  "💡 При землетрясении укройся под прочным столом и держись за ножку.",
  "💡 Держи документы в водонепроницаемом пакете в аварийном наборе.",
  "💡 Номер экстренной службы: 112 — работает везде и всегда.",
  "💡 15 см быстрой воды достаточно, чтобы сбить ребёнка с ног.",
  "💡 После землетрясения покидай здание только по лестнице, не на лифте.",
  "💡 Аварийный набор: вода, еда на 3 дня, фонарик, аптечка, документы.",
  "💡 При сигнале тревоги не игнорируй — действуй немедленно.",
];

export default function Index() {
  const [tab, setTab] = useState<Tab>("theory");
  const [readCards, setReadCards] = useState<Set<string>>(new Set());
  const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<PlayerStats>({
    totalPoints: 0,
    quizCorrect: 0,
    quizTotal: 0,
    levelsCompleted: 0,
    theoryRead: 0,
    streak: 0,
  });
  const [tipIndex, setTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showTip) return;
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [showTip]);

  const handleCardRead = (id: string) => {
    if (readCards.has(id)) return;
    const next = new Set(readCards);
    next.add(id);
    setReadCards(next);
    setStats((s) => ({ ...s, theoryRead: next.size }));
  };

  const handleLevelComplete = (id: string, points: number) => {
    if (completedLevels.has(id)) return;
    const next = new Set(completedLevels);
    next.add(id);
    setCompletedLevels(next);
    setStats((s) => ({
      ...s,
      levelsCompleted: next.size,
      totalPoints: s.totalPoints + points,
    }));
    showAchievementToast("Уровень пройден! +20 очков 🎉");
  };

  const handleQuizAnswer = (correct: boolean, points: number) => {
    setStats((s) => ({
      ...s,
      quizTotal: s.quizTotal + 1,
      quizCorrect: correct ? s.quizCorrect + 1 : s.quizCorrect,
      totalPoints: s.totalPoints + points,
    }));
  };

  const showAchievementToast = (msg: string) => {
    setNewAchievement(msg);
    setTimeout(() => setNewAchievement(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-golos">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-800 text-base leading-tight">
              🛡️ Безопасность в ЧС
            </div>
            <div className="text-xs text-gray-400">Учись действовать правильно</div>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1.5 rounded-xl">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="font-bold text-sm">{stats.totalPoints}</span>
          </div>
        </div>
      </div>

      {/* Tip banner */}
      {showTip && (
        <div className="bg-blue-500 text-white">
          <div className="max-w-lg mx-auto px-4 py-2.5 flex items-start gap-2">
            <div className="flex-1 text-xs leading-relaxed">{tips[tipIndex]}</div>
            <button
              onClick={() => setShowTip(false)}
              className="text-blue-200 hover:text-white flex-shrink-0 mt-0.5"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Achievement toast */}
      {newAchievement && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg animate-fade-in">
          {newAchievement}
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Общий прогресс</span>
            <span>
              {Math.min(
                100,
                Math.round(
                  ((readCards.size / 8) * 0.3 +
                    (completedLevels.size / 6) * 0.4 +
                    (stats.quizTotal / 8) * 0.3) *
                    100
                )
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-700"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    ((readCards.size / 8) * 0.3 +
                      (completedLevels.size / 6) * 0.4 +
                      (stats.quizTotal / 8) * 0.3) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
          <div className="flex gap-3 text-xs text-gray-400">
            <span>📚 {readCards.size}/8</span>
            <span>🎮 {completedLevels.size}/6</span>
            <span>✏️ {stats.quizTotal}/8</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-5 pb-28">
        {tab === "theory" && (
          <TheorySection onCardRead={handleCardRead} readCards={readCards} />
        )}
        {tab === "levels" && (
          <LevelsSection
            completedLevels={completedLevels}
            onLevelComplete={handleLevelComplete}
          />
        )}
        {tab === "quiz" && (
          <QuizSection onAnswer={handleQuizAnswer} totalPoints={stats.totalPoints} />
        )}
        {tab === "rating" && (
          <RatingSection playerPoints={stats.totalPoints} playerName="Ты" />
        )}
        {tab === "achievements" && <AchievementsSection stats={stats} />}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
        <div className="max-w-lg mx-auto px-2 py-1.5 flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                tab === t.id ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  tab === t.id ? "bg-gray-100" : ""
                }`}
              >
                <Icon name={t.icon as "BookOpen"} size={18} />
              </div>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
