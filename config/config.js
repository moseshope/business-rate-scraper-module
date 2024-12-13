export const config = {
    aws: {
        region: process.env.AWS_REGION,
        dynamoDB: {
            tableName: process.env.DYNAMODB_TABLE_NAME
        },
        s3: {
            bucketName: process.env.S3_BUCKET_NAME
        },
        cloudWatch: {
            logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME
        }
    },
    playwright: {
        launchOptions: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        navigationTimeout: 0
    }
};