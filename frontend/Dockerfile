# ============================================================
# Dockerfile — Frontend (Nginx)
# Team Vate | Smart Habit Streak Tracker
# ============================================================

FROM nginx:1.25-alpine

LABEL maintainer="Team Vate <teju.p@student.msrit.edu>"
LABEL project="smart-habit-tracker"
LABEL component="frontend"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy frontend files
COPY . /usr/share/nginx/html/

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
