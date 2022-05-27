export const awsRegions = [
  'af-south-1',
  'ap-east-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-southeast-3',
  'ca-central-1',
  'eu-central-1',
  'eu-north-1',
  'eu-south-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'me-south-1',
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2'
] as const;

export type AWSRegionType = typeof awsRegions[number];

export interface AWSProfile {
  displayName: string;
  accessKey: string;
  secretKey: string;
  region: AWSRegionType;
  isDefault: boolean;
  sessionToken?: string;
  endpoint?: string;
}

export interface ReadonlyAWSProfile extends AWSProfile {
  readonly displayName: string;
  readonly accessKey: string;
  readonly secretKey: string;
  readonly region: AWSRegionType;
  readonly isDefault: boolean;
  readonly sessionToken?: string;
  readonly endpoint?: string;
}

export const nullAwsProfile: ReadonlyAWSProfile = {
  displayName: 'No Profile Selected',
  accessKey: '',
  secretKey: '',
  region: 'ap-southeast-1',
  isDefault: false
};
