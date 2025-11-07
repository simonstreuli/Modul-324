# AWS Deployment

This directory contains the AWS deployment configuration for the ticketsystem application.

## Infrastructure

The workflow creates the following AWS resources (if they don't already exist):

- VPC with CIDR 10.0.0.0/16
- Two subnets in different availability zones (us-east-1a and us-east-1b)
- Internet Gateway
- Security Group with the following rules:
  - SSH (22): Open to 0.0.0.0/0 (Note: For production, restrict to specific IPs)
  - HTTP (80): Open to 0.0.0.0/0 (for load balancer)
  - Application port (6001): Restricted to VPC CIDR (10.0.0.0/16)
- Two t2.micro EC2 instances running Ubuntu 22.04
- Application Load Balancer with health checks
- Target Group routing to both instances

## Deployment Process

The deployment workflow is triggered automatically after the CI/CD Pipeline completes successfully on the main or develop branches. It can also be triggered manually.

1. The CI/CD Pipeline must complete successfully (lint, test, build Docker image)
2. The deployment workflow checks and creates infrastructure if needed
3. Instances are launched with Docker pre-installed via cloud-init
4. The workflow deploys to Instance 1 first
5. Any existing Docker container is stopped and removed before deploying the new one
6. Health check is performed on Instance 1
7. If Instance 1 is healthy, deployment proceeds to Instance 2
8. Any existing Docker container is stopped and removed before deploying the new one
9. Health check is performed on Instance 2
10. Load balancer routes traffic to both healthy instances

**Note**: The deployment workflow will not run if the CI/CD Pipeline fails, ensuring only tested and built images are deployed.

## Health Check

The application exposes a `/health` endpoint that returns:
```json
{"status": "OK"}
```

This endpoint is used by both:
- The deployment workflow to verify successful deployment
- The AWS Application Load Balancer for instance health monitoring

## Manual Deployment

To manually trigger deployment:
1. Go to Actions tab in GitHub
2. Select "AWS Deployment" workflow
3. Click "Run workflow"

## Accessing the Application

After deployment, the application is accessible via:
- Load Balancer DNS (shown in workflow output)
- Individual instance IPs (shown in workflow output)

Example: `http://<load-balancer-dns>/api-docs`

## What does CD-Pipeline do?

The AWS Deployment Pipeline automates the deployment of the ticketsystem application to AWS. It is triggered either manually or after a successful CI/CD pipeline run on the main branch. The workflow:
- Sets up AWS infrastructure (VPC, subnets, internet gateway, security group, EC2 instances, load balancer)
- Deploys the Docker container to EC2 instances
- Performs health checks and outputs access information
- Ensures only tested and built images are deployed

**Note:** The database is hosted externally on MongoDB Atlas and is not deployed on AWS.

## Required GitHub Secrets and Variables

The following secrets and variables must be configured in GitHub:

### Secrets
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_SESSION_TOKEN`: AWS session token (if required)
- `DEPLOY_PRIVATE_KEY`: SSH private key for EC2 access (content of deploy.pem)
- `GITHUB_TOKEN`: Token for GitHub Container Registry access
- `MONGO_URI`: Connection URI for the external MongoDB Atlas database

### Variables
- `PORT`: Application port (e.g., 6001)
- `HOST_URL`: Application host URL
- `NODE_ENV`: Node.js environment (e.g., production)

## Rollout and Rollback Strategy

- **Rollout:** The new version is deployed to Instance 1 and checked for health. If healthy, Instance 2 is updated. The load balancer only routes traffic to healthy instances.
- **Rollback:** Automated rollback is not directly implemented. If a deployment fails (health check not OK), the previous instance remains available, as the load balancer only includes healthy targets. Manual rollback can be performed by redeploying the previous version.

## Database

- The MongoDB database is **externally hosted on MongoDB Atlas**. EC2 instances connect using the `MONGO_URI` secret.

## Summary

The deployment pipeline ensures:
- Infrastructure is only created if it does not exist (idempotent)
- Only tested and built images are deployed
- Health checks are performed before traffic is routed
- Access information (IPs, DNS) is output after deployment

For production, security group rules (especially SSH) should be restricted to trusted IPs.
