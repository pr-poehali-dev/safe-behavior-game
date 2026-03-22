import { useState } from "react";
import { quizQuestions } from "@/data/gameData";
import Icon from "@/components/ui/icon";

interface QuizSectionProps {
  onAnswer: (correct: boolean, points: number) => void;
  totalPoints: number;
}

export default function QuizSection({ onAnswer, totalPoints }: QuizSectionProps) {
  const [current, setCurrent] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const q = quizQuestions[current];

  const handleAnswer = (idx: number) => {
    if (chosen !== null) return;
    setChosen(idx);
    setShowExplain(true);
    const correct = idx === q.correct;
    if (correct) {
      setScore((s) => s + q.points);
      setCorrectCount((c) => c + 1);
    }
    onAnswer(correct, correct ? q.points : 0);
  };

  const handleNext = () => {
    if (current + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setChosen(null);
      setShowExplain(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setChosen(null);
    setShowExplain(false);
    setFinished(false);
    setScore(0);
    setCorrectCount(0);
  };

  if (finished) {
    const percent = Math.round((correctCount / quizQuestions.length) * 100);
    return (
      <div className="text-center space-y-6 py-4 animate-fade-in">
        <div className="text-6xl">{percent >= 80 ? "🏆" : percent >= 50 ? "👍" : "📖"}</div>
        <div>
          <div className="text-2xl font-bold text-gray-800">{score} очков</div>
          <div className="text-gray-500 text-sm mt-1">
            Правильных ответов: {correctCount} из {quizQuestions.length}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 inline-block min-w-48">
          <div className="text-4xl font-bold text-gray-800">{percent}%</div>
          <div className="text-sm text-gray-500 mt-1">результат</div>
        </div>

        <div className="text-sm text-gray-500">
          {percent >= 80
            ? "Отличный результат! Ты знаешь как вести себя в ЧС."
            : percent >= 50
            ? "Хороший результат! Но стоит повторить теорию."
            : "Изучи теоретические карточки и попробуй снова."}
        </div>

        <button
          onClick={handleRestart}
          className="bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          Пройти тест снова
        </button>
      </div>
    );
  }

  const progress = ((current) / quizQuestions.length) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Вопрос {current + 1} из {quizQuestions.length}
        </span>
        <span
          className={`font-semibold ${
            q.disaster === "flood" ? "text-blue-500" : "text-orange-500"
          }`}
        >
          {q.disaster === "flood" ? "🌊 Наводнение" : "🌍 Землетрясение"} · {q.points} очков
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gray-800 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-gray-50 rounded-2xl p-5">
        <p className="text-gray-800 font-semibold text-base leading-relaxed">{q.question}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          let cls = "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50";
          if (chosen !== null) {
            if (idx === chosen) {
              cls =
                idx === q.correct
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-red-400 bg-red-50 text-red-800";
            } else if (idx === q.correct) {
              cls = "border-green-400 bg-green-50 text-green-700";
            } else {
              cls = "border-gray-100 bg-gray-50 text-gray-400";
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={chosen !== null}
              className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ${cls}`}
            >
              <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {showExplain && chosen !== null && (
        <div
          className={`rounded-xl p-4 space-y-3 ${
            chosen === q.correct
              ? "bg-green-50 border border-green-200"
              : "bg-amber-50 border border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{chosen === q.correct ? "✅" : "💡"}</span>
            <span
              className={`font-bold text-sm ${
                chosen === q.correct ? "text-green-700" : "text-amber-700"
              }`}
            >
              {chosen === q.correct ? `Правильно! +${q.points} очков` : "Не совсем верно"}
            </span>
          </div>
          <p className="text-sm text-gray-600">{q.explanation}</p>
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            {current + 1 >= quizQuestions.length ? "Завершить тест" : "Следующий вопрос"}
            <Icon name="ArrowRight" size={14} className="inline ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
