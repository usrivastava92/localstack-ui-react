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