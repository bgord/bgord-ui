type ColorType = string;

export function Colorful(color: ColorType) {
  const value = `var(--${color})`;

  const options = {
    color: { color: value },
    background: { background: value },
  };

  const style = {
    color: { style: { color: value } },
    background: { style: { background: value } },
  };

  return { ...options, style };
}
