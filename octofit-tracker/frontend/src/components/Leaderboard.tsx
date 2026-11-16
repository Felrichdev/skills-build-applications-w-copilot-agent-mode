import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardResponse = {
  leaderboard: Array<{ teamName: string; totalPoints: number; rank: number }>;
};

function loadLeaderboard() {
  return getJson<LeaderboardResponse>('/api/leaderboard');
}

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      load={loadLeaderboard}
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
