export default class Option {
  static some(value) {
    const some = Object.create(Option.prototype);
    some.isNone_ = false;
    some.value = value;
    return some;
  }

  static none() {
    return NONE;
  }

  match(matcher) {
    if (this.isNone()) {
      return matcher.none();
    } else {
      return matcher.some(this.value);
    }
  }

  isNone() {
    return this.isNone_;
  }

  isSome() {
    return !this.isNone();
  }

  map(mapper) {
    this.match({
      none: () => this,
      some: value => Option.some(mapper(value))
    });
  }

  unwrapOr(defaultValue) {
    this.match({
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
