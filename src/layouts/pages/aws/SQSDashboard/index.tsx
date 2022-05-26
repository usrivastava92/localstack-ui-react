import { useContext, useEffect, useState } from "react";

import {
  DeleteMessageCommand,
  GetQueueAttributesCommand,
  GetQueueAttributesCommandOutput,
  ListQueuesCommand,
  QueueAttributeName,
  ReceiveMessageCommand,
  ReceiveMessageCommandOutput,
  SendMessageCommand,
  SQSClient
} from "@aws-sdk/client-sqs";
import AwsDashboardLayout from "../AwsDashboardLayout";
import { Card, Modal } from "@mui/material";
import { AWSProfile, nullAwsProfile } from "../types/awsTypes";
import { AWSProfileContext } from "../../../../context";
import { getClientConfig, getQueueNameFromArn, getQueueNameFromUrl } from "../utils/awsUtils";
import DefaultCell from "../../../ecommerce/orders/order-list/components/DefaultCell";
import DataTable from "../../../../examples/Tables/DataTable";
import { ColumnDefinition, TableData } from "../types/tableTypes";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "../../../../components/MDInput";
import Grid from "@mui/material/Grid";
import MDButton from "../../../../components/MDButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import { defaultSBProps, getErrorSBProps, getSuccessSBProps } from "../utils/notificationUtils";
import MDSnackbar, { SBProps } from "../../../../components/MDSnackbar";
import TextOverflowEllipsisCell from "../../../ecommerce/orders/order-list/components/TextOverflowEllipsisCell";
import { Form, Formik } from "formik";
import FormField from "../../users/new-user/components/FormField";
import { ValuesSchema } from "../types/formTypes";
import { deleteMessageForm } from "./forms";
import { deleteMessageFormValidation } from "./formValidations";
import { FormikHelpers } from "formik/dist/types";

const sqsColumnDefinitions: ColumnDefinition[] = [
  { accessor: "name", Header: "Queue Name", Cell: ({ value }) => <DefaultCell value={value} /> },
  {
    accessor: "ApproximateNumberOfMessages",
    Header: "Total Messages",
    Cell: ({ value }) => <DefaultCell value={value} />
  },
  {
    accessor: "ApproximateNumberOfMessagesDelayed",
    Header: "Delayed Messages",
    Cell: ({ value }) => <DefaultCell value={value} />
  },
  {
    accessor: "ApproximateNumberOfMessagesNotVisible",
    Header: "Messages In Flight",
    Cell: ({ value }) => <DefaultCell value={value} />
  },
  { accessor: "RedrivePolicy", Header: "Redrive Policy", Cell: ({ value }) => <DefaultCell value={value} /> },
  {
    accessor: "VisibilityTimeout",
    Header: "Visibility Timeout (sec)",
    Cell: ({ value }) => <DefaultCell value={value} />
  }
];

const messageColumnDefinitions: ColumnDefinition[] = [
  { accessor: "MessageId", Header: "Message Id", Cell: ({ value }) => <DefaultCell value={value} /> },
  { accessor: "Body", Header: "Body", Cell: ({ value }) => <DefaultCell value={value} /> },
  {
    accessor: "ReceiptHandle",
    Header: "Receipt Handle",
    Cell: ({ value }) => <TextOverflowEllipsisCell value={value} />
  },
  { accessor: "MD5OfBody", Header: "MD5 Of Body", Cell: ({ value }) => <DefaultCell value={value} /> }
];

const attributesToFetch: QueueAttributeName[] = [
  "ApproximateNumberOfMessages",
  "ApproximateNumberOfMessagesDelayed",
  "ApproximateNumberOfMessagesNotVisible",
  "RedrivePolicy",
  "VisibilityTimeout",
  "QueueArn"
];

function getRows(queueDetails: GetQueueAttributesCommandOutput): SQSRowDefinitions[] {
  const rows: any[] = [];
  if (!queueDetails) {
    return rows;
  }
  return [{
    name: getQueueNameFromArn(queueDetails.Attributes["QueueArn"]),
    ApproximateNumberOfMessages: queueDetails.Attributes["ApproximateNumberOfMessages"],
    ApproximateNumberOfMessagesDelayed: queueDetails.Attributes["ApproximateNumberOfMessagesDelayed"],
    ApproximateNumberOfMessagesNotVisible: queueDetails.Attributes["ApproximateNumberOfMessagesNotVisible"],
    RedrivePolicy: queueDetails.Attributes["RedrivePolicy"],
    VisibilityTimeout: queueDetails.Attributes["VisibilityTimeout"]
  }];
}

const emptySqsTableData: TableData = { columns: sqsColumnDefinitions, rows: [] };

function getTableData(getQueueAttributesCommandOutput: GetQueueAttributesCommandOutput): TableData {
  if (!getQueueAttributesCommandOutput) {
    return emptySqsTableData;
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

const emptyMessageTableData: TableData = { columns: sqsColumnDefinitions, rows: [] };

function getMessageTableData(output: ReceiveMessageCommandOutput): TableData {
  if (!output) {
    return emptyMessageTableData;
  }
  return {
    columns: messageColumnDefinitions,
    rows: output.Messages
  };
}


function DeleteMessageForm({ client, queueUrl }: { client: SQSClient, queueUrl: string }): JSX.Element {

  const [sbProps, setSBProps] = useState<SBProps>(defaultSBProps);
  const { formFields: { receiptHandle } } = deleteMessageForm;
  const initialValues: ValuesSchema = { [receiptHandle.name]: "" };

  const handleSubmit = (values: ValuesSchema, actions: FormikHelpers<ValuesSchema>) => {
    deleteMessage(values as { receiptHandle: string });
    actions.setSubmitting(false);
    actions.resetForm();
  };

  function deleteMessage({ receiptHandle }: { receiptHandle: string }) {
    if (queueUrl) {
      client.send(new DeleteMessageCommand({
        ReceiptHandle: receiptHandle,
        QueueUrl: queueUrl
      })).then(response => {
        setSBProps(getSuccessSBProps({
          title: "Success",
          content: `Response from server : ${JSON.stringify(response)}`,
          open: true,
          onClose: () => setSBProps(defaultSBProps),
          close: () => setSBProps(defaultSBProps)
        }));
      }).catch(error => {
        console.error(error);
        setSBProps(getErrorSBProps({
          title: "AWS Error",
          content: String(error),
          open: true,
          onClose: () => setSBProps(defaultSBProps),
          close: () => setSBProps(defaultSBProps)
        }));
      });
    }
  }

  return (
    <MDBox py={3} mb={20} height="65vh">
      <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
        <Grid item xs={12} lg={8}>
          <Formik initialValues={initialValues} validationSchema={deleteMessageFormValidation} onSubmit={handleSubmit}>
            {({ values, errors, touched, isSubmitting }) => (
              <Form id={deleteMessageForm.formId} autoComplete="off">
                <Card sx={{ height: "100%" }}>
                  <MDBox p={3}>
                    <MDBox lineHeight={0} textAlign={"center"}>
                      <MDTypography variant="h5">Delete Message</MDTypography>
                    </MDBox>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type={receiptHandle.type}
                          label={receiptHandle.label}
                          name={receiptHandle.name}
                          value={values.receiptHandle}
                          placeholder={receiptHandle.placeholder}
                          error={errors.receiptHandle && touched.receiptHandle}
                          success={values.receiptHandle.length > 0 && !errors.receiptHandle}
                        />
                      </Grid>
                      <Grid item xs={12} sm={5} />
                      <Grid item xs={12} sm={4}>
                        <MDButton
                          disabled={isSubmitting}
                          type="submit"
                          variant="gradient"
                          color="error">
                          Delete
                        </MDButton>
                      </Grid>
                      <Grid item xs={12} sm={5} />
                    </Grid>
                  </MDBox>
                </Card>
              </Form>
            )}
          </Formik>
        </Grid>
      </Grid>
      <MDSnackbar
        color={sbProps.color}
        icon={sbProps.icon}
        title={sbProps.title}
        content={sbProps.content}
        dateTime={sbProps.dateTime}
        open={sbProps.open}
        onClose={sbProps.onClose}
        close={sbProps.close}
        bgWhite
      />
    </MDBox>
  );
}

function Content(): JSX.Element {

  const awsProfile = useContext<AWSProfile>(AWSProfileContext);
  const client = new SQSClient(getClientConfig(awsProfile));

  const [openReceiveModal, setOpenReceiveModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [queueMap, setQueueMap] = useState<Map<string, string>>(new Map());
  const [selectedQueue, setSelectedQueue] = useState<string>();
  const [sbProps, setSBProps] = useState<SBProps>(defaultSBProps);
  const [tableData, setTableData] = useState<TableData>(emptySqsTableData);
  const [messageTableData, setMessageTableData] = useState<TableData>(emptyMessageTableData);

  const handleCloseReceiveModal = () => {
    setMessageTableData(emptyMessageTableData);
    setOpenReceiveModal(false);
  };
  const handleOpenReceiveModal = () => {
    setOpenReceiveModal(true);
    receiveMessages();
  };

  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  function listQueues(): void {
    if (awsProfile !== nullAwsProfile) {
      client.send(new ListQueuesCommand({}))
        .then(output => {
          if (output && output.QueueUrls && output.QueueUrls.length > 0) {
            const newQueueMap = new Map<string, string>();
            output.QueueUrls.forEach(queueUrl => newQueueMap.set(getQueueNameFromUrl(queueUrl), queueUrl));
            setQueueMap(newQueueMap);
          }
        })
        .catch(error => {
          console.error(error);
          setSBProps(getErrorSBProps({
            title: "AWS Error",
            content: String(error),
            open: true,
            onClose: () => setSBProps(defaultSBProps),
            close: () => setSBProps(defaultSBProps)
          }));
        });
      getQueueAttributes(selectedQueue);
    }
  }

  useEffect(listQueues, []);

  function getQueueAttributes(queue: string) {
    if (queue) {
      setSelectedQueue(queue);
      client.send(new GetQueueAttributesCommand({ QueueUrl: queueMap.get(queue), AttributeNames: attributesToFetch }))
        .then(output => setTableData(getTableData(output)))
        .catch(error => {
          console.error(error);
          setSBProps(getErrorSBProps({
            title: "AWS Error",
            content: String(error),
            open: true,
            onClose: () => setSBProps(defaultSBProps),
            close: () => setSBProps(defaultSBProps)
          }));
        });
    }
  }

  function receiveMessages() {
    if (selectedQueue) {
      client.send(new ReceiveMessageCommand({ QueueUrl: queueMap.get(selectedQueue), MaxNumberOfMessages: 10 }))
        .then(response => setMessageTableData(getMessageTableData(response)))
        .catch(error => {
          console.error(error);
          setSBProps(getErrorSBProps({
            title: "AWS Error",
            content: String(error),
            open: true,
            onClose: () => setSBProps(defaultSBProps),
            close: () => setSBProps(defaultSBProps)
          }));
        });
    }
  }

  function sendMessage() {
    if (selectedQueue) {
      client.send(new SendMessageCommand({
        QueueUrl: queueMap.get(selectedQueue),
        MessageBody: "",
        MessageAttributes: {}
      })).then(response => {
        setSBProps(getSuccessSBProps({
          title: "Success",
          content: `Response from server : ${JSON.stringify(response)}`,
          open: true,
          onClose: () => setSBProps(defaultSBProps),
          close: () => setSBProps(defaultSBProps)
        }));
      }).catch(error => {
        console.error(error);
        setSBProps(getErrorSBProps({
          title: "AWS Error",
          content: String(error),
          open: true,
          onClose: () => setSBProps(defaultSBProps),
          close: () => setSBProps(defaultSBProps)
        }));
      });
    }
  }


  return (
    <div>
      <MDBox my={3} sx={{ maxHeight: "50%" }}>
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
                <MDButton sx={{ mr: 3 }} variant="gradient" color="info" onClick={() => {
                  listQueues();
                  getQueueAttributes(selectedQueue);
                }}>
                  <Icon fontSize={"large"}>cached</Icon>
                </MDButton>
              </Tooltip>
              <Autocomplete
                disableClearable
                sx={{ width: "12rem", borderRadius: 3 }}
                value={selectedQueue ? selectedQueue : "No Queue Selected"}
                options={Array.from(queueMap.keys())}
                onChange={(e, v) => getQueueAttributes(v as string)}
                renderInput={(params) => <MDInput {...params} label="Queue" fullWidth />}
              />
            </MDBox>
          </MDBox>
          <DataTable table={tableData} canSearch={true} stickyHeader={true} />
          <MDBox p={3} lineHeight={0}>
            <MDTypography variant="h5">Message Operations</MDTypography>
            <MDTypography variant="button" color="text">
              You can perform CRUD operations on the queue using below actions
            </MDTypography>
          </MDBox>
          <MDBox p={3}>
            <Grid container spacing={3}>
              <Grid item md={3} />
              <Grid item xs={12} md={2}>
                <Modal
                  open={openReceiveModal}
                  onClose={handleCloseReceiveModal}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description">
                  <MDBox py={3} mb={20} height="65vh">
                    <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
                      <Grid item xs={12} lg={8}>
                        <Card sx={{ height: "100%" }}>
                          <MDBox p={3}>
                            <MDBox>
                              <MDBox mt={2} width="100%" display="flex" justifyContent="space-between">
                                <DataTable table={messageTableData} canSearch={true} stickyHeader={true} />
                              </MDBox>
                            </MDBox>
                          </MDBox>
                        </Card>
                      </Grid>
                    </Grid>
                  </MDBox>
                </Modal>
                <MDButton variant="gradient" color="secondary" onClick={handleOpenReceiveModal} fullWidth>
                  Receive
                </MDButton>
              </Grid>
              <Grid item xs={12} md={2}>
                <MDButton variant="gradient" color="success" onClick={sendMessage} fullWidth disabled>
                  Send <br /> (Coming Soon...)
                </MDButton>
              </Grid>
              <Grid item xs={12} md={2}>
                <Modal
                  open={openDeleteModal}
                  onClose={handleCloseDeleteModal}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description">
                  <MDBox mt={2} width="100%">
                    <DeleteMessageForm
                      client={client}
                      queueUrl={queueMap.get(selectedQueue)}
                    />
                  </MDBox>
                </Modal>
                <MDButton variant="gradient" color="error" onClick={handleOpenDeleteModal} fullWidth>
                  Delete
                </MDButton>
              </Grid>
              <Grid item md={3} />
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
      <MDSnackbar
        color={sbProps.color}
        icon={sbProps.icon}
        title={sbProps.title}
        content={sbProps.content}
        dateTime={sbProps.dateTime}
        open={sbProps.open}
        onClose={sbProps.onClose}
        close={sbProps.close}
        bgWhite
      />
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