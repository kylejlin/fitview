export default class Option<T> {
  static some<T>(value: T): Option<T> {
    const some = Object.create(Option.prototype);
    some.isNone_ = false;
    some.value = value;
    return some;
  }

  static none() {
    return NONE;
  }

  match<N, S>(matcher: { none: () => N; some: (value: T) => S }): N | S {
    if (this.isNone()) {
      return matcher.none();
    } else {
      return matcher.some((this as any).value);
    }
  }

  isNone() {
    return (this as any).isNone_;
  }

  isSome() {
    return !this.isNone();
  }

  map<R>(mapper: (value: T) => R): Option<R> {
    return this.match({
      none: () => (this as unknown) as Option<R>,
      some: value => Option.some(mapper(value))
    });
  }

  unwrapOr<D>(defaultValue: D): T | D {
    return this.match({
      none: () => defaultValue,
      some: value => value
    });
  }
}

const NONE = (() => {
  const none = Object.create(Option.prototype);
  none.isNone_ = true;
  return none;
})();
