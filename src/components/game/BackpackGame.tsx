import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Item {
  id: string;
  name: string;
  icon: string;
  category: "essential" | "useful" | "useless";
  hint: string;
  weight: number;
}

type DisasterMode = "flood" | "earthquake";

const FLOOD_ITEMS: Item[] = [
  { id: "water_f", name: "Питьевая вода (3 л)", icon: "💧", category: "essential", hint: "Водопровод может быть заражён — нужна своя вода.", weight: 3 },
  { id: "food_f", name: "Консервы", icon: "🥫", category: "essential", hint: "Еда без готовки — при наводнении кухня недоступна.", weight: 2 },
  { id: "documents_f", name: "Документы в пакете", icon: "📄", category: "essential", hint: "Водонепроницаемый пакет защитит паспорт и полис.", weight: 0 },
  { id: "firstaid_f", name: "Аптечка", icon: "🩺", category: "essential", hint: "Порезы, инфекции от воды — аптечка обязательна.", weight: 1 },
  { id: "phone_f", name: "Зарядка для телефона", icon: "🔋", category: "essential", hint: "Связь с экстренными службами и родными.", weight: 1 },
  { id: "whistle_f", name: "Свисток", icon: "📯", category: "essential", hint: "Подать сигнал, если унесло течением.", weight: 0 },
  { id: "lifevest", name: "Спасательный жилет", icon: "🦺", category: "essential", hint: "При разливе воды жилет может спасти жизнь.", weight: 1 },
  { id: "rubber_boots", name: "Резиновые сапоги", icon: "👢", category: "useful", hint: "Защита от грязной воды и острых предметов.", weight: 2 },
  { id: "rope_f", name: "Верёвка", icon: "🪢", category: "useful", hint: "Для страховки при переходе через затопленный участок.", weight: 1 },
  { id: "radio_f", name: "Радио на батарейках", icon: "📻", category: "useful", hint: "Следить за уровнем воды и сигналами МЧС.", weight: 1 },
  { id: "map_f", name: "Карта эвакуационных маршрутов", icon: "🗺️", category: "useful", hint: "Маршруты эвакуации при наводнении заранее определены.", weight: 0 },
  { id: "waterproof_bag", name: "Водонепроницаемый мешок", icon: "🎒", category: "useful", hint: "Защитит вещи от намокания.", weight: 0 },
  { id: "tv_f", name: "Телевизор", icon: "📺", category: "useless", hint: "Намокнет и утонет — бесполезен при наводнении.", weight: 15 },
  { id: "carpet", name: "Ковёр", icon: "🪣", category: "useless", hint: "Намокает и весит как якорь.", weight: 8 },
  { id: "pillow_f", name: "Подушка", icon: "🛏️", category: "useless", hint: "Намокнет и станет бесполезной.", weight: 2 },
  { id: "books_f", name: "Стопка книг", icon: "📚", category: "useless", hint: "Намокнут и разбухнут. Лишний вес.", weight: 5 },
  { id: "iron", name: "Утюг", icon: "🔌", category: "useless", hint: "Электроприборы опасны рядом с водой.", weight: 3 },
];

const EARTHQUAKE_ITEMS: Item[] = [
  { id: "water_e", name: "Питьевая вода (3 л)", icon: "💧", category: "essential", hint: "Трубы могут лопнуть — запас воды критически важен.", weight: 3 },
  { id: "food_e", name: "Консервы", icon: "🥫", category: "essential", hint: "Газ и электричество могут отключиться.", weight: 2 },
  { id: "documents_e", name: "Документы", icon: "📄", category: "essential", hint: "Нужны для размещения в пункте временного жительства.", weight: 0 },
  { id: "firstaid_e", name: "Аптечка", icon: "🩺", category: "essential", hint: "Порезы от стекла и ушибы — частые травмы при землетрясении.", weight: 1 },
  { id: "phone_e", name: "Зарядка для телефона", icon: "🔋", category: "essential", hint: "Связь с родными и МЧС — приоритет.", weight: 1 },
  { id: "whistle_e", name: "Свисток", icon: "📯", category: "essential", hint: "Если завалило — свисток слышат спасатели.", weight: 0 },
  { id: "gloves", name: "Плотные перчатки", icon: "🧤", category: "essential", hint: "Расчищать завалы без перчаток — опасно.", weight: 0 },
  { id: "helmet", name: "Каска / защитный шлем", icon: "⛑️", category: "useful", hint: "Защита от падающих предметов при афтершоках.", weight: 1 },
  { id: "flashlight_e", name: "Фонарик", icon: "🔦", category: "useful", hint: "Электричество отключается в первую очередь.", weight: 1 },
  { id: "radio_e", name: "Радио на батарейках", icon: "📻", category: "useful", hint: "Следить за афтершоками и инструкциями МЧС.", weight: 1 },
  { id: "warmclothes", name: "Тёплая одежда", icon: "🧥", category: "useful", hint: "Ночью на улице может быть холодно.", weight: 2 },
  { id: "dustmask", name: "Респиратор / маска", icon: "😷", category: "useful", hint: "Пыль от обрушений опасна для лёгких.", weight: 0 },
  { id: "tv_e", name: "Телевизор", icon: "📺", category: "useless", hint: "Тяжёлый и хрупкий — разобьётся при тряске.", weight: 15 },
  { id: "jewelry_e", name: "Украшения", icon: "💍", category: "useless", hint: "В момент спасения это лишний риск.", weight: 1 },
  { id: "books_e", name: "Стопка книг", icon: "📚", category: "useless", hint: "Тяжело и бесполезно в зоне разрушений.", weight: 5 },
  { id: "vase", name: "Ваза (хрусталь)", icon: "🏺", category: "useless", hint: "Разобьётся и поранит — опасно брать.", weight: 3 },
  { id: "laptop", name: "Ноутбук", icon: "💻", category: "useless", hint: "Дорого, тяжело, не поможет выжить.", weight: 2 },
];

const MAX_WEIGHT = 12;

const MODES = {
  flood: {
    label: "Наводнение",
    emoji: "🌊",
    color: "from-blue-600 to-cyan-500",
    bgLight: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    barColor: "bg-blue-400",
    items: FLOOD_ITEMS,
    tip: "При наводнении вода может прибыть быстро. Бери только самое нужное!",
  },
  earthquake: {
    label: "Землетрясение",
    emoji: "🌍",
    color: "from-orange-600 to-amber-500",
    bgLight: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    barColor: "bg-orange-400",
    items: EARTHQUAKE_ITEMS,
    tip: "После толчка есть минуты. Каждый килограмм в рюкзаке — решение о жизни.",
  },
};

interface BackpackGameProps {
  onComplete?: (score: number) => void;
}

type Phase = "choose" | "pick" | "result";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function BackpackGame({ onComplete }: BackpackGameProps) {
  const [phase, setPhase] = useState<Phase>("choose");
  const [mode, setMode] = useState<DisasterMode | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [shakeItem, setShakeItem] = useState<string | null>(null);

  const cfg = mode ? MODES[mode] : null;

  const totalWeight = items
    .filter((i) => selected.has(i.id))
    .reduce((sum, i) => sum + i.weight, 0);
  const isOverweight = totalWeight > MAX_WEIGHT;

  const startMode = (m: DisasterMode) => {
    setMode(m);
    setItems(shuffle(MODES[m].items));
    setSelected(new Set());
    setPhase("pick");
  };

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
    const modeItems = mode ? MODES[mode].items : [];
    const selectedItems = items.filter((i) => selected.has(i.id));
    const essentials = modeItems.filter((i) => i.category === "essential");
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
    if (mode) {
      setItems(shuffle(MODES[mode].items));
      setSelected(new Set());
      setPhase("pick");
    }
  };

  const handleChooseMode = () => {
    setPhase("choose");
    setMode(null);
    setSelected(new Set());
  };

  // ── ЭКРАН ВЫБОРА РЕЖИМА ──────────────────────────────────────────────────
  if (phase === "choose") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-1 pt-1">
          <div className="text-4xl">🎒</div>
          <div className="font-bold text-gray-800 text-lg">Собери рюкзак</div>
          <div className="text-sm text-gray-500">Выбери тип чрезвычайной ситуации</div>
        </div>

        <div className="grid gap-4">
          {(["flood", "earthquake"] as DisasterMode[]).map((m) => {
            const c = MODES[m];
            return (
              <button
                key={m}
                onClick={() => startMode(m)}
                className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-5 text-left shadow-lg active:scale-95 transition-transform`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{c.emoji}</span>
                  <div>
                    <div className="font-bold text-lg">{c.label}</div>
                    <div className="text-white/75 text-xs">{c.tip}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 bg-white/20 rounded-xl px-3 py-2 text-xs font-medium">
                  <Icon name="Package" size={13} />
                  {c.items.filter((i) => i.category === "essential").length} обязательных предмета из {c.items.length}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
          <div className="font-semibold text-gray-700 mb-1.5">Как играть:</div>
          <div>✅ Нажми на предмет — он попадёт в рюкзак</div>
          <div>🎯 Собери всё нужное, не превысив вес {MAX_WEIGHT} кг</div>
          <div>⚠️ Лишние вещи снижают итоговый счёт</div>
          <div>🏆 Очки зачтутся в общий рейтинг</div>
        </div>
      </div>
    );
  }

  // ── ЭКРАН РЕЗУЛЬТАТА ─────────────────────────────────────────────────────
  if (phase === "result" && cfg) {
    const { score, max, essentialPicked, essentialTotal, uselessPicked } = calcScore();
    const percent = Math.round((score / max) * 100);
    const selectedItems = items.filter((i) => selected.has(i.id));
    const missedEssentials = (mode ? MODES[mode].items : []).filter(
      (i) => i.category === "essential" && !selected.has(i.id)
    );

    return (
      <div className="space-y-4">
        {/* Шапка режима */}
        <div className={`flex items-center gap-2 bg-gradient-to-r ${cfg.color} text-white px-4 py-2.5 rounded-2xl`}>
          <span>{cfg.emoji}</span>
          <span className="font-semibold text-sm">{cfg.label}</span>
          <button onClick={handleChooseMode} className="ml-auto text-white/70 hover:text-white text-xs underline">
            сменить
          </button>
        </div>

        {/* Итог */}
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
              {percent >= 70 ? "Отличный рюкзак!" : percent >= 40 ? "Неплохо, но есть пробелы" : "Рюкзак нужно пересобрать"}
            </div>
            <div className="text-white/80 text-sm">{score} / {max} очков</div>
            <div className="w-full bg-white/20 rounded-full h-2.5 mt-1">
              <div className="h-2.5 rounded-full bg-white transition-all duration-1000" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-600">{essentialPicked}</div>
            <div className="text-xs text-green-700 mt-0.5">из {essentialTotal} нужных</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-red-500">{uselessPicked}</div>
            <div className="text-xs text-red-700 mt-0.5">лишних вещей</div>
          </div>
          <div className={`${cfg.bgLight} ${cfg.border} border rounded-xl p-3 text-center`}>
            <div className={`text-xl font-bold ${cfg.text}`}>{totalWeight}</div>
            <div className="text-xs text-gray-500 mt-0.5">кг из {MAX_WEIGHT}</div>
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
            <div className="p-4 space-y-2.5">
              {missedEssentials.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-amber-900">{item.name}</div>
                    <div className="text-xs text-amber-700 mt-0.5">{item.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRetry}
            className={`bg-gradient-to-r ${cfg.color} text-white font-semibold py-3.5 rounded-2xl shadow-md active:scale-95 transition-transform text-sm`}
          >
            🔄 Ещё раз
          </button>
          <button
            onClick={handleChooseMode}
            className="bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl shadow-sm active:scale-95 transition-transform text-sm"
          >
            🎒 Сменить режим
          </button>
        </div>
      </div>
    );
  }

  // ── ЭКРАН ИГРЫ ───────────────────────────────────────────────────────────
  if (!cfg) return null;

  return (
    <div className="space-y-4">
      {/* Шапка режима */}
      <div className={`bg-gradient-to-br ${cfg.color} rounded-2xl p-4 text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{cfg.emoji}</span>
          <div className="flex-1">
            <div className="font-bold text-base">{cfg.label} — собери рюкзак</div>
            <div className="text-white/75 text-xs">{cfg.tip}</div>
          </div>
          <button
            onClick={handleChooseMode}
            className="bg-white/20 rounded-xl px-2.5 py-1.5 text-xs font-medium hover:bg-white/30 transition-colors flex-shrink-0"
          >
            сменить
          </button>
        </div>
        {/* Вес */}
        <div className="bg-white/10 rounded-xl p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/75">Вес рюкзака</span>
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
          {isOverweight && <div className="text-red-300 text-xs font-medium">⚠️ Слишком тяжело!</div>}
        </div>
      </div>

      {/* Рюкзак */}
      <div
        className={`rounded-2xl border-2 border-dashed p-4 min-h-16 transition-all duration-200 ${
          dragOver ? `${cfg.border} ${cfg.bgLight}` : selected.size > 0 ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
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
          <div className="text-center text-sm text-gray-300 py-2">Нажимай на предметы ниже</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.filter((i) => selected.has(i.id)).map((item) => (
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

      {/* Предметы */}
      <div>
        <div className="text-xs text-gray-400 font-medium mb-2.5">
          Доступные предметы — нажми чтобы добавить:
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {items.filter((i) => !selected.has(i.id)).map((item) => (
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
                  : `border-gray-100 hover:${cfg.border} hover:${cfg.bgLight}`
              }`}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-700 leading-tight line-clamp-2">
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
