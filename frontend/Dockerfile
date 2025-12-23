FROM caddy:2-alpine

WORKDIR /srv
COPY . /srv

# Caddyfile pour servir les fichiers + proxy /api
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
