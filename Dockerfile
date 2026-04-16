FROM node:22-slim AS build

WORKDIR /app

# Native deps for modules like argon2/bcrypt
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate \
  && pnpm install --frozen-lockfile

COPY tsconfig.json tsup.config.ts prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# prisma generate needs DATABASE_URL (doesn't connect; it only resolves config)
ARG DATABASE_URL=postgresql://localhost:5432/db
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm exec prisma generate \
  && pnpm run build \
  && pnpm prune --prod


FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV APPS=server

WORKDIR /app


RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 10001 nodeapp

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

RUN chown -R nodeapp:nodeapp /app

EXPOSE 8853

USER nodeapp

CMD ["npm", "run", "start:prod"]
