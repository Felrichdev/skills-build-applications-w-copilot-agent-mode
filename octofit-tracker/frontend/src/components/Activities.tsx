import { CapabilityCard } from './CapabilityCard.js';

type ActivitiesResponse = {
  activities: Array<{ type: string; minutes: number; points: number }>;
};

export default function Activities() {
  return (
    <CapabilityCard<ActivitiesResponse>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      emptyMessage="No activities"
      isEmpty={(data) => data.activities.length === 0}
      render={(data) => (
        <ul>
          {data.activities.map((activity, index) => (
            <li key={`${activity.type}-${index}`}>
              {activity.type} · {activity.minutes} min · {activity.points} pts
            </li>
          ))}
        </ul>
      )}
    />
  );
}
