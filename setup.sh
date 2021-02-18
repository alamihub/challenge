#!/bin/bash
IpPrinc=`curl ifconfig.co`
Port=5500
timedatectl set-timezone Africa/Casablanca
dnf install -y zip
dnf install -y unzip
dnf module enable -y nodejs:12
dnf install -y nodejs
dnf install -y nginx
systemctl enable nginx
systemctl start nginx
dnf install -y firewalld
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --add-forward-port=port=80:proto=tcp:toport=$Port --permanent
firewall-cmd --reload
echo "
upstream app {
    server $IpPrinc:$Port;
    keepalive 64;
}

server {
    listen 80;
    server_name $IpPrinc;
   
    location / {
    	proxy_set_header X-Forwarded-For \$remote_addr;
    	proxy_set_header Host \$http_host;
        
    	proxy_http_version 1.1;
    	proxy_set_header Upgrade \$http_upgrade;
    	proxy_set_header Connection "upgrade";
        
    	proxy_pass http://app;
    	proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
" > /etc/nginx/conf.d/app.conf
systemctl restart nginx
npm install pm2@latest -g
cd /usr/app/
npm install
echo "
module.exports = {
  apps : [{
    name: "\app\",
    script: '/usr/app/server.js',
    watch: false,
    env: {
      NODE_ENV: \"production\",
      PORT: $Port
    }
  }],
}
" > /usr/app/ecosystem.config.js
pm2 start ecosystem.config.js
pm2 startup
sleep 3s
pm2 save

# service_exists() {
#     local n=$1
#     if [[ $(systemctl list-units --all -t service --full --no-legend "$n.service" | cut -f1 -d' ') == $n.service ]]; then
#         return 0
#     else
#         return 1
#     fi
# }
