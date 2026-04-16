FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/

RUN npm install --workspace=@dinesmart/api --workspace=@dinesmart/shared 2>/dev/null || npm install

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/api/ ./packages/api/

# Generate Prisma client for the Linux musl runtime used by this image
RUN npx prisma generate --schema=packages/api/prisma/schema.prisma

# Build
RUN npm run build --workspace=@dinesmart/shared 2>/dev/null || true

# Copy dummy environment variables for HF Spaces
COPY .env.example .env

ENV PORT=7860
EXPOSE 7860

CMD ["npx", "tsx", "packages/api/src/app.ts"]
