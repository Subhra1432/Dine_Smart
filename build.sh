#!/bin/bash
cd "apps/customer"
npm run build > build.log 2>&1
cat build.log
