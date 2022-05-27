import { AWSProfile } from "../types/awsTypes";
import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

export function getClientConfig(awsProfile: AWSProfile): DynamoDBClientConfig {
  return {
    region: awsProfile.region,
    credentials: {
      accessKeyId: awsProfile.accessKey,
      secretAccessKey: awsProfile.secretKey,
      sessionToken: (awsProfile.sessionToken && awsProfile.sessionToken !== "") ? awsProfile.sessionToken : undefined
    },
    endpoint: (awsProfile.endpoint && awsProfile.endpoint !== "") ? awsProfile.endpoint : undefined
  };
}

export function getQueueNameFromUrl(queueUrl: string): string {
  if (!queueUrl) {
    return "";
  }
  const startIndex = queueUrl.lastIndexOf("/");
  return queueUrl.substring(startIndex + 1);
}

export function getQueueNameFromArn(queueArn: string): string {
  if (!queueArn) {
    return "";
  }
  const startIndex = queueArn.lastIndexOf(":");
  return queueArn.substring(startIndex + 1);
}