
# Multi-stage Dockerfile for Item Service UI
# Gateway route: /itemservice/ui
# ============================================
# Stage 1: Build React/Vite Application
# ============================================
ARG REGISTRY=899991151204.dkr.ecr-fips.us-east-1.amazonaws.com
FROM ${REGISTRY}/amazon_linux23/nodejs20:stable AS build

# Application name (used for working directory only)
ARG APP_NAME=itemservice-ui

# Set working directory
RUN mkdir -p "/home/app/${APP_NAME}"
WORKDIR "/home/app/${APP_NAME}"

# Copy package.json and package-lock.json
COPY ./client/package*.json ./

# Copy all client source files
COPY --chown=app:app ./client/ .

# Build-time variables
ARG GITHUB_SHA
ENV VITE_GITHUB_SHA=$GITHUB_SHA

# Install dependencies with GitHub token (token removed in same layer for security)
ARG GH_PACKAGES_TOKEN
RUN echo "//npm.pkg.github.com/:_authToken=$GH_PACKAGES_TOKEN" > ./.npmrc && \
    npm install --no-save --ignore-scripts && \
    sed -i 's/:_authToken=.*/:_authToken=/' .npmrc

# Use production environment configuration
# This sets VITE_ASSET_BASE=/itemservice/ui/ for correct asset paths
RUN cp ./.env.production .env

# Set Node.js heap size to prevent out of memory errors during build
ENV NODE_OPTIONS=--max-old-space-size=4096

# Build the Vite application
# Output: dist/ directory with index.html and assets/
RUN npm run build

# ============================================
# Stage 2: Production - Serve with NGINX
# ============================================
# Minimal base (no node_modules) so final image does not contain esbuild Go binary (CVE-2025-68121).
FROM ${REGISTRY}/amazon_linux23:stable AS production

ARG APP_NAME=itemservice-ui

USER root


# Install NGINX and setup required directories
# Ensure app user exists (base image may already have it), then install NGINX and Brotli
RUN (getent group app >/dev/null 2>&1 || groupadd -r app) && \
    (getent passwd app >/dev/null 2>&1 || useradd -r -g app app) && \
    mkdir -p "/home/app/${APP_NAME}" /home/app/nginx/run && \
    chown -R app:app /home/app && \
    dnf update -y && \
    dnf install -y nginx && \
    dnf clean all && \
    chown -R app:app /etc/nginx && \
    mkdir -p /var/lib/nginx/logs /run/nginx /var/tmp/nginx && \
    chown -R app:app /var/lib/nginx /run/nginx /var/tmp/nginx /var/log/nginx /home/app/nginx/ && \
    chmod -R 755 /var/lib/nginx /run/nginx /var/tmp/nginx /var/log/nginx /home/app/nginx/ && \
    rm -f /etc/nginx/conf.d/default.conf

WORKDIR "/home/app/${APP_NAME}"

# Copy NGINX configuration and modify for non-root user
COPY ./client/nginx.conf /etc/nginx/nginx.conf
RUN sed -i 's|pid /run/nginx.pid;|pid /home/app/nginx/run/nginx.pid;|' /etc/nginx/nginx.conf && \
    sed -i 's|types_hash_max_size 1024;|types_hash_max_size 2048;|' /etc/nginx/nginx.conf && \
    sed -i 's|types_hash_bucket_size 64;|types_hash_bucket_size 128;|' /etc/nginx/nginx.conf || true

# Copy built application to nginx html directory
# Path must match gateway route: /itemservice/ui
# Files from dist/ will be served at: /usr/share/nginx/html/itemservice/ui/
COPY --from=build --chown=app:app /home/app/$APP_NAME/dist /usr/share/nginx/html/itemservice/ui

# Ensure proper permissions for NGINX directories
RUN touch /home/app/nginx/run/nginx.pid && \
    chown -R app:app /home/app/nginx/run/nginx.pid /usr/share/nginx/html

# Expose port 8080 (NGINX listens on this port)
EXPOSE 8080

# Switch to non-root user for security
USER app

# Simple healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8080/ || exit 1

# Start NGINX in foreground mode
CMD ["nginx", "-g", "daemon off;"]
