import {useContext, useEffect, useState} from "react";

import {
  GetQueueAttributesCommand,
  GetQueueAttributesCommandOutput,
  ListQueuesCommand,
  SQSClient
} from "@aws-sdk/client-sqs";
import AwsDashboardLayout from "../AwsDashboardLayout";
import {Card} from "@mui/material";
import {AWSProfile, nullAwsProfile} from "../types/awsTypes";
import {AWSProfileContext} from "../../../../context";
import {getClientConfig} from "../utils/awsUtils";
import DefaultCell from "../../../ecommerce/orders/order-list/components/DefaultCell";
import DataTable from "../../../../examples/Tables/DataTable";
import {ColumnDefinition, TableData} from "../types/tableTypes";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

const sqsColumnDefinitions: ColumnDefinition[] = [
  {accessor: "name", Header: "Queue Name", Cell: ({value}) => <DefaultCell value={value}/>},
  {
    accessor: "ApproximateNumberOfMessages",
    Header: "Total Messages",
    Cell: ({value}) => <DefaultCell value={value}/>
  },
  {
    accessor: "ApproximateNumberOfMessagesDelayed",
    Header: "ApproximateNumberOfMessagesDelayed",
    Cell: ({value}) => <DefaultCell value={value}/>
  },
  {
    accessor: "ApproximateNumberOfMessagesNotVisible",
    Header: "ApproximateNumberOfMessagesNotVisible",
    Cell: ({value}) => <DefaultCell value={value}/>
  },
  {accessor: "RedrivePolicy", Header: "RedrivePolicy", Cell: ({value}) => <DefaultCell value={value}/>},
  {accessor: "VisibilityTimeout", Header: "VisibilityTimeout", Cell: ({value}) => <DefaultCell value={value}/>}
]

const attributesToFetch = [
  'ApproximateNumberOfMessages',
  'ApproximateNumberOfMessagesDelayed',
  'ApproximateNumberOfMessagesNotVisible',
  'RedrivePolicy',
  'VisibilityTimeout'
];

function getQueueName(queueUrl: string): string {
  if (!queueUrl) {
    return "";
  }
  const startIndex = queueUrl.lastIndexOf("/");
  return queueUrl.substring(startIndex + 1);
}

function getRows(queueDetails: SQSRowDefinitions[]): SQSRowDefinitions[] {
  const rows: any[] = [];
  if (!queueDetails || queueDetails.length <= 0) {
    return rows;
  }
  return queueDetails.map(item => item);
}

function getTableData(getQueueAttributesCommandOutput: GetQueueAttributesCommandOutput): TableData {
  if (!getQueueAttributesCommandOutput) {
    return {columns: sqsColumnDefinitions, rows: []};
  }
  return {
    columns: sqsColumnDefinitions,
    rows: getRows(getQueueAttributesCommandOutput)
  };
}

interface SQSRowDefinitions {
  name: string,
  ApproximateNumberOfMessages: string,
  ApproximateNumberOfMessagesDelayed: string,
  ApproximateNumberOfMessagesNotVisible: string,
  RedrivePolicy: string,
  VisibilityTimeout: string
}

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new SQSClient(getClientConfig(awsProfile));

  const [queues, setQueues] = useState<string[]>([]);
  const [tableData, setTableData] = useState<TableData>(getTableData(undefined));

  const getTableRows = (client: SQSClient, queues: string[]) => {
    const rows: SQSRowDefinitions[] = [];
    queues.forEach(value => {
      client.send(new GetQueueAttributesCommand({QueueUrl: value, AttributeNames: attributesToFetch}))
        .then(output => setTableData(getTableData(output)))
        .catch(error => console.error(error));
    });
  }

  useEffect(() => {
    if (awsProfile !== nullAwsProfile) {
      client.send(new ListQueuesCommand({}))
        .then(output => {
          if (output && output.QueueUrls && output.QueueUrls.length > 0) {
            getTableRows(client, output.QueueUrls);
          }
        }).catch(error => console.error(error));
    }
  }, []);

  return (
    <div>
      <MDBox my={3} sx={{maxHeight: "50%"}}>
        <Card>
          <MDBox p={3} lineHeight={1} display="flex" justifyContent="space-between">
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium">
                Data View
              </MDTypography>
              <MDTypography variant="button" color="text">
                Here is the list of queues in
                <MDTypography
                  display="inline"
                  fontWeight="bold"
                  variant="button"
                  color="text">
                  &nbsp;{awsProfile.displayName}
                </MDTypography>
                profile
              </MDTypography>
            </MDBox>
          </MDBox>
          <DataTable table={tableData} canSearch={true} stickyHeader={true}/>
        </Card>
      </MDBox>
    </div>
  );
}

function SQSDashboard(): JSX.Element {
  return (
    <AwsDashboardLayout title="SQS Dashboard" subTitle="Create/Choose a profile">
      <Content />
    </AwsDashboardLayout>
  );
}

export default SQSDashboard;