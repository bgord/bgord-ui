# bgord-ui

## Configuration:

Clone the repository

```
git clone git@github.com:bgord/journal.git --recurse-submodules
```

Install packages

```
bun i
```

Run the tests

```
./bgord-scripts/test-run.sh
```

## Files:

```
src/
├── components
│   ├── dialog.tsx
├── hooks
│   ├── use-click-outside.ts
│   ├── use-date-field.ts
│   ├── use-exit-action.ts
│   ├── use-file.ts
│   ├── use-focus-shortcut.ts
│   ├── use-hover.ts
│   ├── use-meta-enter-submit.ts
│   ├── use-mutation.ts
│   ├── use-number-field.ts
│   ├── use-scroll-lock.ts
│   ├── use-shortcuts.ts
│   ├── use-text-field.ts
│   └── use-toggle.ts
└── services
    ├── autocomplete.ts
    ├── clipboard.ts
    ├── cookies.ts
    ├── date-field.ts
    ├── etag.ts
    ├── exec.ts
    ├── fields.ts
    ├── form.ts
    ├── get-safe-window.ts
    ├── head.ts
    ├── noop.ts
    ├── number-field.ts
    ├── pluralize.ts
    ├── rhythm.ts
    ├── text-field.ts
    ├── time-zone-offset.ts
    ├── translations.tsx
    └── weak-etag.ts
```

