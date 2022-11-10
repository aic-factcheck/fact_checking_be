#!/bin/sh

openssl req -x509 -nodes -newkey rsa:2048 -keyout key.pem -out cert.pem -sha256 -days 365 \
    -subj "/C=GB/ST=London/L=London/O=Alros/OU=IT Department/CN=localhost"

docker build . -t fact_checking_api

docker-compose -f docker-compose.prod.yml up