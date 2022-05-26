// @mui material components
// Settings page components

import { useContext, useEffect, useState } from "react";

import {
  GetQueueAttributesCommand,
  ListQueuesCommand,
  SQSClient
} from "@aws-sdk/client-sqs";
import AwsDashboardLayout from "../AwsDashboardLayout";
import { Card } from "@mui/material";
import { AWSProfile, nullAwsProfile } from "../types/awsTypes";
import { AWSProfileContext } from "../../../../context";
import { getClientConfig } from "../utils/awsUtils";
import DefaultCell from "../../../ecommerce/orders/order-list/components/DefaultCell";
import DataTable from "../../../../examples/Tables/DataTable";


function getQueueName(queueUrl: string): string {
  if (!queueUrl) {
    return "";
  }
  const startIndex = queueUrl.lastIndexOf("/");
  return queueUrl.substring(startIndex + 1);
}

interface ColumnDefinition {
  Header: string,
  accessor: string,
  Cell: ({ value }: { value: any }) => JSX.Element
}

function getColumnDefinitions(): ColumnDefinition[] {
  const columnDefinitions: ColumnDefinition[] = [
    { accessor: "name", Header: "Queue Name", Cell: ({ value }) => <DefaultCell value={value} /> },
    {
      accessor: "ApproximateNumberOfMessages",
      Header: "Total Messages",
      Cell: ({ value }) => <DefaultCell value={value} />
    },
    {
      accessor: "ApproximateNumberOfMessagesDelayed",
      Header: "ApproximateNumberOfMessagesDelayed",
      Cell: ({ value }) => <DefaultCell value={value} />
    },
    {
      accessor: "ApproximateNumberOfMessagesNotVisible",
      Header: "ApproximateNumberOfMessagesNotVisible",
      Cell: ({ value }) => <DefaultCell value={value} />
    },
    { accessor: "RedrivePolicy", Header: "RedrivePolicy", Cell: ({ value }) => <DefaultCell value={value} /> },
    { accessor: "VisibilityTimeout", Header: "VisibilityTimeout", Cell: ({ value }) => <DefaultCell value={value} /> }
  ]
  return columnDefinitions;
}

function getRows(items: tableRow[]): any[] {
  const rows: any[] = [];
  if (!items || items.length <= 0) {
    return rows;
  }
  return items.map(item => {
    return item;
  });
}

interface TableData {
  columns: ColumnDefinition[],
  rows: any[]
}

function getTableData(scanOutput: tableRow[]): TableData {
  if (!scanOutput) {
    return { columns: getColumnDefinitions(), rows: [] };
  }
  return {
    columns: getColumnDefinitions(),
    rows: getRows(scanOutput) // List of attribute object
  };
}

interface tableRow {
  name: string,
  ApproximateNumberOfMessages: number,
  ApproximateNumberOfMessagesDelayed: number,
  ApproximateNumberOfMessagesNotVisible: number,
  RedrivePolicy: string,
  VisibilityTimeout: number
}




function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new SQSClient(getClientConfig(awsProfile));

  const [queues, setQueues] = useState<string[]>([]);
  const [tableData, setTableData] = useState<TableData>(getTableData(undefined));

  const getTableRows = (client: SQSClient, queues: string[]) => {
    const rows: tableRow[] = [];
    console.log("queues");
    console.log(queues);
    queues.forEach(value => {
      client.send(new GetQueueAttributesCommand({
        QueueUrl: value, AttributeNames: ['ApproximateNumberOfMessages',
          'ApproximateNumberOfMessagesDelayed',
          'ApproximateNumberOfMessagesNotVisible',
          'RedrivePolicy',
          'VisibilityTimeout']}))
        .then(output => {
          const data: tableRow = {
            name: getQueueName(value),
            ApproximateNumberOfMessages: Number(output.Attributes["ApproximateNumberOfMessages"]),
            ApproximateNumberOfMessagesDelayed:Number(output.Attributes["ApproximateNumberOfMessagesDelayed"]),
            ApproximateNumberOfMessagesNotVisible: Number(output.Attributes["ApproximateNumberOfMessagesNotVisible"]),
            RedrivePolicy: output.Attributes["RedrivePolicy"],
            VisibilityTimeout: Number(output.Attributes["VisibilityTimeout"])
          };
          console.log("data");
          console.log(data);
          tableData.rows.push(data);
        });
    });
  }

  useEffect(() => {
    if (awsProfile !== nullAwsProfile) {
      client.send(new ListQueuesCommand({}))
        .then(output => {
          if (output && output.QueueUrls && output.QueueUrls.length > 0) {
            // call set table data
            // console.log("Q " + queues);
            getTableRows(client, output.QueueUrls);
            // const rows: tableRow[] = [
            //   {
            //     ApproximateNumberOfMessages: 0,
            //     ApproximateNumberOfMessagesDelayed: 0,
            //     ApproximateNumberOfMessagesNotVisible: 0,
            //     RedrivePolicy: undefined,
            //     VisibilityTimeout: 30,
            //     name: "data-kcl-error-dead"
            //   }
            // ]

            // setTableData(getTableData(rows));
          }
        }).catch(error => console.error(error));
    }
  }, []);

  return (
    <Card sx={{ width: "100%" }}>
      <DataTable table={tableData} stickyHeader={true} />
    </Card>
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
//  docker run -e EXTRA_CORS_ALLOWED_ORIGINS="http://localhost:3000" --rm -it -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack