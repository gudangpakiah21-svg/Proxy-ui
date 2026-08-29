FROM ghcr.io/sagernet/sing-box:latest

# Install nginx untuk Web UI
RUN apk add --no-cache nginx

COPY config.json /etc/sing-box/config.json
COPY index.html /var/www/html/index.html
COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 8081

CMD sing-box run -c /etc/sing-box/config.json & nginx -g "daemon off;"
