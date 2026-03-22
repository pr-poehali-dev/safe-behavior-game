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
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {[
          { val: "all", label: "Все темы", icon: "BookOpen" },
          { val: "flood", label: "Наводнение", icon: "Waves" },
          { val: "earthquake", label: "Землетрясение", icon: "Mountain" },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val as DisasterType | "all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
              filter === f.val
                ? f.val === "flood"
                  ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-blue-200"
                  : f.val === "earthquake"
                  ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-orange-200"
                  : "bg-gradient-to-r from-gray-700 to-gray-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
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
            className={`rounded-2xl overflow-hidden transition-all duration-200 ${
              expanded === card.id ? "shadow-lg" : "shadow-sm hover:shadow-md"
            }`}
          >
            {/* Цветная полоска сверху */}
            <div
              className={`h-1 w-full ${
                card.disaster === "flood"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                  : "bg-gradient-to-r from-orange-500 to-amber-400"
              }`}
            />

            <button
              onClick={() => handleExpand(card.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors border border-t-0 ${
                card.disaster === "flood"
                  ? expanded === card.id
                    ? "bg-blue-50 border-blue-100"
                    : "bg-white hover:bg-blue-50/40 border-gray-100"
                  : expanded === card.id
                  ? "bg-orange-50 border-orange-100"
                  : "bg-white hover:bg-orange-50/40 border-gray-100"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl ${
                  card.disaster === "flood"
                    ? "bg-blue-100"
                    : "bg-orange-100"
                }`}
              >
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800 text-sm">{card.title}</span>
                  {readCards.has(card.id) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      ✓ Изучено
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
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  expanded === card.id
                    ? card.disaster === "flood"
                      ? "bg-blue-500 text-white"
                      : "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Icon
                  name={expanded === card.id ? "ChevronUp" : "ChevronDown"}
                  size={15}
                />
              </div>
            </button>

            {expanded === card.id && (
              <div
                className={`px-4 pb-4 pt-3 space-y-3 border border-t-0 ${
                  card.disaster === "flood"
                    ? "bg-blue-50 border-blue-100"
                    : "bg-orange-50 border-orange-100"
                }`}
              >
                <p className="text-gray-700 text-sm leading-relaxed">{card.content}</p>
                <div
                  className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                    card.disaster === "flood"
                      ? "bg-blue-100 border-blue-200 text-blue-900"
                      : "bg-orange-100 border-orange-200 text-orange-900"
                  }`}
                >
                  <span className="text-base mt-0.5">💡</span>
                  <p className="text-xs font-semibold leading-relaxed">{card.tip}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <div className="flex gap-1">
          {Array.from({ length: theoryCards.length }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < readCards.size ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span>{readCards.size} из {theoryCards.length} изучено</span>
      </div>
    </div>
  );
}
