FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

RUN mkdir -p /app/shared
VOLUME ["/app/shared"]

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"] 