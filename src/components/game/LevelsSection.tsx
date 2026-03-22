import { useState } from "react";
import { levelScenarios } from "@/data/gameData";
import Icon from "@/components/ui/icon";

interface LevelsSectionProps {
  completedLevels: Set<string>;
  onLevelComplete: (id: string, points: number) => void;
}

export default function LevelsSection({ completedLevels, onLevelComplete }: LevelsSectionProps) {
  const [active, setActive] = useState<string | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const activeScenario = levelScenarios.find((l) => l.id === active);

  const handleStart = (id: string) => {
    setActive(id);
    setChosen(null);
    setShowResult(false);
  };

  const handleChoice = (idx: number) => {
    if (chosen !== null) return;
    setChosen(idx);
    setShowResult(true);
    const scenario = levelScenarios.find((l) => l.id === active);
    if (scenario?.options[idx].correct) {
      onLevelComplete(active!, 20);
    }
  };

  const handleNext = () => {
    setActive(null);
    setChosen(null);
    setShowResult(false);
  };

  if (active && activeScenario) {
    const isCorrect = chosen !== null && activeScenario.options[chosen].correct;
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={handleNext}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <Icon name="ArrowLeft" size={15} />
          Назад к уровням
        </button>

        <div
          className={`rounded-2xl p-1 ${
            activeScenario.disaster === "flood"
              ? "bg-gradient-to-br from-blue-500 to-blue-600"
              : "bg-gradient-to-br from-orange-500 to-orange-600"
          }`}
        >
          <div className="bg-white rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {activeScenario.disaster === "flood" ? "🌊" : "🌍"}
              </span>
              <div>
                <div className="font-bold text-gray-800">{activeScenario.title}</div>
                <div className="text-xs text-gray-400">{activeScenario.description}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{activeScenario.situation}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Выбери правильное действие:
              </p>
              {activeScenario.options.map((opt, idx) => {
                let cls = "border-gray-200 bg-white text-gray-700 hover:border-gray-300";
                if (chosen !== null) {
                  if (idx === chosen) {
                    cls = opt.correct
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-red-400 bg-red-50 text-red-800";
                  } else if (opt.correct) {
                    cls = "border-green-400 bg-green-50 text-green-700";
                  } else {
                    cls = "border-gray-100 bg-gray-50 text-gray-400";
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleChoice(idx)}
                    disabled={chosen !== null}
                    className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {showResult && chosen !== null && (
              <div
                className={`rounded-xl p-4 space-y-3 ${
                  isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isCorrect ? "✅" : "❌"}</span>
                  <span className={`font-bold text-sm ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                    {isCorrect ? "Правильно! +20 очков" : "Не совсем..."}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {activeScenario.options[chosen].explanation}
                </p>
                <button
                  onClick={handleNext}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                    activeScenario.disaster === "flood"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  К списку уровней
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {levelScenarios.map((scenario, idx) => {
          const isCompleted = completedLevels.has(scenario.id);
          const isLocked = idx > 0 && !completedLevels.has(levelScenarios[idx - 1].id);
          return (
            <div
              key={scenario.id}
              className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                isLocked
                  ? "bg-gray-50 border-gray-100 opacity-60"
                  : isCompleted
                  ? scenario.disaster === "flood"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-orange-50 border-orange-200"
                  : "bg-white border-gray-200 shadow-sm hover:shadow-md cursor-pointer"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  isCompleted
                    ? "bg-green-100"
                    : isLocked
                    ? "bg-gray-100"
                    : scenario.disaster === "flood"
                    ? "bg-blue-100"
                    : "bg-orange-100"
                }`}
              >
                {isCompleted ? "✅" : isLocked ? "🔒" : scenario.disaster === "flood" ? "🌊" : "🌍"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">{scenario.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{scenario.description}</div>
                <div
                  className={`text-xs font-medium mt-1 ${
                    scenario.disaster === "flood" ? "text-blue-500" : "text-orange-500"
                  }`}
                >
                  {scenario.disaster === "flood" ? "Наводнение" : "Землетрясение"}
                </div>
              </div>

              {!isLocked && (
                <button
                  onClick={() => handleStart(scenario.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors ${
                    isCompleted
                      ? "bg-green-500 hover:bg-green-600"
                      : scenario.disaster === "flood"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {isCompleted ? "Повтор" : "Играть"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-400">
        Пройдено {completedLevels.size} из {levelScenarios.length} уровней
      </div>
    </div>
  );
}
