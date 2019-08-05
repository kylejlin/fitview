import { Address } from "../helpers";
import Option from "../Option";

// Actually returns a `string`, but I used `any` to appease the compiler
//   which doesn't accept functional components returning strings.
// When this TypeScript bug is fixed, feel free to replace `...): any` with `...): string`.
export default function Location({
  isTruncated,
  location,
}: {
  isTruncated: boolean;
  location: Option<Address>;
}): any {
  return location.match({
    none: () => "Unknown",
    some: (location) => {
      if (!isTruncated) {
        return location.display_name;
      } else if ("string" === typeof location.address.city) {
        return location.address.city + ", " + location.address.state;
      } else {
        return (
          location.address.county ||
          location.address.state ||
          location.address.province ||
          location.address.country
        );
      }
    },
  });
}
