const express = require("express");
const Redis = require("ioredis");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// ioredis
const redis = new Redis({
  host: "localhost",
  port: 6379,
});

redis.on("connect", () => console.log("✅ Redis connected!"));
redis.on("error", (err) => console.log("❌ Redis Error:", err));

// POST /post/:id/view
app.post("/post/:id/view", async (req, res) => {
  const postId = req.params.id;
  const key = `post:${postId}:views`;
  const newCount = await redis.incr(key);
  res.json({
    postId,
    views: newCount,
  });
});
// POST /leaderboard/score
app.post("/leaderboard/score", async (req, res) => {
  const { userId, points } = req.body;
  if (!userId || !points) {
    return res.status(400).json({
      error: "userId aur points dono bhejo!",
    });
  }

  // ZINCRBY:
  const newScore = await redis.zincrby("leaderboard", points, userId);
  res.json({
    userId,
    pointsAdded: points,
    totalScore: newScore,
  });
});
// GET /leaderboard
app.get("/leaderboard", async (req, res) => {
  // ZREVRANGE:
  const result = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");
  const leaderboard = [];
  for (let i = 0; i < result.length; i += 2) {
    leaderboard.push({
      rank: i / 2 + 1,
      userId: result[i],
      score: result[i + 1],
    });
  }
  res.json({
    leaderboard,
  });
});
// GET /leaderboard/:userid/rank
app.get("/leaderboard/:userid/rank", async (req, res) => {
  const userId = req.params.userid;
  // ZREVRANK:
  const rank = await redis.zrevrank("leaderboard", userId);
  if (rank === null) {
    return res.status(404).json({
      error: `${userId} leaderboard mein nahi hai!`,
    });
  }

  // ZSCORE:
  const score = await redis.zscore("leaderboard", userId);
  res.json({
    userId,
    rank: rank + 1,
    score,
  });
});

app.listen(3002, () => {
  console.log("Server running: http://localhost:3002");
});
