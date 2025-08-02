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
│   ├── button.tsx
│   ├── dialog.tsx
├── hooks
│   ├── use-click-outside.ts
│   ├── use-client-filter.ts
│   ├── use-exit-action.ts
│   ├── use-field.ts
│   ├── use-focus-shortcut.ts
│   ├── use-hover.ts
│   ├── use-language-selector.tsx
│   ├── use-meta-enter-submit.tsx
│   ├── use-scroll-lock.ts
│   ├── use-shortcuts.ts
│   └── use-toggle.ts
└── services
    ├── auth-guard.ts
    ├── cookies.ts
    ├── copy-to-clipboard.ts
    ├── credentials.ts
    ├── etag.ts
    ├── exec.ts
    ├── field.ts
    ├── fields.ts
    ├── form.ts
    ├── get-safe-window.ts
    ├── noop.ts
    ├── pluralize.ts
    ├── rhythm.ts
    ├── translations.tsx
    └── weak-etag.ts
```

