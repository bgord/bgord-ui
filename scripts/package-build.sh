#!/usr/bin/env bash

# Preload base bash configuration and functions
source bgord-scripts/base.sh
setup_base_config

OUTPUT_DIRECTORY="dist"

info "Clearing output directory..."
rm -rf $OUTPUT_DIRECTORY
success "Output directory cleared"

info "Building package..."
NODE_ENV=production bun build src/index.ts \
  --minify \
  --format esm \
  --outdir dist \
  --packages external \
  --external react \
  --external react-dom \
  --external react/jsx-runtime \
  --external react-router
info "Building types..."
bunx tsc --emitDeclarationOnly
success "Package built correctly!"
