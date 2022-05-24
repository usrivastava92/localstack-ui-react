import  { SQSClient } from "@aws-sdk/client-sqs";

// Set the AWS Region.
const REGION = "ap-south-1"; //e.g. "us-east-1"
const ACCESS_KEY_ID = "local-access-key-id";
const SECRET_ACCESS_KEY = "local-secret-access-key";

const creds = {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
};


// Create SQS service object.
const sqsClient = new SQSClient({ region: REGION,
                                  credentials: creds,
                                  endpoint: "http://localhost:4566"
                                });
export  { sqsClient };