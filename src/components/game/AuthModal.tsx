import { useState } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/e7a78eeb-8453-4490-9f1c-62560b03fa7d";

export interface AuthUser {
  id: number;
  username: string;
  token: string;
}

interface AuthModalProps {
  onClose: () => void;
  onAuth: (user: AuthUser) => void;
}

export default function AuthModal({ onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!username.trim() || !password) { setError("Заполни все поля"); return; }
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка"); return; }
      localStorage.setItem("cs_user", JSON.stringify(data));
      onAuth(data);
      onClose();
    } catch {
      setError("Нет соединения. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Шапка */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-white text-base">
              {mode === "login" ? "Вход в аккаунт" : "Регистрация"}
            </div>
            <div className="text-blue-100 text-xs mt-0.5">
              {mode === "login" ? "Введи имя и пароль" : "Придумай имя и пароль"}
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Переключатель */}
          <div className="flex bg-gray-100 rounded-2xl p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  mode === m ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
                }`}
              >
                {m === "login" ? "Войти" : "Создать аккаунт"}
              </button>
            ))}
          </div>

          {/* Поля */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Имя игрока</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="например: Иван или SuperRescuer"
                maxLength={30}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="минимум 4 символа"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          {/* Кнопка */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3.5 rounded-2xl shadow-md active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "Подождите..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>

          <div className="text-center text-xs text-gray-400">
            {mode === "login"
              ? "Нет аккаунта? Нажми «Создать аккаунт»"
              : "Уже есть аккаунт? Нажми «Войти»"}
          </div>
        </div>
      </div>
    </div>
  );
}
