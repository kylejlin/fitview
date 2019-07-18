import { sum } from "./helpers";

export function getActivity(rawFile: any): Activity {
  const sport: string = rawFile.sport.sport;
  const { activity } = rawFile;
  const sessions: Session[] = activity.sessions.map(getSession);
  const laps: Lap[] = sessions.map(session => session.laps).flat();
  const records: Record[] = sessions.map(session => session.records).flat();
  const total_distance = sum(sessions.map(session => session.total_distance));
  const total_elapsed_time = sum(
    sessions.map(session => session.total_elapsed_time)
  );
  const start_time = activity.timestamp;
  const end_time = records[records.length - 1].timestamp;

  return {
    ...activity,
    sport,
    sessions,
    laps,
    records,
    total_distance,
    total_elapsed_time,
    start_time,
    end_time
  };
}

function getSession(rawSession: any): Session {
  const session = { ...rawSession };
  session.laps = session.laps.map(getLap);
  session.records = session.laps.map((lap: Lap) => lap.records).flat();
  return session;
}

function getLap(rawLap: any): Lap {
  const lap = { ...rawLap };
  lap.records = lap.records.slice();
  return lap;
}

export interface Activity {
  timestamp: Date;

  sport: string;
  sessions: Session[];
  laps: Lap[];
  records: Record[];

  total_distance: number;
  total_elapsed_time: number;
  total_timer_time: number;

  start_time: Date;
  end_time: Date;
}

export interface Session {
  timestamp: Date;
  laps: Lap[];
  records: Record[];

  avg_cadence: number;
  avg_heart_rate: 148;
  avg_power: number;
  avg_speed: number;
  avg_temperature: number;

  max_cadence: number;
  max_heart_rate: number;
  max_power: number;
  max_speed: number;
  max_temperature: number;

  total_distance: number;
  total_elapsed_time: number;
  total_timer_time: number;
}

export interface Lap {
  timestamp: Date;
  records: Record[];

  avg_cadence: number;
  avg_heart_rate: 148;
  avg_power: number;
  avg_speed: number;
  avg_temperature: number;

  max_cadence: number;
  max_heart_rate: number;
  max_power: number;
  max_speed: number;
  max_temperature: number;

  total_distance: number;
  total_elapsed_time: number;
  total_timer_time: number;
}

export interface Record {
  timestamp: Date;

  altitude: number;
  cadence: number;
  distance: number;
  elapsed_time: number;
  heart_rate: number;
  position_lat: number;
  position_long: number;
  speed: number;
  temperature: number;
}