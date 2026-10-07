import { type UseDateTimeOptions, useDateTime } from "../hooks/use-date-time";

export function DateTime(props: UseDateTimeOptions & React.JSX.IntrinsicElements["time"]) {
  const { value: _value, format: _format, ...rest } = props;
  const date = useDateTime(props);

  return (
    <time dateTime={date.dateTime} suppressHydrationWarning title={date.full} {...rest}>
      {date.text}
    </time>
  );
}
