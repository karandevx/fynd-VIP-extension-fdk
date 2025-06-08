#!/bin/bash

# Build Docker image for server deployment
echo "Building Docker image..."
docker build -t fynd-extension . --platform linux/amd64

# Login to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region eu-north-1 --profile devx-new | docker login --username AWS --password-stdin 505511693276.dkr.ecr.eu-north-1.amazonaws.com/fynd-extension

# Tag image
echo "Tagging image..."
docker tag fynd-extension:latest 505511693276.dkr.ecr.eu-north-1.amazonaws.com/fynd-extension:latest

# Push image to ECR
echo "Pushing image to ECR..."
docker push 505511693276.dkr.ecr.eu-north-1.amazonaws.com/fynd-extension:latest

echo "Server deployment complete!"