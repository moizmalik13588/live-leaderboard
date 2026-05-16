import { useState, useEffect } from "react";

// Google Font - index.html ke <head> mein add karo:
// <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

const MEDALS = {
  1: {
    emoji: "🥇",
    color: "from-yellow-400 to-amber-500",
    glow: "shadow-yellow-500/40",
  },
  2: {
    emoji: "🥈",
    color: "from-slate-300 to-slate-400",
    glow: "shadow-slate-400/40",
  },
  3: {
    emoji: "🥉",
    color: "from-orange-400 to-amber-600",
    glow: "shadow-orange-500/40",
  },
};

function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function LeaderboardRow({ user, index }) {
  const medal = MEDALS[user.rank];
  const isTop3 = user.rank <= 3;

  return (
    <div
      className={`
        flex items-center gap-4 px-5 py-4 rounded-2xl mb-3
        transition-all duration-300 hover:scale-[1.02] hover:brightness-110 cursor-pointer
        ${
          isTop3
            ? "bg-white/10 backdrop-blur-sm border border-white/20"
            : "bg-white/5 border border-white/10"
        }
      `}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Rank */}
      <div className="w-8 text-center">
        {isTop3 ? (
          <span className="text-2xl">{medal.emoji}</span>
        ) : (
          <span className="text-white/40 font-mono text-sm font-medium">
            #{user.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className={`
          w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(user.userId)}
          flex items-center justify-center text-white text-sm font-bold
          ${isTop3 ? `shadow-lg ${medal.glow}` : ""}
        `}
      >
        {getInitials(user.userId)}
      </div>

      {/* Name */}
      <div className="flex-1">
        <p className="text-white font-semibold text-base capitalize tracking-wide">
          {user.userId}
        </p>
        {isTop3 && (
          <p className="text-white/40 text-xs font-mono">Top Performer</p>
        )}
      </div>

      {/* Score */}
      <div className="text-right">
        <p
          className={`
            font-bold text-lg font-mono
            ${isTop3 ? "text-white" : "text-white/70"}
          `}
        >
          {Number(user.score).toLocaleString()}
        </p>
        <p className="text-white/30 text-xs">points</p>
      </div>
    </div>
  );
}

export default function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchLeaderboard() {
    try {
      const res = await fetch("http://localhost:3002/leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("Server se connect nahi ho pa raha!");
    } finally {
      setLoading(false);
    }
  }

  // Pehli baar load karo
  useEffect(() => {
    fetchLeaderboard();

    // Har 5 second mein auto refresh - LIVE leaderboard!
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/70 text-xs font-mono tracking-widest uppercase">
              Live
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Leaderboard
          </h1>
          <p className="text-white/40 text-sm mt-1 font-mono">
            {lastUpdated ? `Updated at ${lastUpdated}` : "Loading..."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
          {loading ? (
            // Loading state
            <div className="flex flex-col items-center py-12 gap-3">
              <div className="w-10 h-10 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/40 text-sm font-mono">
                Fetching data...
              </p>
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-red-400 font-mono text-sm">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition"
              >
                Retry
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-white/40 font-mono text-sm">
                Koi data nahi abhi!
              </p>
            </div>
          ) : (
            // Leaderboard list
            <div>
              {leaderboard.map((user, index) => (
                <LeaderboardRow key={user.userId} user={user} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs font-mono mt-6">
          Auto-refreshes every 5 seconds
        </p>
      </div>
    </div>
  );
}
