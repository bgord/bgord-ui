# bgord-ui

## Configuration:

Clone the repository

```
git clone git@github.com:bgord/bgord-ui.git --recurse-submodules
```

Install packages

```
bun i
```

Run the tests

```
./bgord-scripts/test.sh
```

## Files:

```
src/
├── components
│   ├── date-time.tsx
│   ├── dialog.tsx
│   └── menu.tsx
├── hooks
│   ├── use-click-outside.ts
│   ├── use-date-field.ts
│   ├── use-date-format.ts
│   ├── use-date-time.ts
│   ├── use-exit-action.ts
│   ├── use-file.ts
│   ├── use-focus-shortcut.ts
│   ├── use-hover.ts
│   ├── use-hydrated.ts
│   ├── use-meta-enter-submit.ts
│   ├── use-mutation.ts
│   ├── use-number-field.ts
│   ├── use-online-status.ts
│   ├── use-persisted-toggle.ts
│   ├── use-scroll-lock.ts
│   ├── use-shortcuts.ts
│   ├── use-swipe-dismiss.ts
│   ├── use-text-field.ts
│   ├── use-time-zone.ts
│   ├── use-toggle.ts
│   └── use-window-dimensions.ts
└── services
    ├── api-client.ts
    ├── asset-version.ts
    ├── autocomplete.ts
    ├── calendar-day.ts
    ├── clipboard.ts
    ├── clock.ts
    ├── cookies.ts
    ├── date-field.ts
    ├── date-format.ts
    ├── etag.ts
    ├── exec.ts
    ├── fields.ts
    ├── form.ts
    ├── get-safe-window.ts
    ├── head.ts
    ├── noop.ts
    ├── notifications.tsx
    ├── number-field.ts
    ├── pluralize.ts
    ├── rhythm.ts
    ├── text-field.ts
    ├── time-zone-offset.ts
    ├── time-zone.ts
    ├── translations.tsx
    └── weak-etag.ts
```

