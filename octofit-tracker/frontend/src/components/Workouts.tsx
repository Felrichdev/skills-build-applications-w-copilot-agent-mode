import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutsResponse = {
  suggestions: Array<{ title: string; focus: string; reason?: string }>;
};

function loadWorkouts() {
  return getJson<WorkoutsResponse>('/api/workouts/suggestions/mona@example.com');
}

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutsResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      load={loadWorkouts}
      emptyMessage="No workout suggestions"
      isEmpty={(data) => data.suggestions.length === 0}
      render={(data) => (
        <ul>
          {data.suggestions.map((suggestion, index) => (
            <li key={`${suggestion.title}-${index}`}>
              {suggestion.title} ({suggestion.focus}){suggestion.reason ? ` — ${suggestion.reason}` : ''}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
