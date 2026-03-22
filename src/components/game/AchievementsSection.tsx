import { achievements, PlayerStats } from "@/data/gameData";

interface AchievementsSectionProps {
  stats: PlayerStats;
}

export default function AchievementsSection({ stats }: AchievementsSectionProps) {
  const unlocked = achievements.filter((a) => a.condition(stats));
  const locked = achievements.filter((a) => !a.condition(stats));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Получено{" "}
          <span className="font-bold text-gray-800">
            {unlocked.length}
          </span>{" "}
          из {achievements.length}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: achievements.length }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < unlocked.length ? "bg-yellow-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {unlocked.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Получено
          </div>
          <div className="grid grid-cols-2 gap-2">
            {unlocked.map((a) => (
              <div
                key={a.id}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-3 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 text-xs truncate">{a.title}</div>
                    <div className="text-xs text-yellow-600">✓ Выполнено</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-snug">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Ещё не получено
          </div>
          <div className="grid grid-cols-2 gap-2">
            {locked.map((a) => (
              <div
                key={a.id}
                className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-3 space-y-1 opacity-60"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl grayscale">{a.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-600 text-xs truncate">{a.title}</div>
                    <div className="text-xs text-gray-400">🔒 Заблокировано</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-snug">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlocked.length === 0 && (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">🎯</div>
          <div className="text-gray-500 text-sm">
            Начни изучать теорию и проходить уровни, чтобы получить первые достижения!
          </div>
        </div>
      )}
    </div>
  );
}
