import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { DateTime } from "../src/components/date-time";
import { TimeZoneContext } from "../src/hooks/use-time-zone";
import { TranslationsContext } from "../src/services/translations";

const value = { translations: {}, language: "en", supportedLanguages: { en: "en" } };

afterEach(() => {
  cleanup();
  setSystemTime();
});

describe("DateTime", () => {
  test("dayLabel", () => {
    setSystemTime(1791374400000);

    render(
      <TranslationsContext.Provider value={value}>
        <DateTime format="dayLabel" value="2026-10-08" />
      </TranslationsContext.Provider>,
    );

    expect(screen.getByText("Tomorrow")).toHaveAttribute("datetime", "2026-10-08");
    expect(screen.getByText("Tomorrow")).toHaveAttribute("title", "Oct 8, 2026");
  });

  test("freshness", () => {
    setSystemTime(1791374400000);

    render(
      <TranslationsContext.Provider value={value}>
        <DateTime format="freshness" value="2026-10-04" />
      </TranslationsContext.Provider>,
    );

    expect(screen.getByText("3 days ago")).toHaveAttribute("title", "Oct 4, 2026");
  });

  test("relativeDay", () => {
    setSystemTime(1791374400000);

    render(
      <TranslationsContext.Provider value={value}>
        <DateTime format="relativeDay" value="2026-10-10" />
      </TranslationsContext.Provider>,
    );

    expect(screen.getByText("In 3 days")).toHaveAttribute("title", "Oct 10, 2026");
  });

  test("list", () => {
    setSystemTime(1791374400000);

    render(
      <TranslationsContext.Provider value={value}>
        <DateTime format="list" value="2025-10-07" />
      </TranslationsContext.Provider>,
    );

    expect(screen.getByText("Tue, Oct 7, 2025")).toBeInTheDocument();
  });

  test("short", () => {
    setSystemTime(1791374400000);

    render(
      <TranslationsContext.Provider value={value}>
        <DateTime format="short" value="2026-09-12" />
      </TranslationsContext.Provider>,
    );

    expect(screen.getByText("Sep 12")).toBeInTheDocument();
  });

  test("ago", () => {
    setSystemTime(1791374400000);

    render(
      <TranslationsContext.Provider value={value}>
        <DateTime format="ago" value={1791367200000} />
      </TranslationsContext.Provider>,
    );

    expect(screen.getByText("2 hours ago")).toHaveAttribute("datetime", "2026-10-07T10:00:00.000Z");
    expect(screen.getByText("2 hours ago")).toHaveAttribute("title", "Oct 7, 2026 at 10:00 AM");
  });

  test("props", () => {
    setSystemTime(1791374400000);

    render(
      <TranslationsContext.Provider value={value}>
        <DateTime data-color="neutral-600" format="short" value="2026-09-12" />
      </TranslationsContext.Provider>,
    );

    expect(screen.getByText("Sep 12")).toHaveAttribute("data-color", "neutral-600");
  });

  test("server", () => {
    setSystemTime(1791374400000);

    const html = renderToString(
      <TranslationsContext.Provider value={value}>
        <DateTime format="dayLabel" value="2026-10-08" />
      </TranslationsContext.Provider>,
    );

    expect(html).toEqual('<time dateTime="2026-10-08" title="Oct 8, 2026">Tomorrow</time>');
  });

  test("server - ago", () => {
    setSystemTime(1791374400000);

    const html = renderToString(
      <TranslationsContext.Provider value={value}>
        <DateTime format="ago" value={1791367200000} />
      </TranslationsContext.Provider>,
    );

    expect(html).toEqual(
      '<time dateTime="2026-10-07T10:00:00.000Z" title="Oct 7, 2026 at 10:00 AM">2 hours ago</time>',
    );
  });

  test("server matches client", () => {
    setSystemTime(1791374400000);
    const html = renderToString(
      <TranslationsContext.Provider value={value}>
        <TimeZoneContext.Provider value="Europe/Warsaw">
          <DateTime format="ago" value={1791367200000} />
        </TimeZoneContext.Provider>
      </TranslationsContext.Provider>,
    );

    const { container } = render(
      <TranslationsContext.Provider value={value}>
        <TimeZoneContext.Provider value="Europe/Warsaw">
          <DateTime format="ago" value={1791367200000} />
        </TimeZoneContext.Provider>
      </TranslationsContext.Provider>,
    );

    expect(container.innerHTML).toEqual(html.replace("dateTime=", "datetime="));
  });
});
