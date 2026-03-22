import { leaderboard } from "@/data/gameData";

interface RatingSectionProps {
  playerPoints: number;
  playerName: string;
}

export default function RatingSection({ playerPoints, playerName }: RatingSectionProps) {
  const allPlayers = [
    ...leaderboard,
    { name: playerName + " (Ты)", points: playerPoints, badge: "🎮" },
  ]
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);

  const playerRank = allPlayers.findIndex((p) => p.name.includes("(Ты)")) + 1;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Твоя позиция", value: `#${playerRank}`, icon: "🏅" },
          { label: "Твои очки", value: playerPoints, icon: "⭐" },
          { label: "Участников", value: allPlayers.length, icon: "👥" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-2xl p-3 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-bold text-gray-800 text-lg">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {allPlayers.map((player, idx) => {
          const isMe = player.name.includes("(Ты)");
          const medalColors: Record<number, string> = {
            1: "bg-yellow-50 border-yellow-200",
            2: "bg-gray-100 border-gray-200",
            3: "bg-orange-50 border-orange-200",
          };
          const baseCls = medalColors[idx + 1] || "bg-white border-gray-100";
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                isMe ? "border-gray-800 bg-gray-800 text-white" : baseCls
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  isMe
                    ? "bg-white text-gray-800"
                    : idx < 3
                    ? "bg-white text-gray-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {idx + 1}
              </div>

              <span className="text-lg flex-shrink-0">{player.badge}</span>

              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm truncate ${isMe ? "text-white" : "text-gray-800"}`}>
                  {player.name}
                </div>
              </div>

              <div
                className={`font-bold text-sm flex-shrink-0 ${
                  isMe ? "text-yellow-300" : idx === 0 ? "text-yellow-600" : "text-gray-600"
                }`}
              >
                {player.points} очков
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-gray-400 pb-2">
        Проходи тесты и уровни, чтобы подняться в рейтинге
      </div>
    </div>
  );
}
