const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const awsConfig = require('../config/aws-config');

async function uploadToS3(bucketName, key, data) {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
    };

    try {
        await s3.putObject(params).promise();
        console.log(`Successfully uploaded data to ${bucketName}/${key}`);
    } catch (error) {
        console.error(`Error uploading data to ${bucketName}/${key}`, error);
        throw error;
    }
}

async function uploadLargeFileToS3(bucketName, key, filePath) {
    const fs = require('fs');
    const readStream = fs.createReadStream(filePath);
    
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: readStream,
        ContentType: 'application/json'
    };

    try {
        await s3.upload(params).promise();
        console.log(`Successfully uploaded large file to ${bucketName}/${key}`);
    } catch (error) {
        console.error(`Error uploading large file to ${bucketName}/${key}`, error);
        throw error;
    }
}

module.exports = {
    uploadToS3,
    uploadLargeFileToS3
};