type RhythmBaseType = number;
type RhythmTimesType = number;

const DEFAULT_BASE_PX = 12;

export function Rhythm(base: RhythmBaseType = DEFAULT_BASE_PX) {
  return {
    times(times: RhythmTimesType) {
      const result = base * times;

      const dimensions = {
        height: { height: px(result) },
        minHeight: { minHeight: px(result) },
        maxHeight: { maxHeight: px(result) },
        width: { width: px(result) },
        minWidth: { minWidth: px(result) },
        maxWidth: { maxWidth: px(result) },
        square: { height: px(result), width: px(result) },
      };

      const style = {
        height: { style: { height: px(result) } },
        minHeight: { style: { minHeight: px(result) } },
        maxHeight: { style: { maxHeight: px(result) } },
        width: { style: { width: px(result) } },
        minWidth: { style: { minWidth: px(result) } },
        maxWidth: { style: { maxWidth: px(result) } },
        square: { style: { height: px(result), width: px(result) } },
      };

      return { px: px(result), raw: result, style, ...dimensions };
    },
  };
}

function px(number: number) {
  return `${number}px`;
}
