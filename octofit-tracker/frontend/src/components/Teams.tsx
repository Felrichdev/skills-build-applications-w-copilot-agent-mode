import { CapabilityCard } from './CapabilityCard.js';

type TeamsResponse = {
  teams: Array<{ name: string; members: string[] }>;
};

export default function Teams() {
  return (
    <CapabilityCard<TeamsResponse>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      emptyMessage="No teams"
      isEmpty={(data) => data.teams.length === 0}
      render={(data) => (
        <ul>
          {data.teams.map((team, index) => (
            <li key={`${team.name}-${index}`}>
              {team.name} ({team.members?.length ?? 0} members)
            </li>
          ))}
        </ul>
      )}
    />
  );
}
