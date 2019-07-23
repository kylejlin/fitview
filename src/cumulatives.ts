import { Filter } from "./filter";
import { cloneActivity, Activity } from "./getActivity";
import { average, metersToMiles } from "./helpers";

export interface Cumulatives {
  totalDuration: number;
  totalDistance: number;
  averagePace: number;
  averageHeartRate: number;
}

export function getCumulatives(
  originalActivity: Activity,
  filter: Filter
): Cumulatives {
  const activity = cloneActivity(originalActivity);

  let totalDuration = 0;
  let totalDistance = 0;

  activity.sessions.forEach((session) => {
    if (session.records.length > 0) {
      const [first, ...rest] = session.records;
      let timestamp = first.timestamp;
      let distance = first.distance;
      rest.forEach((record) => {
        if (!filter.isAnyAttributeIllegal(record)) {
          const deltaTime = record.timestamp.getTime() - timestamp.getTime();
          const deltaDistance = record.distance - distance;
          totalDuration += deltaTime;
          totalDistance += deltaDistance;
        }

        timestamp = record.timestamp;
        distance = record.distance;
      });
    }
  });

  // Milliseconds to seconds
  totalDuration *= 1e-3;

  const averagePace = getAveragePace(totalDistance, totalDuration);
  const heartRates = activity.records.map((record) => record.heart_rate);
  const averageHeartRate = average(heartRates);
  return {
    totalDuration,
    totalDistance,
    averagePace,
    averageHeartRate,
  };
}

function getAveragePace(meters: number, milliseconds: number): number {
  const miles = metersToMiles(meters);
  const minutes = milliseconds / 60;
  return minutes / miles;
}
