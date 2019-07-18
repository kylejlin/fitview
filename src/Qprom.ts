enum PromStatus {
  Pending,
  Fulfilled,
  Rejected
}

export default class Qprom<T> extends Promise<T> {
  private status: PromStatus;
  private value?: T;
  private error?: any;
  private updateListeners: (() => void)[];

  static fromPromise<T>(prom: Promise<T>): Qprom<T> {
    return new Qprom((resolve, reject) => {
      prom.then(resolve);
      prom.catch(reject);
    }, true);
  }

  private constructor(
    cb: (resolve: (val: T) => void, reject: (err: any) => void) => void,
    shouldListen: boolean
  ) {
    super(cb);

    this.status = PromStatus.Pending;
    this.updateListeners = [];

    if (shouldListen) {
      super.then(val => {
        this.status = PromStatus.Fulfilled;
        this.value = val;
        this.updateListeners.forEach(onUpdate => {
          onUpdate();
        });
      });
      super.catch(err => {
        this.status = PromStatus.Rejected;
        this.error = err;
        this.updateListeners.forEach(onUpdate => {
          onUpdate();
        });
      });
    }
  }

  match<Pending, Fulfilled, Rejected>(matcher: {
    pending: () => Pending;
    fulfilled: (val: T) => Fulfilled;
    rejected: (err: any) => Rejected;
    onUpdate?: () => void;
  }): Pending | Fulfilled | Rejected {
    if ("function" === typeof matcher.onUpdate) {
      this.updateListeners.push(matcher.onUpdate);
    }

    switch (this.status) {
      case PromStatus.Pending:
        return matcher.pending();
      case PromStatus.Fulfilled:
        return matcher.fulfilled(this.value!);
      case PromStatus.Rejected:
        return matcher.rejected(this.error);
    }
  }
}
