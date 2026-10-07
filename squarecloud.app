DISPLAY_NAME=Tournament X Frontend
MEMORY=2048
VERSION=recommended
AUTORESTART=true
MAIN=server.js
START=node --max-old-space-size=1536 node_modules/.bin/next build && npx next start -p 80
SUBDOMAIN=tournamentx
