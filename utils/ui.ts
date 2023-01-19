export function classNames(...classes: (boolean | string)[]) {
  return classes.filter(Boolean).join(' ');
}
