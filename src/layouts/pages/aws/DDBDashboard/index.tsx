import {useState} from "react";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import AwsDashboardLayout from "../AwsDashboardLayout";

function DDBDashboard(): JSX.Element {

  const client = new DynamoDB({
    region: "ap-south-1",
    credentials: {
      accessKeyId: "local-access-key-id",
      secretAccessKey: "local-secret-access-key"
    }
  });

  const [tables, setTables] = useState([]);

  client.listTables({Limit: 10})
    .then(output => setTables(output?.TableNames))
    .catch(error => console.log(error));

  return (
    <AwsDashboardLayout>
      {tables.map(name => <div key={name}>{name}</div>)}
    </AwsDashboardLayout>
  );
}

export default DDBDashboard;
