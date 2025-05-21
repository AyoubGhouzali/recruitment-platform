FROM node:18.17.1-alpine3.18 AS build
WORKDIR /app
COPY package.json ./
# Use npm ci if package-lock.json exists, otherwise use npm install
RUN if [ -f package-lock.json ]; then \
    npm ci; \
    else npm install; \
    fi
COPY . .
RUN npm run build

FROM nginx:1.25.1-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
