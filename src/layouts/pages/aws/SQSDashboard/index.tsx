// @mui material components
// Settings page components

import { useContext, useEffect, useState } from "react";

import { ListQueuesCommand, SQSClient } from "@aws-sdk/client-sqs";
import AwsDashboardLayout from "../AwsDashboardLayout";
import { Card, Grid, Icon, Link, TableBody, TableCell, TableRow } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { AWSProfile, nullAwsProfile } from "../types/awsTypes";
import { AWSProfileContext } from "../../../../context";
import { getClientConfig } from "../utils/awsUtils";


function getQueueName(queueUrl: string): string {
  if (!queueUrl) {
    return "";
  }
  const startIndex = queueUrl.lastIndexOf("/");
  return queueUrl.substring(startIndex + 1);
}

function Content(): JSX.Element {
  const awsProfile = useContext<AWSProfile>(AWSProfileContext);

  const client = new SQSClient(getClientConfig(awsProfile));

  const [queues, setQueues] = useState<string[]>([]);

  useEffect(() => {
    if (awsProfile !== nullAwsProfile) {
      client.send(new ListQueuesCommand({}))
        .then(output => {
          if (output && output.QueueUrls && output.QueueUrls.length > 0) {
            setQueues(output.QueueUrls.map(queueUrl => getQueueName(queueUrl)));
          }
        }).catch(error => console.log(error));
    }
  }, []);

  return (
    <Card sx={{ width: "100%" }}>
      <MDBox display="flex">
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          variant="gradient"
          bgColor="success"
          color="white"
          shadow="md"
          borderRadius="xl"
          ml={3}
          mt={-2}
        >
          <Icon fontSize="medium" color="inherit">
            queue
          </Icon>
        </MDBox>
        <MDTypography variant="h6" sx={{ mt: 2, mb: 1, ml: 2 }}>
          SQS
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        <Grid container>
          <Grid item xs={12} md={7} lg={6}>
            <TableBody>
              {queues.map((name) => (
                <TableRow
                  key={name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Link href="#">{name}</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

function SQSDashboard(): JSX.Element {
  return (
    <AwsDashboardLayout>
      <Content />
    </AwsDashboardLayout>
  );
}

export default SQSDashboard;
