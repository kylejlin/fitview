import {
  getRecordAttribute,
  Attribute,
  Record,
  ALL_ATTRIBUTES,
} from "./getActivity";

export enum BoundType {
  Min,
  Max,
}

export class Filter {
  public pendingHeartRateMin: string;
  public pendingHeartRateMax: string;
  public pendingCadenceMin: string;
  public pendingCadenceMax: string;
  public pendingPaceMin: string;
  public pendingPaceMax: string;

  public heartRate: [number, number];
  public cadence: [number, number];
  public pace: [number, number];

  constructor(config: FilterConfig) {
    this.pendingHeartRateMin = "" + config.heartRate[0];
    this.pendingHeartRateMax = "" + config.heartRate[1];
    this.pendingCadenceMin = "" + config.cadence[0];
    this.pendingCadenceMax = "" + config.cadence[1];
    this.pendingPaceMin = "" + config.pace[0];
    this.pendingPaceMax = "" + config.pace[1];

    this.heartRate = config.heartRate;
    this.cadence = config.cadence;
    this.pace = config.pace;
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
    const { heartRate, cadence, pace } = this;
    return { heartRate, cadence, pace };
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
      pace: sync(this.pace, this.pendingPaceMin, this.pendingPaceMax),
    });
  }

  isAttributeIllegal(attribute: Attribute, record: Record): boolean {
    return !this.isAttributeLegal(attribute, record);
  }

  private isAttributeLegal(attribute: Attribute, record: Record): boolean {
    const [min, max] = this.getBounds(attribute);
    const value = getRecordAttribute(record, attribute);
    return min <= value && value <= max;
  }

  isAnyAttributeIllegal(record: Record): boolean {
    return ALL_ATTRIBUTES.some((attribute) =>
      this.isAttributeIllegal(attribute, record)
    );
  }

  private getBounds(attribute: Attribute): [number, number] {
    switch (attribute) {
      case Attribute.HeartRate:
        return this.heartRate;
      case Attribute.Cadence:
        return this.cadence;
      case Attribute.Pace:
        return this.pace;
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

interface FilterConfig {
  heartRate: [number, number];
  cadence: [number, number];
  pace: [number, number];
}

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
    case Attribute.Pace:
      return "pendingPace";
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
