import { useState } from "react";
import { theoryCards, DisasterType } from "@/data/gameData";
import Icon from "@/components/ui/icon";

interface TheorySectionProps {
  onCardRead: (id: string) => void;
  readCards: Set<string>;
}

export default function TheorySection({ onCardRead, readCards }: TheorySectionProps) {
  const [filter, setFilter] = useState<DisasterType | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "all" ? theoryCards : theoryCards.filter((c) => c.disaster === filter);

  const handleExpand = (id: string) => {
    if (expanded !== id) {
      setExpanded(id);
      onCardRead(id);
    } else {
      setExpanded(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {[
          { val: "all", label: "Все темы", icon: "BookOpen" },
          { val: "flood", label: "Наводнение", icon: "Waves" },
          { val: "earthquake", label: "Землетрясение", icon: "Mountain" },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val as DisasterType | "all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.val
                ? f.val === "flood"
                  ? "bg-blue-500 text-white shadow-sm"
                  : f.val === "earthquake"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-800 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon name={f.icon as "BookOpen"} size={15} />
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map((card) => (
          <div
            key={card.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              card.disaster === "flood"
                ? "border-blue-100"
                : "border-orange-100"
            } ${expanded === card.id ? "shadow-md" : "shadow-sm hover:shadow-md"}`}
          >
            <button
              onClick={() => handleExpand(card.id)}
              className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${
                card.disaster === "flood"
                  ? expanded === card.id
                    ? "bg-blue-50"
                    : "bg-white hover:bg-blue-50/50"
                  : expanded === card.id
                  ? "bg-orange-50"
                  : "bg-white hover:bg-orange-50/50"
              }`}
            >
              <span className="text-2xl">{card.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">{card.title}</span>
                  {readCards.has(card.id) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Изучено ✓
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium mt-0.5 block ${
                    card.disaster === "flood" ? "text-blue-500" : "text-orange-500"
                  }`}
                >
                  {card.disaster === "flood" ? "🌊 Наводнение" : "🌍 Землетрясение"}
                </span>
              </div>
              <Icon
                name={expanded === card.id ? "ChevronUp" : "ChevronDown"}
                size={18}
                className="text-gray-400 flex-shrink-0"
              />
            </button>

            {expanded === card.id && (
              <div
                className={`px-4 pb-4 pt-0 space-y-3 ${
                  card.disaster === "flood" ? "bg-blue-50" : "bg-orange-50"
                }`}
              >
                <p className="text-gray-700 text-sm leading-relaxed">{card.content}</p>
                <div
                  className={`flex items-start gap-2 p-3 rounded-xl ${
                    card.disaster === "flood"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  <span className="text-base">💡</span>
                  <p className="text-xs font-medium">{card.tip}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400">
        Изучено {readCards.size} из {theoryCards.length} карточек
      </div>
    </div>
  );
}
