export function geocoder(): Geocoder;
export function isOrIsAncestorOf(
  ancestor: Element,
  descendant: Element
): boolean;
export class EasyFit {
  constructor(options: EasyFitOptions);
  parse(file: ArrayBuffer, callback: (err: string, data: any) => void);
}

interface Geocoder {
  reverse(long: number, lat: number): Geocoder;
  end(callback: (error: any, data: any) => void): void;
}

// Written based on https://www.npmjs.com/package/easy-fit
interface EasyFitOptions {
  mode?: "cascade" | "list" | "both";
  lengthUnit?: "m" | "km" | "mi";
  temperatureUnit?: "celsius" | "kelvin" | "farenheit";
  speedUnit?: "m/s" | "km/h" | "mph";
  force?: boolean;
  elapsedRecordField?: boolean;
}
