import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { AuthUser } from "./AuthModal";

const SCORES_URL = "https://functions.poehali.dev/560c6be4-4d65-4000-bb00-cc28d9d1e3b6";

interface LeaderboardEntry {
  username: string;
  total_points: number;
  levels_completed: number;
  quiz_correct: number;
}

interface RatingSectionProps {
  playerPoints: number;
  playerName: string;
  user: AuthUser | null;
}

const BADGES = ["🥇", "🥈", "🥉", "🎖️", "⭐", "🎮", "📚", "✏️", "🏅", "💫"];

export default function RatingSection({ playerPoints, playerName, user }: RatingSectionProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SCORES_URL}?action=leaderboard`);
      const data = await res.json();
      setBoard(Array.isArray(data) ? data : []);
    } catch {
      setBoard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoard(); }, []);

  // Если пользователь не авторизован — показываем гостевой рейтинг
  const guestEntry = !user ? { username: playerName + " (Ты)", total_points: playerPoints, levels_completed: 0, quiz_correct: 0 } : null;

  const allEntries: (LeaderboardEntry & { isMe?: boolean })[] = [
    ...board.map((e) => ({ ...e, isMe: user ? e.username === user.username : false })),
    ...(guestEntry ? [{ ...guestEntry, isMe: true }] : []),
  ].sort((a, b) => b.total_points - a.total_points).slice(0, 15);

  const myRank = allEntries.findIndex((e) => e.isMe) + 1;
  const myEntry = allEntries.find((e) => e.isMe);

  return (
    <div className="space-y-5">
      {/* Статистика */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <div className="text-2xl mb-1">🏅</div>
          <div className="font-bold text-gray-800 text-lg">#{myRank || "—"}</div>
          <div className="text-xs text-gray-400 mt-0.5">Позиция</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <div className="text-2xl mb-1">⭐</div>
          <div className="font-bold text-gray-800 text-lg">{user ? (myEntry?.total_points ?? playerPoints) : playerPoints}</div>
          <div className="text-xs text-gray-400 mt-0.5">Твои очки</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <div className="text-2xl mb-1">👥</div>
          <div className="font-bold text-gray-800 text-lg">{allEntries.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">Игроков</div>
        </div>
      </div>

      {/* Баннер авторизации */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-blue-800 text-sm">Войди, чтобы сохранить рекорд</div>
            <div className="text-xs text-blue-600 mt-0.5">Твои очки попадут в общий рейтинг</div>
          </div>
        </div>
      )}

      {/* Таблица */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            Загружаем рейтинг...
          </div>
        ) : allEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Пока никто не зарегистрировался.<br/>Будь первым!
          </div>
        ) : (
          allEntries.map((entry, idx) => {
            const medalBg: Record<number, string> = {
              1: "bg-yellow-50 border-yellow-200",
              2: "bg-gray-100 border-gray-200",
              3: "bg-orange-50 border-orange-200",
            };
            const baseCls = medalBg[idx + 1] || "bg-white border-gray-100";
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                  entry.isMe ? "border-blue-500 bg-blue-600 text-white shadow-lg" : baseCls
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  entry.isMe ? "bg-white text-blue-600" : idx < 3 ? "bg-white text-gray-800 shadow-sm" : "bg-gray-100 text-gray-600"
                }`}>
                  {idx + 1}
                </div>
                <span className="text-lg flex-shrink-0">{BADGES[idx] ?? "🎮"}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${entry.isMe ? "text-white" : "text-gray-800"}`}>
                    {entry.username}{entry.isMe && !user ? " (Ты)" : ""}
                  </div>
                  <div className={`text-xs mt-0.5 ${entry.isMe ? "text-blue-200" : "text-gray-400"}`}>
                    уровней: {entry.levels_completed} · ответов: {entry.quiz_correct}
                  </div>
                </div>
                <div className={`font-bold text-sm flex-shrink-0 ${
                  entry.isMe ? "text-yellow-300" : idx === 0 ? "text-yellow-600" : "text-gray-600"
                }`}>
                  {entry.total_points} оч.
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={fetchBoard}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
      >
        <Icon name="RefreshCw" size={14} />
        Обновить рейтинг
      </button>

      <div className="text-center text-xs text-gray-400 pb-2">
        Проходи тесты и уровни, чтобы подняться выше
      </div>
    </div>
  );
}
