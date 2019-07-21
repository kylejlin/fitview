import allVariants from "./allVariants";
import { Record } from "./getActivity";

export enum BoundType {
  Min,
  Max
}

export class Filter {
  public pendingHeartRateMin: string;
  public pendingHeartRateMax: string;
  public pendingCadenceMin: string;
  public pendingCadenceMax: string;
  public pendingSpeedMin: string;
  public pendingSpeedMax: string;

  private heartRate: [number, number];
  private cadence: [number, number];
  private speed: [number, number];

  constructor(config: FilterConfig) {
    this.pendingHeartRateMin = "" + config.heartRate[0];
    this.pendingHeartRateMax = "" + config.heartRate[1];
    this.pendingCadenceMin = "" + config.cadence[0];
    this.pendingCadenceMax = "" + config.cadence[1];
    this.pendingSpeedMin = "" + config.speed[0];
    this.pendingSpeedMax = "" + config.speed[1];

    this.heartRate = config.heartRate;
    this.cadence = config.cadence;
    this.speed = config.speed;
  }

  setPendingBound(
    attribute: Attribute,
    boundType: BoundType,
    value: string
  ): Filter {
    const filter = new Filter(this.config());
    const key = pendingKeyFromAttributeAndBoundType(attribute, boundType);
    filter[key] = value as any;
    return filter;
  }

  private config(): FilterConfig {
    const { heartRate, cadence, speed } = this;
    return { heartRate, cadence, speed };
  }

  syncPendingBoundsWithActualBounds(): Filter {
    return new Filter({
      heartRate: sync(
        this.heartRate,
        this.pendingHeartRateMin,
        this.pendingHeartRateMax
      ),
      cadence: sync(
        this.cadence,
        this.pendingCadenceMin,
        this.pendingCadenceMax
      ),
      speed: sync(this.speed, this.pendingSpeedMin, this.pendingSpeedMax)
    });
  }

  isAttributeIllegal(attribute: Attribute, record: Record): boolean {
    return !this.isAttributeLegal(attribute, record);
  }

  private isAttributeLegal(attribute: Attribute, record: Record): boolean {
    const [min, max] = this.getBounds(attribute);
    const value = getValueFromRecord(record, attribute);
    return min <= value && value <= max;
  }

  isAnyAttributeIllegal(record: Record): boolean {
    return ALL_ATTRIBUTES.some(attribute =>
      this.isAttributeIllegal(attribute, record)
    );
  }

  private getBounds(attribute: Attribute): [number, number] {
    switch (attribute) {
      case Attribute.HeartRate:
        return this.heartRate;
      case Attribute.Cadence:
        return this.cadence;
      case Attribute.Speed:
        return this.speed;
    }
  }
}

function sync(
  oldBounds: [number, number],
  pendingMin: string,
  pendingMax: string
): [number, number] {
  const parsedMin = strictParseInt(pendingMin);
  const parsedMax = strictParseInt(pendingMax);
  const newMin = isNaN(parsedMin) ? oldBounds[0] : parsedMin;
  const newMax = isNaN(parsedMax) ? oldBounds[1] : parsedMax;
  return [newMin, newMax];
}

function strictParseInt(value: string): number {
  if (/^-?\d*$/.test(value)) {
    return parseInt(value, 10);
  } else {
    return NaN;
  }
}

function getValueFromRecord(record: Record, attribute: Attribute): number {
  switch (attribute) {
    case Attribute.HeartRate:
      return record.heart_rate;
    case Attribute.Cadence:
      return record.cadence;
    case Attribute.Speed:
      return record.speed;
  }
}

interface FilterConfig {
  heartRate: [number, number];
  cadence: [number, number];
  speed: [number, number];
}

export enum Attribute {
  HeartRate,
  Cadence,
  Speed
}
const ALL_ATTRIBUTES = allVariants<Attribute>(Attribute);

function pendingKeyFromAttributeAndBoundType(
  attribute: Attribute,
  boundType: BoundType
): keyof Filter {
  const beginning = pendingKeyBeginningAttribute(attribute);
  const ending = pendingKeyEndingFromBoundType(boundType);
  return (beginning + ending) as keyof Filter;
}

function pendingKeyBeginningAttribute(attribute: Attribute): string {
  switch (attribute) {
    case Attribute.HeartRate:
      return "pendingHeartRate";
    case Attribute.Cadence:
      return "pendingCadence";
    case Attribute.Speed:
      return "pendingSpeed";
  }
}

function pendingKeyEndingFromBoundType(boundType: BoundType): string {
  switch (boundType) {
    case BoundType.Min:
      return "Min";
    case BoundType.Max:
      return "Max";
  }
}