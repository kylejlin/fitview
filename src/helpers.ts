import { geocoder } from "./lib";

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
    "Saturday"
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
    "December"
  ][index];
}

export function getTime(date: Date): string {
  return date.getHours() + ":" + date.getMinutes();
}

export function getActivityDuration(activity: any): string {
  return getDurationFromMillis(activity);
}

export function getDurationFromMillis(millis: number): string {
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
          console.log(result);
          resolve(result);
        }
      });
  });
}

export interface Address {
  address: {
    city?: string;
    country?: string;
    county?: string;
    house_number?: string;
    neighbourhood?: string;
    postcode?: string;
    road?: string;
    state?: string;
    supermarket?: string;
  };
  display_name: string;
}

export function sum(numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}
