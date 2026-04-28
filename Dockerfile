FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY root-index.html /usr/share/nginx/html/index.html
RUN mkdir -p /usr/share/nginx/html/pms
COPY --from=builder /app/dist/ /usr/share/nginx/html/pms/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
