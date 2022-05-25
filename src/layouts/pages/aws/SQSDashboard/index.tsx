// @mui material components
// Settings page components

import { useState } from "react";

import { ListQueuesCommand, SQSClient } from  "@aws-sdk/client-sqs";
import AwsDashboardLayout from "../AwsDashboardLayout";
import { Card, Icon, Grid, TableBody, TableCell, TableRow, Link } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function SQSDashboard(): JSX.Element {

  const client = new SQSClient({
    region: "ap-south-1",
    credentials: {
      accessKeyId: "local-access-key-id",
      secretAccessKey: "local-secret-access-key"
    },
    endpoint: "http://localhost:4566"
  });

  const [queues, setQueues] = useState([]);

  client.send(new ListQueuesCommand({}))
    .then(output => setQueues(output?.QueueUrls))
    .catch(error => console.log(error));

  // const queueList = {queues.map(name => {name})};

  return (
    <AwsDashboardLayout>
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
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
    </AwsDashboardLayout>
  );
}

export default SQSDashboard;
