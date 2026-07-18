FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN npm install --workspaces --include-workspace-root
COPY . .
WORKDIR /app/backend
RUN npm run build
CMD ["node", "dist/server.js"]

