// @mui material components
// Settings page components

import MDBox from "../../../../components/MDBox";
import Grid from "@mui/material/Grid";
import SalesByCountry from "../../../dashboards/analytics/components/SalesByCountry";
import ReportsBarChart from "../../../../examples/Charts/BarCharts/ReportsBarChart";
import reportsBarChartData from "../../../dashboards/analytics/data/reportsBarChartData";
import ReportsLineChart from "../../../../examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "../../../../examples/Cards/StatisticsCards/ComplexStatisticsCard";
import BookingCard from "../../../../examples/Cards/BookingCard";
import booking1 from "../../../../assets/images/products/product-1-min.jpg";
import booking2 from "../../../../assets/images/products/product-2-min.jpg";
import booking3 from "../../../../assets/images/products/product-3-min.jpg";
import Footer from "../../../../examples/Footer";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import reportsLineChartData from "../../../dashboards/analytics/data/reportsLineChartData";
import Tooltip from "@mui/material/Tooltip";
import MDTypography from "../../../../components/MDTypography";
import Icon from "@mui/material/Icon";
import MDButton from "../../../../components/MDButton";
import { useState } from "react";
import { Modal } from "@mui/material";
import { Form, Formik } from "formik";
import initialValues from "../../users/new-user/schemas/initialValues";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import form from "../../users/new-user/schemas/form";
import validations from "../../users/new-user/schemas/validations";
import UserInfo from "../../users/new-user/components/UserInfo";
import Address from "../../users/new-user/components/Address";
import Socials from "../../users/new-user/components/Socials";
import Profile from "../../users/new-user/components/Profile";

import { ListQueuesCommand } from  "@aws-sdk/client-sqs";
import { sqsClient } from  "./sqsClient";

function getSteps(): string[] {
  return ["User Info", "Address", "Social", "Profile"];
}

function getStepContent(stepIndex: number, formData: any): JSX.Element {
  switch (stepIndex) {
    case 0:
      return <UserInfo formData={formData} />;
    case 1:
      return <Address formData={formData} />;
    case 2:
      return <Socials formData={formData} />;
    case 3:
      return <Profile formData={formData} />;
    default:
      return null;
  }
}

function SQSDashboard(): JSX.Element {

  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddNewProfile = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const steps = getSteps();
  const { formId, formField } = form;
  const currentValidation = validations[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  const sleep = (ms: any) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  const handleBack = () => setActiveStep(activeStep - 1);

  const submitForm = async (values: any, actions: any) => {
    await sleep(1000);

    // eslint-disable-next-line no-alert
    alert(JSON.stringify(values, null, 2));

    actions.setSubmitting(false);
    actions.resetForm();

    setActiveStep(0);
  };

  const handleSubmit = (values: any, actions: any) => {
    if (isLastStep) {
      submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  };

  const getQueueList = async () => {
    try {
      const data = await sqsClient.send(new ListQueuesCommand({}));
      console.log("Success", data);
      // return data;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <h1>SQS</h1>
      {getQueueList()}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <MDBox py={3} mb={20} height="65vh">
          <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
            <Grid item xs={12} lg={8}>
              <Formik
                initialValues={initialValues}
                validationSchema={currentValidation}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, isSubmitting }) => (
                  <Form id={formId} autoComplete="off">
                    <Card sx={{ height: "100%" }}>
                      <MDBox mx={2} mt={-3}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                          {steps.map((label) => (
                            <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </MDBox>
                      <MDBox p={3}>
                        <MDBox>
                          {getStepContent(activeStep, {
                            values,
                            touched,
                            formField,
                            errors
                          })}
                          <MDBox mt={2} width="100%" display="flex" justifyContent="space-between">
                            {activeStep === 0 ? (
                              <MDBox />
                            ) : (
                              <MDButton variant="gradient" color="light" onClick={handleBack}>
                                back
                              </MDButton>
                            )}
                            <MDButton
                              disabled={isSubmitting}
                              type="submit"
                              variant="gradient"
                              color="dark"
                            >
                              {isLastStep ? "send" : "next"}
                            </MDButton>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Form>
                )}
              </Formik>
            </Grid>
          </Grid>
        </MDBox>
      </Modal>
      <Grid container alignItems="center">
        <Grid item xs={12} md={7}>
          <MDBox mb={1}>
            <MDTypography variant="h5">Profile</MDTypography>
          </MDBox>
          <MDBox mb={2}>
            <MDTypography variant="body2" color="text">
              Create a new AWS Profile or choose an existing AWS profile
            </MDTypography>
          </MDBox>
        </Grid>
        <Grid item xs={12} md={5} sx={{ textAlign: "right" }}>
          <MDButton variant="gradient" color="info" onClick={handleAddNewProfile}>
            <Icon>add</Icon>&nbsp; Add New
          </MDButton>
        </Grid>
      </Grid>
      <MDBox py={3}>
        <Grid container>
          <SalesByCountry />
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SQSDashboard;
