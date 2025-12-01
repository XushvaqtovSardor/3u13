FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --prod

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
