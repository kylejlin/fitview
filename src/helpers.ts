import { geocoder } from "./lib";
import { Activity, Record } from "./getActivity";
import Option from "./Option";

export function getActivityRecords(activity: any): any[] {
  return activity.sessions
    .map((session: any) => getSessionRecords(session))
    .flat();
}

export function getSessionRecords(session: any): any[] {
  return session.laps.map((lap: any) => lap.records).flat();
}

export function capitalizeFirstLetter(word: string): string {
  return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
}

export function dayOfWeekString(index: number): string {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][index];
}

export function monthString(index: number): string {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][index];
}

export function getTime(date: Date): string {
  return date.getHours() + ":" + date.getMinutes();
}

export function getActivityDuration(activity: any): string {
  return getDurationFromSecs(activity);
}

export function getDurationFromSecs(millis: number): string {
  const hours = Math.floor(millis / 3600);
  const minutes = Math.floor((millis % 3600) / 60);
  const seconds = Math.floor(millis % 60);
  return (
    zeroPad(hours, 2) + ":" + zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2)
  );
}

export function zeroPad(value: any, minWidth: number): string {
  const string = "" + value;
  if (string.length < minWidth) {
    const deficit = minWidth - string.length;
    return "0".repeat(deficit) + string;
  } else {
    return string;
  }
}

export function reverseGeocode(lat: number, lon: number): Promise<Address> {
  return new Promise((resolve, reject) => {
    geocoder()
      .reverse(lon, lat)
      .end((err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
  });
}

export function lerpDate(start: Date, end: Date, factor: number): Date {
  const startMil = start.getTime();
  const endMil = end.getTime();
  const lerpMil = startMil + (endMil - startMil) * factor;
  return new Date(lerpMil);
}

export function getOffsetIndex(records: Record[], offsetTime: Date): number {
  const cursorMil = offsetTime.getTime();
  const { length } = records;
  for (let i = 0; i < length; i++) {
    const { timestamp } = records[i];
    if (timestamp.getTime() >= cursorMil) {
      return i;
    }
  }
  return length - 1;
}

export interface Address {
  address: {
    city?: string;
    country?: string;
    county?: string;
    house_number?: string;
    neighbourhood?: string;
    postcode?: string;
    province?: string;
    road?: string;
    state?: string;
    supermarket?: string;
  };
  display_name: string;
}

export function sum(numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

export function fractionalMinuteToPaceString(minutes: number): string {
  if (isNaN(minutes) || minutes === Infinity || minutes === -Infinity) {
    return "stationary";
  } else {
    const fractionalPart = minutes - Math.floor(minutes);
    return (
      Math.floor(minutes) + ":" + zeroPad(Math.floor(60 * fractionalPart), 2)
    );
  }
}

export function average(numbers: number[]): number {
  return sum(numbers) / numbers.length;
}

export function metersToMiles(meters: number): number {
  return meters / 1609.34;
}

export function sliceDuration(records: Record[], duration: number): Record[] {
  if (records.length === 0) {
    return [];
  } else {
    const endTime = records[0].timestamp.getTime() + duration;
    const endIndex = records.findIndex((r) => r.timestamp.getTime() > endTime);
    if (endIndex === -1) {
      return records.slice();
    } else {
      return records.slice(0, endIndex);
    }
  }
}

export function getFirstRecordTimestampOrActivityStartTime(
  activity: Activity
): Date {
  if (activity.records.length === 0) {
    return activity.start_time;
  } else {
    return activity.records[0].timestamp;
  }
}

export function getLastRecordTimestampOrActivityEndTime(
  activity: Activity
): Date {
  if (activity.records.length === 0) {
    return activity.end_time;
  } else {
    return activity.records[activity.records.length - 1].timestamp;
  }
}

export function clamp({
  min,
  max,
  value,
}: {
  min: number;
  max: number;
  value: number;
}): number {
  return Math.min(max, Math.max(min, value));
}

export function pickAboutN<T>(items: T[], n: number): T[] {
  const step = items.length / n;
  const picked = [];
  let prevIndex = -1;
  for (let i = 0; i < items.length; i += step) {
    const j = Math.floor(i);
    if (prevIndex !== j) {
      picked.push(items[j]);
      prevIndex = j;
    }
  }
  return picked;
}

export function getNearestPositionedRecord(
  records: Record[],
  index: number
): Option<Record> {
  for (
    let absoluteOffset = 0;
    absoluteOffset < records.length;
    absoluteOffset++
  ) {
    const leftRecord = records[index - absoluteOffset];
    if (leftRecord && isRecordPositioned(leftRecord)) {
      return Option.some(leftRecord);
    }
    const rightRecord = records[index + absoluteOffset];
    if (rightRecord && isRecordPositioned(rightRecord)) {
      return Option.some(rightRecord);
    }
  }
  return Option.none();
}

function isRecordPositioned(record: Record): boolean {
  return (
    "number" === typeof record.position_lat &&
    "number" === typeof record.position_long
  );
}
