#!/bin/bash
docker build -t rastislavkopal/fact_checking_api .
docker push rastislavkopal/fact_checking_api

ssh deploy@$DEPLOY_SERVER << EOF
docker pull rastislavkopal/fact_checking_api
docker stop api-boilerplate || true
docker rm api-boilerplate || true
docker rmi rastislavkopal/fact_checking_api:current || true
docker tag rastislavkopal/fact_checking_api:latest rastislavkopal/fact_checking_api:current
docker run -d --restart always --name api-boilerplate -p 3000:3000 rastislavkopal/fact_checking_api:current
EOF
