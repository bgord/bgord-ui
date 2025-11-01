#!/usr/bin/env bash

source bgord-scripts/base.sh
setup_base_config

OUTPUT_DIRECTORY="dist"

step_start "Directory clear"
rm -rf $OUTPUT_DIRECTORY
step_end "Directory clear"

step_start "Package build"
NODE_ENV=production bun build src/index.ts \
   --minify \
   --format esm \
   --target browser \
   --outdir dist \
   --packages external \
   --define process.env.NODE_ENV="production" \
   --external react \
   --external react-dom \
   --external react/jsx-runtime \
   --external react/jsx-dev-runtime
step_end "Package build"

step_start "Types build"
bunx tsc --emitDeclarationOnly
step_end "Types build"
