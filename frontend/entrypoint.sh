#!/bin/sh
set -e  # Exit immediately if any command fails
export VITE_API_URL="${VITE_API_URL:-https://default-api.example.com}"  # Fallback
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" {} \;
exec nginx -g 'daemon off;'