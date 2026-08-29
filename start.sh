#!/bin/bash

# Unduh Xray binary jika belum ada
if [ ! -f "./xray" ]; then
  echo "Downloading Xray-core..."
  curl -L -H "User-Agent: Mozilla/5.0" -o xray.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip
  unzip -o xray.zip xray
  chmod +x xray
  rm xray.zip
fi

# Buat config.json minimal untuk Xray
cat <<EOF > config.json
{
  "log": { "loglevel": "warning" },
  "inbounds": [
    {
      "port": 8081,
      "protocol": "vless",
      "settings": {
        "clients": [
          { "id": "00000000-0000-0000-0000-000000000000", "level": 0 }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": { "path": "/vless" }
      }
    }
  ],
  "outbounds": [{ "protocol": "freedom" }]
}
EOF

# Jalankan Xray di background
./xray run -c config.json &

# Jalankan Web UI Node.js
node index.js
