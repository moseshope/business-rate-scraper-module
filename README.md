# Business Rate Scraper Module

A Node.js-based web scraping module designed to collect and analyze business data from Google Maps. This module runs as a containerized service on AWS ECS and stores data in DynamoDB.

## Features

- Automated Google Maps business data scraping
- DynamoDB integration for data storage
- S3 integration for raw data storage
- Business rating and review analysis
- Containerized deployment support
- AWS ECS integration

## Prerequisites

- Node.js 18 or higher
- Docker
- AWS Account with:
  - DynamoDB access
  - S3 access
  - ECS configured
  - ECR repository

## Installation

1. Clone the repository:

```bash
git https://github.com/moseshope/business-rate-scraper-module.git
cd business-rate-scraper-module
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env`:

```env
REAL_ACCESS_KEY_ID=your_aws_access_key
REAL_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-west-1

# DynamoDB Table Names
DYNAMODB_BUSINESS_TABLE=Business
DYNAMODB_REVIEW_TABLE=Review
DYNAMODB_ESTIMATE_TABLE=Estimate

# S3 Configuration
S3_BUCKET_NAME=scraped-data-bucket-1
```

## DynamoDB Table Structure

### Estimate Table

- Primary Key: `id`
- Attributes:
  - category
  - city
  - state
  - pending
  - count

### Business Table

- Primary Key: `id`
- Attributes:
  - query_id
  - place_info (JSON)
  - score_data (JSON)
  - bcode
  - timestamp

### Review Table

- Primary Key: `id`
- Attributes:
  - business_id
  - author_info
  - review_data
  - timestamp

## Docker Deployment

1. Build the Docker image:

```bash
docker build -t business-rate-scraper-module .
```

2. Tag the image for ECR:

```bash
docker tag business-rate-scraper-module:latest [your-account-id].dkr.ecr.[region].amazonaws.com/business-rate-scraper-module:latest
```

3. Push to ECR:

```bash
aws ecr get-login-password --region [region] | docker login --username AWS --password-stdin [your-account-id].dkr.ecr.[region].amazonaws.com
docker push [your-account-id].dkr.ecr.[region].amazonaws.com/business-rate-scraper-module:latest
```

## Usage

The module expects an array of Estimate table IDs through the `QUERY_DATA` environment variable when running in ECS:

```json
["estimate_id_1", "estimate_id_2", "estimate_id_3"]
```

The module will:

1. Fetch estimate details from DynamoDB
2. Scrape corresponding business data
3. Store results in DynamoDB and S3
4. Calculate business scores and rankings

## AWS ECS Configuration

The ECS task definition should include:

- Task memory: 3072MB
- Task CPU: 1024
- Network mode: awsvpc
- Required environment variables:
  - QUERY_DATA
  - AWS credentials
  - Table names

## Error Handling

The module includes comprehensive error handling:

- Retries for failed scraping attempts
- DynamoDB operation retries
- Logging of all operations
- Graceful failure handling for individual queries

## Monitoring

Monitor the scraping process through:

- CloudWatch Logs
- DynamoDB metrics
- ECS task metrics

## License

BR License

## Author

blackpam1021@gmail.com
