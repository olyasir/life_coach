FROM node:20-slim AS build
WORKDIR /app
COPY package.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm install --prefix backend && npm install --prefix frontend
COPY backend ./backend
COPY frontend ./frontend
RUN npm run build --prefix frontend
RUN npm run build --prefix backend

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/backend/package.json /app/backend/package-lock.json ./backend/
RUN npm install --omit=dev --prefix backend
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./frontend/dist
ENV NODE_ENV=production
ENV DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 3001
CMD ["node", "backend/dist/server.js"]
