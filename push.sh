#!/bin/bash
git init
git remote add origin https://github.com/Subhra1432/Dine_Smart.git
git remote add huggingface https://huggingface.co/spaces/Subhra1432/Dine_Smart.git
DATABASE_URL="postgresql://postgres:Situ8658809082@db.aqxwcmhjelzxruhjreso.supabase.co:5432/postgres?sslmode=require" DIRECT_URL="postgresql://postgres:Situ8658809082@db.aqxwcmhjelzxruhjreso.supabase.co:5432/postgres?sslmode=require" npx prisma db push --schema=packages/api/prisma/schema.prisma --accept-data-loss
git add .
git commit -m "feat: stabilize notification audio with base64 embedding and admin controls"
git push origin main --force
git push huggingface main --force
