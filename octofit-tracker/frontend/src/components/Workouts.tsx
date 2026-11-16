import { CapabilityCard } from './CapabilityCard.js';

type WorkoutsResponse = {
  suggestions: Array<{ title: string; focus: string; reason?: string }>;
};

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutsResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona@example.com"
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
