FROM node:20-slim

WORKDIR /app

# Install Redis and openssl
RUN apt-get update && apt-get install -y redis-server openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/

RUN npm install --workspace=@dinesmart/api --workspace=@dinesmart/shared 2>/dev/null || npm install

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/api/ ./packages/api/

# Generate Prisma client
RUN npx prisma generate --schema=packages/api/prisma/schema.prisma

# Build
RUN npm run build --workspace=@dinesmart/shared 2>/dev/null || true

# Copy dummy environment variables for HF Spaces
COPY .env.example .env

ENV PORT=7860
EXPOSE 7860

# Create a startup script that runs Redis and the app
RUN echo '#!/bin/sh\n\
redis-server --daemonize yes\n\
npx tsx packages/api/src/app.ts\n\
' > start.sh && chmod +x start.sh

CMD ["./start.sh"]
