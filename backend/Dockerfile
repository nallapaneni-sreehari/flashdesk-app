# Stage 1: Build (generate Prisma client)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci
RUN npx prisma generate

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src/generated ./src/generated
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY src ./src/

EXPOSE 3000
CMD ["node", "src/app.js"]
