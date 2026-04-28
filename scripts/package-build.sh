#!/usr/bin/env bash

source bgord-scripts/base.sh
setup_base_config

OUTPUT_DIRECTORY="dist"

step_start "Directory clear"
rm -rf tsconfig.tsbuildinfo
rm -rf "$OUTPUT_DIRECTORY"
step_end "Directory clear"

step_start "Package build"
bunx tsgo
step_end "Package build"

step_start "jsxDEV guard"
if grep -R --include='*.js' -n 'jsxDEV' "$OUTPUT_DIRECTORY" >/dev/null; then
  echo "❌ Found jsxDEV in build output"
  exit 1
fi
step_end "jsxDEV guard"
