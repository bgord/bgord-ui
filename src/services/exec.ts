type ExecFunctionListType = Array<() => void>;

export function exec(list: ExecFunctionListType) {
  return function () {
    for (const item of list) {
      item();
    }
  };
}
