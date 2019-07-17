import React from "react";

import { Address } from "../helpers";

// Actually returns a `string`, but I used `any` to appease the compiler
//   which doesn't accept functional components returning strings.
// When this TypeScript bug is fixed, feel free to replace `...): any` with `...): string`.
export default function Location({
  isTruncated,
  location
}: {
  isTruncated: boolean;
  location: Address;
}): any {
  if (!isTruncated) {
    return location.display_name;
  } else {
    return location.address.city + ", " + location.address.state;
  }
}
