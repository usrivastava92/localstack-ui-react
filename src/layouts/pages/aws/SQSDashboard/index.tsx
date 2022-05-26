import {useContext, useEffect, useState} from "react";

import {
  GetQueueAttributesCommand,
  GetQueueAttributesCommandOutput,
  ListQueuesCommand,
  QueueAttributeName,
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
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "../../../../components/MDInput";
import Grid from "@mui/material/Grid";
import MDButton from "../../../../components/MDButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

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

const attributesToFetch: QueueAttributeName[] = [
  'ApproximateNumberOfMessages',
  'ApproximateNumberOfMessagesDelayed',
  'ApproximateNumberOfMessagesNotVisible',
  'RedrivePolicy',
  'VisibilityTimeout',
  'QueueArn'
];

function getQueueNameFromUrl(queueUrl: string): string {
  if (!queueUrl) {
    return "";
  }
  const startIndex = queueUrl.lastIndexOf("/");
  return queueUrl.substring(startIndex + 1);
}

function getQueueNameFromArn(queueArn: string): string {
  if (!queueArn) {
    return "";
  }
  const startIndex = queueArn.lastIndexOf(":");
  return queueArn.substring(startIndex + 1);
}

function getRows(queueDetails: GetQueueAttributesCommandOutput): SQSRowDefinitions[] {
  const rows: any[] = [];
  if (!queueDetails) {
    return rows;
  }
  return [{
    name: getQueueNameFromArn(queueDetails.Attributes['QueueArn']),
    ApproximateNumberOfMessages: queueDetails.Attributes['ApproximateNumberOfMessages'],
    ApproximateNumberOfMessagesDelayed: queueDetails.Attributes['ApproximateNumberOfMessagesDelayed'],
    ApproximateNumberOfMessagesNotVisible: queueDetails.Attributes['ApproximateNumberOfMessagesNotVisible'],
    RedrivePolicy: queueDetails.Attributes['RedrivePolicy'],
    VisibilityTimeout: queueDetails.Attributes['VisibilityTimeout'],
  }];
}

function getTableData(getQueueAttributesCommandOutput: GetQueueAttributesCommandOutput): TableData {
  if (!getQueueAttributesCommandOutput) {
    return {columns: sqsColumnDefinitions, rows: []};
  }
  return {
    columns: sqsColumnDefinitions,
    rows: getRows(getQueueAttributesCommandOutput)
  }
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

  const [queueMap, setQueueMap] = useState<Map<string, string>>(new Map());
  const [selectedQueue, setSelectedQueue] = useState<string>();
  const [tableData, setTableData] = useState<TableData>(getTableData(undefined));

  function listQueues() : void {
    if (awsProfile !== nullAwsProfile) {
      client.send(new ListQueuesCommand({}))
        .then(output => {
          if (output && output.QueueUrls && output.QueueUrls.length > 0) {
            const newQueueMap = new Map<string, string>();
            output.QueueUrls.forEach(queueUrl => newQueueMap.set(getQueueNameFromUrl(queueUrl), queueUrl))
            setQueueMap(newQueueMap)
          }
        })
        .catch(error => console.error(error));
    }
  }

  useEffect(listQueues, []);

  function getQueueAttributes(queue: string) {
    if (queue && queue !== selectedQueue) {
      setSelectedQueue(queue)
      client.send(new GetQueueAttributesCommand({QueueUrl: queueMap.get(queue), AttributeNames: attributesToFetch}))
        .then(output => setTableData(getTableData(output)))
        .catch(error => console.error(error));
    }
  }

  return (
    <div>
      <MDBox my={3} sx={{maxHeight: "50%"}}>
        <Card>
          <MDBox p={3} lineHeight={1} display="flex" justifyContent="space-between">
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium">
                Queue Details
              </MDTypography>
              <MDTypography variant="button" color="text">
                Here are details of the
                {
                  selectedQueue ?
                    <MDTypography
                      display="inline"
                      fontWeight="bold"
                      variant="button"
                      color="text">
                      &nbsp;{selectedQueue}
                    </MDTypography>
                    : " selected"
                } queue
              </MDTypography>
            </MDBox>
            <MDBox display="flex" justifyContent="space-between">
              <Tooltip title="Reload Data" placement="left">
                <MDButton sx={{mr: 3}} variant="gradient" color="info" onClick={() => {
                  listQueues();
                  getQueueAttributes(selectedQueue);
                }}>
                  <Icon fontSize={"large"}>cached</Icon>
                </MDButton>
              </Tooltip>
              <Autocomplete
                disableClearable
                sx={{width: "12rem", borderRadius: 3}}
                value={selectedQueue ? selectedQueue : "No Queue Selected"}
                options={Array.from(queueMap.keys())}
                onChange={(e, v) => getQueueAttributes(v as string)}
                renderInput={(params) => <MDInput {...params} label="Queue" fullWidth/>}
              />
            </MDBox>
          </MDBox>
          <DataTable table={tableData} canSearch={true} stickyHeader={true}/>
          <MDBox p={3} lineHeight={0}>
            <MDTypography variant="h5">Message Operations</MDTypography>
            <MDTypography variant="button" color="text">
              You can perform CRUD operations on the queue using below actions
            </MDTypography>
          </MDBox>
          <MDBox p={3}>
            <Grid container spacing={3}>
              <Grid item md={3}/>
              <Grid item xs={12} md={2}>
                <MDButton variant="gradient" color="secondary" onClick={() => {
                }} fullWidth disabled>
                  Receive <br/>(Dev in-progress)
                </MDButton>
              </Grid>
              <Grid item xs={12} md={2}>
                <MDButton variant="gradient" color="dark" onClick={() => {
                }} fullWidth disabled>
                  Send <br/>(Dev in-progress)
                </MDButton>
              </Grid>
              <Grid item xs={12} md={2}>
                <MDButton variant="gradient" color="error" onClick={() => {
                }} fullWidth disabled>
                  Delete <br/>(Dev in-progress)
                </MDButton>
              </Grid>
              <Grid item md={3}/>
            </Grid>
          </MDBox>
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