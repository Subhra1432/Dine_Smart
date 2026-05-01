#!/bin/bash
cd apps/customer
npx tsc --noEmit > typecheck.log 2>&1
cat typecheck.log