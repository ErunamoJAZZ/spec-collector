FROM node:24-alpine AS base

RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

FROM base AS deps
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm build

# Final stage
FROM node:24-alpine AS prod
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
# Install only prod dependencies
RUN pnpm install --prod --frozen-lockfile=false

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist

# Expose web dist via Express
# We need to tell Express to serve the static files in prod
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# The start script in root
CMD ["pnpm", "start"]
