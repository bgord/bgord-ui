type ExecFunctionListType = Array<() => void>;

export function exec(list: ExecFunctionListType) {
  return function () {
    for (const fn of list) fn();
  };
}
