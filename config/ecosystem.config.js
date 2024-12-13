module.exports = {
    apps: [
      {
        name: 'scraper',
        script: './scripts/initialScrape.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'development',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateDev',
          RDS_HOST: 'businessrate-dev.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'devuser',
          RDS_PASSWORD: 'devpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-dev-bucket',
          PLAYWRIGHT_HEADLESS: 'true',
          TASK_MANAGER_URL: 'http://localhost:3001'
        },
        env_staging: {
          NODE_ENV: 'staging',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateStaging',
          RDS_HOST: 'businessrate-staging.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'staginguser',
          RDS_PASSWORD: 'stagingpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-staging-bucket',
          PLAYWRIGHT_HEADLESS: 'true',
          TASK_MANAGER_URL: 'http://staging-task-manager:3001'
        },
        env_production: {
          NODE_ENV: 'production',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateProd',
          RDS_HOST: 'businessrate-prod.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'produser',
          RDS_PASSWORD: 'prodpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-prod-bucket',
          PLAYWRIGHT_HEADLESS: 'true',
          TASK_MANAGER_URL: 'http://prod-task-manager:3001'
        }
      },
      {
        name: 'api',
        script: './app.js',
        instances: 1,
        exec_mode: 'fork',
        env: {
          NODE_ENV: 'development',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateDev',
          RDS_HOST: 'businessrate-dev.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'devuser',
          RDS_PASSWORD: 'devpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-dev-bucket'
        },
        env_staging: {
          NODE_ENV: 'staging',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateStaging',
          RDS_HOST: 'businessrate-staging.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'staginguser',
          RDS_PASSWORD: 'stagingpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-staging-bucket'
        },
        env_production: {
          NODE_ENV: 'production',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateProd',
          RDS_HOST: 'businessrate-prod.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'produser',
          RDS_PASSWORD: 'prodpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-prod-bucket'
        }
      },
      {
        name: 'task-manager',
        script: './taskManager.js',
        instances: 1,
        exec_mode: 'fork',
        env: {
          NODE_ENV: 'development',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateDev',
          RDS_HOST: 'businessrate-dev.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'devuser',
          RDS_PASSWORD: 'devpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-dev-bucket'
        },
        env_staging: {
          NODE_ENV: 'staging',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateStaging',
          RDS_HOST: 'businessrate-staging.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'staginguser',
          RDS_PASSWORD: 'stagingpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-staging-bucket'
        },
        env_production: {
          NODE_ENV: 'production',
          AWS_REGION: 'us-west-2',
          DYNAMODB_TABLE_NAME: 'BusinessRateProd',
          RDS_HOST: 'businessrate-prod.c1234567890.us-west-2.rds.amazonaws.com',
          RDS_USER: 'produser',
          RDS_PASSWORD: 'prodpassword',
          RDS_DATABASE: 'businessrate',
          S3_BUCKET_NAME: 'businessrate-prod-bucket'
        }
      }
    ]
  };