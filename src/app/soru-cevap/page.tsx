"use client";

import { useEffect, useRef, useState } from "react";
import { quizQuestions, QuizQuestion } from "@/data/quizQuestions";

type Phase = "login" | "playing" | "finished";

type LeaderRow = {
  id: string;
  pubgId: string;
  firstName: string;
  lastName: string;
  score: number;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TIME_PER_QUESTION = 5;
const POINTS_PER_CORRECT = 3;

export default function SoruCevapPage() {
  const [phase, setPhase] = useState<Phase>("login");
  const [pubgIdInput, setPubgIdInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [player, setPlayer] = useState<{ firstName: string; lastName: string; pubgId: string } | null>(null);

  const [order, setOrder] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startQuiz() {
    const shuffled = shuffle(quizQuestions);
    setOrder(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
    setSelected(null);
    setFeedback(null);
    setPhase("playing");
  }

  async function handleLogin() {
    setLoginError("");
    if (!pubgIdInput.trim()) {
      setLoginError("Lutfen Oyuncu ID girin");
      return;
    }
    try {
      const res = await fetch(`/api/quiz/player?pubgId=${encodeURIComponent(pubgIdInput.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Oyuncu bulunamadi");
        return;
      }
      setPlayer(data.player);
      startQuiz();
    } catch {
      setLoginError("Bir hata olustu, tekrar deneyin");
    }
  }

  function restartFromBeginning() {
    startQuiz();
  }

  async function finishQuiz(finalScore: number) {
    setPhase("finished");
    if (timerRef.current) clearInterval(timerRef.current);
    if (!player) return;
    setSaving(true);
    try {
      await fetch("/api/quiz/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubgId: player.pubgId, score: finalScore }),
      });
      const lb = await fetch("/api/quiz/leaderboard").then((r) => r.json());
      setLeaderboard(lb.top || []);
    } catch {
      // sessizce gec
    } finally {
      setSaving(false);
    }
  }

  function goToNextQuestion(scoreSoFar: number) {
    if (currentIndex + 1 >= order.length) {
      finishQuiz(scoreSoFar);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setTimeLeft(TIME_PER_QUESTION);
    setSelected(null);
    setFeedback(null);
  }

  function handleAnswer(key: string) {
    if (selected) return; // zaten cevaplandi
    setSelected(key);
    const current = order[currentIndex];
    const isCorrect = key === current.correct;
    setFeedback(isCorrect ? "correct" : "wrong");
    const newScore = isCorrect ? score + POINTS_PER_CORRECT : score;
    setScore(newScore);
    setTimeout(() => {
      goToNextQuestion(newScore);
    }, 700);
  }

  useEffect(() => {
    if (phase !== "playing") return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          restartFromBeginning();
          return TIME_PER_QUESTION;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex]);

  useEffect(() => {
    fetch("/api/quiz/leaderboard")
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.top || []))
      .catch(() => {});
  }, []);

  if (phase === "login") {
    return (
      <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>PUBG Mobile Soru Cevap</h1>
        <p style={{ color: "#aaa", marginBottom: 20 }}>
          Yarismaya baslamak icin kayitli Oyuncu ID'ni gir. Her dogru cevap {POINTS_PER_CORRECT} puan,
          her soru icin {TIME_PER_QUESTION} saniyen var. Sure biterse basa donersin.
        </p>
        <input
          value={pubgIdInput}
          onChange={(e) => setPubgIdInput(e.target.value)}
          placeholder="Oyuncu ID (pubgId)"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
            marginBottom: 12,
          }}
        />
        {loginError && <p style={{ color: "#f87171", marginBottom: 12 }}>{loginError}</p>}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#22c55e",
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Basla
        </button>

        <LeaderboardBox leaderboard={leaderboard} />
      </div>
    );
  }

  if (phase === "playing") {
    const current = order[currentIndex];
    if (!current) return null;
    return (
      <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#aaa" }}>
          <span>Soru {currentIndex + 1} / {order.length}</span>
          <span>Skor: {score}</span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "#222",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(timeLeft / TIME_PER_QUESTION) * 100}%`,
              background: timeLeft <= 2 ? "#ef4444" : "#22c55e",
              transition: "width 1s linear",
            }}
          />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{current.question}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {current.options.map((opt) => {
            let bg = "#1a1a1a";
            if (selected) {
              if (opt.key === current.correct) bg = "#16a34a";
              else if (opt.key === selected) bg = "#dc2626";
            }
            return (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                disabled={!!selected}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid #333",
                  background: bg,
                  color: "#fff",
                  cursor: selected ? "default" : "pointer",
                }}
              >
                <strong>{opt.key})</strong> {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Yarisma Bitti!</h1>
      <p style={{ fontSize: 18, marginBottom: 20 }}>
        {player?.firstName} {player?.lastName}, toplam skorun: <strong>{score}</strong>
      </p>
      {saving && <p style={{ color: "#aaa" }}>Skor kaydediliyor...</p>}
      <button
        onClick={() => setPhase("login")}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          background: "#22c55e",
          color: "#000",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 24,
        }}
      >
        Tekrar Oyna
      </button>
      <LeaderboardBox leaderboard={leaderboard} />
    </div>
  );
}

function LeaderboardBox({ leaderboard }: { leaderboard: LeaderRow[] }) {
  return (
    <div style={{ marginTop: 12 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#ccc" }}>Liderlik Tablosu (Ilk 3)</h3>
      {leaderboard.length === 0 && <p style={{ color: "#666" }}>Henuz skor yok.</p>}
      <ol style={{ paddingLeft: 20 }}>
        {leaderboard.map((row) => (
          <li key={row.id} style={{ marginBottom: 6, color: "#eee" }}>
            <strong>{row.firstName} {row.lastName}</strong> (ID: {row.pubgId}) - {row.score} puan
          </li>
        ))}
      </ol>
    </div>
  );
}
