#!/bin/sh

# Jalankan Sing-box di background
sing-box run -c /etc/sing-box/config.json &

# Jalankan Nginx di foreground
nginx -g "daemon off;"
