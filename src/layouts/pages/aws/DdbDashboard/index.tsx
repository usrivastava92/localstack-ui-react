import { useContext, useState } from "react";
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import AwsDashboardLayout from "../AwsDashboardLayout";
import { AWSProfile, nullAwsProfile } from "../types/awsTypes";
import AWSProfileContext from "../context";


function getClientConfig(awsProfile: AWSProfile): DynamoDBClientConfig {
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

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new DynamoDB(getClientConfig(awsProfile));

  const [tables, setTables] = useState([]);

  if (awsProfile !== nullAwsProfile) {
    client.listTables({ Limit: 10 })
      .then(output => setTables(output?.TableNames))
      .catch(error => console.log(error));
  }

  return (
    <>
      {tables.map(name => <div key={name}>{name}</div>)}
    </>
  );
}

function DdbDashboard(): JSX.Element {
  return (
    <AwsDashboardLayout>
      <Content />
    </AwsDashboardLayout>
  );
}

export default DdbDashboard;
