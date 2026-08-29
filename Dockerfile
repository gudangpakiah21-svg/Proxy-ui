FROM ghcr.io/sagernet/sing-box:latest

# Install nginx untuk Web UI
RUN apk add --no-cache nginx

COPY config.json /etc/sing-box/config.json
COPY index.html /var/www/html/index.html
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 8081

ENTRYPOINT ["/entrypoint.sh"]
