import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type ActivitiesResponse = {
  activities: Array<{ type: string; minutes: number; points: number }>;
};

function loadActivities() {
  return getJson<ActivitiesResponse>('/api/activities');
}

export default function Activities() {
  return (
    <CapabilityCard<ActivitiesResponse>
      title="Activities"
      description="Track student activity minutes and points."
      load={loadActivities}
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
