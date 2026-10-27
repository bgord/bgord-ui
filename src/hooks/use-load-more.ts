import { useEffect, useRef, useState } from "react";

export enum LoadMoreState {
  idle = "idle",
  loading = "loading",
  error = "error",
}

export type LoadMorePageType<Entry, Cursor> = { entries: ReadonlyArray<Entry>; next: Cursor | null };

type UseLoadMoreOptions<Entry, Cursor> = {
  key: unknown;
  first?: LoadMorePageType<Entry, Cursor>;
  load: (cursor: Cursor | undefined) => Promise<LoadMorePageType<Entry, Cursor> | null>;
};

export type UseLoadMoreReturnType<Entry, Cursor> = {
  entries: ReadonlyArray<Entry>;
  next: Cursor | null;
  state: LoadMoreState;
  more: () => Promise<void>;
};

type LoadMoreList<Entry, Cursor> = {
  hash: string;
  first: LoadMorePageType<Entry, Cursor> | undefined;
  pages: ReadonlyArray<LoadMorePageType<Entry, Cursor>>;
  state: LoadMoreState;
};

const initial = <Entry, Cursor>(
  hash: string,
  first: LoadMorePageType<Entry, Cursor> | undefined,
): LoadMoreList<Entry, Cursor> => ({ hash, first, pages: first ? [first] : [], state: LoadMoreState.idle });

export function useLoadMore<Entry, Cursor>(
  options: UseLoadMoreOptions<Entry, Cursor>,
): UseLoadMoreReturnType<Entry, Cursor> {
  const hash = JSON.stringify(options.key);
  const [list, setList] = useState(() => initial(hash, options.first));
  const pending = useRef(false);
  const token = useRef(0);

  if (list.hash !== hash) setList(initial(hash, options.first));

  const start = (state: LoadMoreList<Entry, Cursor>) => {
    pending.current = true;
    setList({ ...state, state: LoadMoreState.loading });

    return ++token.current;
  };

  const settle = (
    started: number,
    update: (current: LoadMoreList<Entry, Cursor>) => LoadMoreList<Entry, Cursor>,
  ) => {
    if (started !== token.current) return;

    pending.current = false;
    setList((current) => (current.hash === hash ? update(current) : current));
  };

  useEffect(() => {
    if (list.hash !== hash || list.first === options.first || !options.first) return;

    const first = options.first;
    const count = list.pages.length;
    const started = start({ ...list, first });

    void (async () => {
      try {
        const pages = [first];
        let cursor = first.next;

        while (pages.length < count && cursor !== null) {
          const page = await options.load(cursor);
          if (!page) throw new Error("useLoadMore refresh failed");

          pages.push(page);
          cursor = page.next;
        }

        settle(started, (current) => ({ ...current, pages, state: LoadMoreState.idle }));
      } catch {
        settle(started, (current) => ({ ...current, state: LoadMoreState.error }));
      }
    })();
  }, [options.first, hash]);

  const last = list.pages.at(-1);
  const next = last ? last.next : null;

  const more = async () => {
    if (pending.current || (last && last.next === null)) return;

    const started = start(list);

    try {
      const page = await options.load(last?.next ?? undefined);
      if (!page) throw new Error("useLoadMore load failed");

      settle(started, (current) => ({
        ...current,
        pages: [...current.pages, page],
        state: LoadMoreState.idle,
      }));
    } catch {
      settle(started, (current) => ({ ...current, state: LoadMoreState.error }));
    }
  };

  return { entries: list.pages.flatMap((page) => page.entries), next, state: list.state, more };
}
