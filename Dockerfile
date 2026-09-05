FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test && npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5173 FAMILY_DATA_DIR=/app/.family-data
WORKDIR /app
COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/.family-data /app/.runtime && chown -R node:node /app/.family-data /app/.runtime
USER node
EXPOSE 5173
CMD ["node", "server/index.mjs"]
