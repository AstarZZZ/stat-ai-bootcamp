FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts ./scripts
COPY schema.sql ./schema.sql
RUN mkdir -p uploads

EXPOSE 3100

CMD ["npm", "run", "start"]
