import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Item {
  id: string;
  name: string;
  icon: string;
  category: "essential" | "useful" | "useless";
  hint: string;
  weight: number;
}

const ALL_ITEMS: Item[] = [
  { id: "water", name: "Вода (3 л)", icon: "💧", category: "essential", hint: "Запас воды на 3 дня — обязателен!", weight: 3 },
  { id: "food", name: "Консервы", icon: "🥫", category: "essential", hint: "Еда без готовки на несколько дней.", weight: 2 },
  { id: "flashlight", name: "Фонарик", icon: "🔦", category: "essential", hint: "При отключении света — незаменим.", weight: 1 },
  { id: "documents", name: "Документы", icon: "📄", category: "essential", hint: "Паспорт, полис, копии — без них сложно.", weight: 0 },
  { id: "firstaid", name: "Аптечка", icon: "🩺", category: "essential", hint: "Бинты, лекарства, антисептик.", weight: 1 },
  { id: "phone", name: "Зарядка для телефона", icon: "🔋", category: "essential", hint: "Связь — это жизнь в чрезвычайной ситуации.", weight: 1 },
  { id: "whistle", name: "Свисток", icon: "📯", category: "essential", hint: "Подать сигнал о помощи без голоса.", weight: 0 },
  { id: "warmclothes", name: "Тёплая одежда", icon: "🧥", category: "useful", hint: "Температура ночью может упасть.", weight: 2 },
  { id: "rope", name: "Верёвка", icon: "🪢", category: "useful", hint: "Пригодится при эвакуации или связке вещей.", weight: 1 },
  { id: "radio", name: "Радио на батарейках", icon: "📻", category: "useful", hint: "Узнавать новости без интернета.", weight: 1 },
  { id: "matches", name: "Спички (водостойкие)", icon: "🔥", category: "useful", hint: "Огонь для тепла и сигнала.", weight: 0 },
  { id: "map", name: "Карта района", icon: "🗺️", category: "useful", hint: "GPS может не работать.", weight: 0 },
  { id: "tv", name: "Телевизор", icon: "📺", category: "useless", hint: "Слишком тяжёлый, не поможет при эвакуации.", weight: 15 },
  { id: "jewelry", name: "Украшения", icon: "💍", category: "useless", hint: "Ценности важны, но жизнь дороже лишнего веса.", weight: 1 },
  { id: "pillow", name: "Подушка", icon: "🛏️", category: "useless", hint: "Комфорт хорош дома, но не в эвакуации.", weight: 2 },
  { id: "books", name: "Стопка книг", icon: "📚", category: "useless", hint: "Слишком тяжело и не поможет выжить.", weight: 5 },
];

const MAX_WEIGHT = 12;

interface BackpackGameProps {
  onComplete?: (score: number) => void;
}

type Phase = "pick" | "result";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function BackpackGame({ onComplete }: BackpackGameProps) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [items] = useState<Item[]>(() => shuffle(ALL_ITEMS));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [shakeItem, setShakeItem] = useState<string | null>(null);

  const totalWeight = items
    .filter((i) => selected.has(i.id))
    .reduce((sum, i) => sum + i.weight, 0);
  const isOverweight = totalWeight > MAX_WEIGHT;

  const toggleItem = (item: Item) => {
    if (selected.has(item.id)) {
      const next = new Set(selected);
      next.delete(item.id);
      setSelected(next);
    } else {
      if (totalWeight + item.weight > MAX_WEIGHT) {
        setShakeItem(item.id);
        setTimeout(() => setShakeItem(null), 600);
        return;
      }
      const next = new Set(selected);
      next.add(item.id);
      setSelected(next);
      setLastAdded(item.id);
      setTimeout(() => setLastAdded(null), 500);
    }
  };

  const calcScore = () => {
    const selectedItems = items.filter((i) => selected.has(i.id));
    const essentials = ALL_ITEMS.filter((i) => i.category === "essential");
    const essentialPicked = selectedItems.filter((i) => i.category === "essential").length;
    const uselessPicked = selectedItems.filter((i) => i.category === "useless").length;
    const score = Math.max(0, essentialPicked * 15 - uselessPicked * 20);
    const max = essentials.length * 15;
    return { score, max, essentialPicked, essentialTotal: essentials.length, uselessPicked };
  };

  const handleCheck = () => {
    setPhase("result");
    const { score } = calcScore();
    onComplete?.(score);
  };

  const handleRetry = () => {
    setSelected(new Set());
    setPhase("pick");
  };

  if (phase === "result") {
    const { score, max, essentialPicked, essentialTotal, uselessPicked } = calcScore();
    const percent = Math.round((score / max) * 100);
    const selectedItems = items.filter((i) => selected.has(i.id));
    const missedEssentials = ALL_ITEMS.filter(
      (i) => i.category === "essential" && !selected.has(i.id)
    );

    return (
      <div className="space-y-5">
        {/* Результат */}
        <div
          className={`rounded-2xl p-5 text-white shadow-lg ${
            percent >= 70
              ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : percent >= 40
              ? "bg-gradient-to-br from-yellow-500 to-orange-500"
              : "bg-gradient-to-br from-red-500 to-rose-600"
          }`}
        >
          <div className="text-center space-y-2">
            <div className="text-5xl">
              {percent >= 70 ? "🎒" : percent >= 40 ? "😬" : "😰"}
            </div>
            <div className="font-bold text-xl">
              {percent >= 70
                ? "Отличный рюкзак!"
                : percent >= 40
                ? "Неплохо, но есть пробелы"
                : "Рюкзак нужно пересобрать"}
            </div>
            <div className="text-white/80 text-sm">
              {score} / {max} очков
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 mt-2">
              <div
                className="h-2.5 rounded-full bg-white transition-all duration-1000"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-600">{essentialPicked}</div>
            <div className="text-xs text-green-700 mt-0.5">из {essentialTotal} нужных</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-red-500">{uselessPicked}</div>
            <div className="text-xs text-red-700 mt-0.5">лишних вещей</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-500">{totalWeight}</div>
            <div className="text-xs text-blue-700 mt-0.5">кг из {MAX_WEIGHT}</div>
          </div>
        </div>

        {/* Что взял */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="font-semibold text-gray-700 text-sm">Что ты взял</span>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <span
                key={item.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  item.category === "essential"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : item.category === "useful"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-red-50 text-red-600 border-red-200 line-through"
                }`}
              >
                {item.icon} {item.name}
                {item.category === "useless" && <Icon name="X" size={11} />}
              </span>
            ))}
            {selectedItems.length === 0 && (
              <span className="text-sm text-gray-400">Ты ничего не взял...</span>
            )}
          </div>
        </div>

        {/* Что забыл */}
        {missedEssentials.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-amber-100 border-b border-amber-200">
              <span className="font-semibold text-amber-800 text-sm">⚠️ Забытые важные вещи</span>
            </div>
            <div className="p-4 space-y-2">
              {missedEssentials.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-amber-900">{item.name}</div>
                    <div className="text-xs text-amber-700">{item.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleRetry}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-blue-200 active:scale-95 transition-transform"
        >
          🔄 Попробовать ещё раз
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎒</span>
          <div>
            <div className="font-bold text-base">Собери рюкзак</div>
            <div className="text-blue-100 text-xs">Выбери только нужное для эвакуации</div>
          </div>
        </div>
        {/* Вес */}
        <div className="bg-white/10 rounded-xl p-3 mt-2 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-blue-100">Вес рюкзака</span>
            <span className={`font-bold ${isOverweight ? "text-red-300" : "text-white"}`}>
              {totalWeight} / {MAX_WEIGHT} кг
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isOverweight ? "bg-red-400" : totalWeight > 9 ? "bg-yellow-300" : "bg-green-300"
              }`}
              style={{ width: `${Math.min(100, (totalWeight / MAX_WEIGHT) * 100)}%` }}
            />
          </div>
          {isOverweight && (
            <div className="text-red-300 text-xs font-medium">⚠️ Слишком тяжело!</div>
          )}
        </div>
      </div>

      {/* Рюкзак (зона сброса) */}
      <div
        className={`rounded-2xl border-2 border-dashed p-4 min-h-20 transition-all duration-200 ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : selected.size > 0
            ? "border-green-300 bg-green-50"
            : "border-gray-200 bg-gray-50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const id = e.dataTransfer.getData("itemId");
          const item = items.find((i) => i.id === id);
          if (item) toggleItem(item);
        }}
      >
        <div className="text-xs text-gray-400 mb-2 font-medium">
          🎒 В рюкзаке ({selected.size} предметов):
        </div>
        {selected.size === 0 ? (
          <div className="text-center text-sm text-gray-300 py-3">
            Нажимай на предметы или перетаскивай сюда
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items
              .filter((i) => selected.has(i.id))
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 shadow-sm active:scale-95 transition-transform"
                >
                  {item.icon} {item.name}
                  <Icon name="X" size={11} className="text-gray-400" />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Сетка предметов */}
      <div>
        <div className="text-xs text-gray-400 font-medium mb-3">
          Доступные предметы — нажми чтобы добавить:
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {items
            .filter((i) => !selected.has(i.id))
            .map((item) => (
              <button
                key={item.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("itemId", item.id)}
                onClick={() => toggleItem(item)}
                className={`flex items-center gap-3 bg-white border rounded-xl p-3 text-left shadow-sm transition-all active:scale-95 ${
                  shakeItem === item.id
                    ? "border-red-300 bg-red-50 animate-shake"
                    : lastAdded === item.id
                    ? "border-green-300 bg-green-50"
                    : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                }`}
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-700 leading-tight truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.weight > 0 ? `${item.weight} кг` : "лёгкое"}
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Кнопка проверки */}
      <button
        onClick={handleCheck}
        disabled={selected.size === 0}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-green-200 disabled:opacity-40 disabled:shadow-none active:scale-95 transition-all"
      >
        ✅ Проверить рюкзак
      </button>
    </div>
  );
}
