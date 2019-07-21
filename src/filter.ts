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
    const key = keyFromAttributeAndBoundType(attribute, boundType);
    filter[key] = value as any;
    return filter;
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

  config(): FilterConfig {
    const { heartRate, cadence, speed } = this;
    return { heartRate, cadence, speed };
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
  speed: [number, number];
}

export enum Attribute {
  HeartRate,
  Cadence,
  Speed
}

function keyFromAttributeAndBoundType(
  attribute: Attribute,
  boundType: BoundType
): keyof Filter {
  const beginning = keyBeginningAttribute(attribute);
  const ending = keyEndingFromBoundType(boundType);
  return (beginning + ending) as keyof Filter;
}

function keyBeginningAttribute(attribute: Attribute): string {
  switch (attribute) {
    case Attribute.HeartRate:
      return "pendingHeartRate";
    case Attribute.Cadence:
      return "pendingCadence";
    case Attribute.Speed:
      return "pendingSpeed";
  }
}

function keyEndingFromBoundType(boundType: BoundType): string {
  switch (boundType) {
    case BoundType.Min:
      return "Min";
    case BoundType.Max:
      return "Max";
  }
}
