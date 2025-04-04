#!/bin/bash
sudo yum install -y docker
sudo systemctl start docker
sudo docker run -d \
  -p 80:80 \
  -e VITE_API_URL=${api_gateway_url} \
  ${docker_image}