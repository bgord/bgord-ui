export const CSS = (href: string) => [
  { rel: "preload", as: "style", href },
  { rel: "stylesheet", href },
];

export const JS = (src: string) => ({ type: "module", src });

export const META = [
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
];
