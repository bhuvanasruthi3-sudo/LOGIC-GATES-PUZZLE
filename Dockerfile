FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
# Use npm install instead of `npm ci` because this repo doesn't include
# a lockfile in the build context. `npm install` handles missing lockfile
# and avoids the CI error seen during docker build.
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:1.25-alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Use a custom nginx config to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
