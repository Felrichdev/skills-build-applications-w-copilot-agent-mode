import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardResponse = {
  leaderboard: Array<{ teamName: string; totalPoints: number; rank: number }>;
};

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      emptyMessage="No leaderboard"
      isEmpty={(data) => data.leaderboard.length === 0}
      render={(data) => (
        <ol>
          {data.leaderboard.map((entry) => (
            <li key={entry.teamName}>
              {entry.teamName}: {entry.totalPoints} pts (rank {entry.rank})
            </li>
          ))}
        </ol>
      )}
    />
  );
}
