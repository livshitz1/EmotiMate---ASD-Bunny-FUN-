import React from "react";
import { RelativeTask, WHEN_LABELS } from "../types/relativeSchedule";

export default function NextSuggestionCard({
  suggestion,
  reason,
  onNext,
}: {
  suggestion: RelativeTask | null;
  reason: string;
  onNext: () => void;
}) {
  if (!suggestion) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="font-bold text-gray-800">אין משימה מומלצת כרגע</div>
        <div className="text-sm text-gray-500">אפשר להוסיף משימות או לאפס יום.</div>
      </div>
    );
  }

  const reinforcement = buildReinforcement(suggestion);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">הבא בתור</div>
          <div className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
            <span className="text-xl">{suggestion.icon ?? "⏭️"}</span>
            <span>{suggestion.label}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {WHEN_LABELS[suggestion.when]} • {reason}
          </div>

          <div className="mt-3 text-sm text-gray-700">
            {reinforcement}
          </div>
        </div>

        <button
          onClick={onNext}
          className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
        >
          הבא בתור
        </button>
      </div>
    </div>
  );
}

function buildReinforcement(t: RelativeTask) {
  // משפט מותאם-תוכן "רך"
  if (t.sensory === "QUIET" || t.need === "CALM" || t.need === "REST") {
    return `כל הכבוד. עוד מעט נעשה "${t.label}" ואז יהיה לנו רגע של שקט.`;
  }
  if (t.need === "FOOD") {
    return `כל הכבוד. עוד מעט נעשה "${t.label}" ואז הגוף ירגיש יותר טוב.`;
  }
  if (t.need === "FUN" || t.sensory === "OUTSIDE") {
    return `כל הכבוד. עוד מעט נעשה "${t.label}" ואז תהיה לנו אנרגיה טובה להמשך.`;
  }
  return `כל הכבוד. עוד מעט נעשה "${t.label}" ואז נמשיך לצעד הבא.`;
}
