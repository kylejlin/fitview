export default function allVariants<E>(enum_: /*typeof E*/ any): E[] {
  return Object.values(enum_).filter((k) => "number" === typeof k) as E[];
}
