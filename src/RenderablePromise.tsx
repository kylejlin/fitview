import React from "react";

export default class PromiseRenderer<
  T extends React.ReactNode,
  F extends React.ReactNode
> extends React.Component<Props<T, F>, {}> {
  private fallback: F;
  private isComplete: boolean;
  private value?: T;

  constructor(props: Props<T, F>) {
    super(props);

    const { promise, fallback } = props;

    this.fallback = fallback;
    this.isComplete = false;
    this.value = undefined;

    promise
      .then(value => {
        this.isComplete = true;
        this.value = value;
        this.forceUpdate();
      })
      .catch(value => {
        this.isComplete = true;
        this.value = value;
        this.forceUpdate();
      });
  }

  render(): React.ReactNode {
    if (this.isComplete) {
      return this.value;
    } else {
      return this.fallback;
    }
  }
}

interface Props<T, F> {
  promise: Promise<T>;
  fallback: F;
}
