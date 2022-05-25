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
import {useState} from "react";
import {Modal} from "@mui/material";
import {Form, Formik, FormikErrors, FormikTouched, FormikValues} from "formik";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import FormField from "../../users/new-user/components/FormField";
import * as Yup from "yup";

function getSteps(): string[] {
  return ["AWS Profile"];
}

function getStepContent(stepIndex: number, formData: FormDataSchema): JSX.Element {
  switch (stepIndex) {
    case 0:
      return <AddAwsProfile formFields={formData.formFields} errors={formData.errors} touched={formData.touched}
                            values={formData.values}/>;
    default:
      return null;
  }
}

interface FormFieldSchema {
  name: string,
  label: string,
  type: string,
  errorMsg: string
}

interface FormSchema {
  formId: string,
  formFields: {
    [key: string]: FormFieldSchema
  }
}

interface FormDataSchema {
  values: FormikValues
  touched: FormikTouched<FormikValues>,
  formFields: {
    [key: string]: FormFieldSchema
  },
  errors: FormikErrors<FormikValues>
}

const addProfileForm: FormSchema = {
  formId: "add-aws-profile",
  formFields: {
    accessKey: {
      name: "accessKey",
      label: "Access Key",
      type: "text",
      errorMsg: "Access Key is required."
    },
    secretKey: {
      name: "secretKey",
      label: "Secret Key",
      type: "text",
      errorMsg: "Secret Key is required."
    }
  }
};

const {formFields: {accessKey, secretKey}} = addProfileForm;

const initialValues = {
  [accessKey.name]: "",
  [secretKey.name]: ""
};

const validations = [
  Yup.object().shape({
    [accessKey.name]: Yup.string().required(accessKey.errorMsg),
    [secretKey.name]: Yup.string().required(secretKey.errorMsg)
  })
];


function AddAwsProfile(formData: FormDataSchema): JSX.Element {
  const {formFields, values, errors, touched} = formData;
  const {accessKey, secretKey} = formFields;
  const {
    accessKey: accessKeyV,
    secretKey: secretKeyV
  } = values;

  return (
    <MDBox>
      <MDBox lineHeight={0}>
        <MDTypography variant="h5">Create AWS Profile</MDTypography>
      </MDBox>
      <MDBox mt={1.625}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormField
              type={accessKey.type}
              label={accessKey.label}
              name={accessKey.name}
              value={accessKey}
              placeholder={accessKeyV.placeholder}
              error={errors.accessKey && touched.accessKey}
              success={accessKeyV.length > 0 && !errors.accessKey}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type={secretKey.type}
              label={secretKey.label}
              name={secretKey.name}
              value={secretKeyV}
              placeholder={secretKeyV.placeholder}
              error={errors.secretKey && touched.secretKey}
              success={secretKeyV.length > 0 && !errors.secretKey}
            />
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

function AwsHome(): JSX.Element {

  const {sales, tasks} = reportsLineChartData;

  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // Action buttons for the BookingCard
  const actionButtons = (
    <>
      <Tooltip title="Refresh" placement="bottom">
        <MDTypography
          variant="body1"
          color="primary"
          lineHeight={1}
          sx={{cursor: "pointer", mx: 3}}
        >
          <Icon color="inherit">refresh</Icon>
        </MDTypography>
      </Tooltip>
      <Tooltip title="Edit" placement="bottom">
        <MDTypography variant="body1" color="info" lineHeight={1} sx={{cursor: "pointer", mx: 3}}>
          <Icon color="inherit">edit</Icon>
        </MDTypography>
      </Tooltip>
    </>
  );

  const handleAddNewProfile = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const steps = getSteps();
  const {formId, formFields} = addProfileForm;
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

  return (
    <DashboardLayout>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <MDBox py={3} mb={20} height="65vh">
          <Grid container justifyContent="center" alignItems="center" sx={{height: "100%", mt: 8}}>
            <Grid item xs={12} lg={8}>
              <Formik
                initialValues={initialValues}
                validationSchema={currentValidation}
                onSubmit={handleSubmit}
              >
                {({values, errors, touched, isSubmitting}) => (
                  <Form id={formId} autoComplete="off">
                    <Card sx={{height: "100%"}}>
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
                            formFields,
                            errors
                          })}
                          <MDBox mt={2} width="100%" display="flex" justifyContent="space-between">
                            {activeStep === 0 ? (
                              <MDBox/>
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
                              {isLastStep ? "Save" : "next"}
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
        <Grid item xs={12} md={5} sx={{textAlign: "right"}}>
          <MDButton variant="gradient" color="info" onClick={handleAddNewProfile}>
            <Icon>add</Icon>&nbsp; Add New
          </MDButton>
        </Grid>
      </Grid>
      <MDBox py={3}>
        <Grid container>
          <SalesByCountry/>
        </Grid>
        <MDBox mt={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="website views"
                  description="Last Campaign Performance"
                  date="campaign sent 2 days ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="daily sales"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in today sales.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="completed tasks"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={1.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="weekend"
                  title="Bookings"
                  count={281}
                  percentage={{
                    color: "success",
                    amount: "+55%",
                    label: "than lask week"
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="leaderboard"
                  title="Today's Users"
                  count="2,300"
                  percentage={{
                    color: "success",
                    amount: "+3%",
                    label: "than last month"
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="store"
                  title="Revenue"
                  count="34k"
                  percentage={{
                    color: "success",
                    amount: "+1%",
                    label: "than yesterday"
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="person_add"
                  title="Followers"
                  count="+91"
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Just updated"
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mt={3}>
                <BookingCard
                  image={booking1}
                  title="Cozy 5 Stars Apartment"
                  description='The place is close to Barceloneta Beach and bus stop just 2 min by walk and near to "Naviglio" where you can enjoy the main night life in Barcelona.'
                  price="$899/night"
                  location="Barcelona, Spain"
                  action={actionButtons}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mt={3}>
                <BookingCard
                  image={booking2}
                  title="Office Studio"
                  description='The place is close to Metro Station and bus stop just 2 min by walk and near to "Naviglio" where you can enjoy the night life in London, UK.'
                  price="$1.119/night"
                  location="London, UK"
                  action={actionButtons}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mt={3}>
                <BookingCard
                  image={booking3}
                  title="Beautiful Castle"
                  description='The place is close to Metro Station and bus stop just 2 min by walk and near to "Naviglio" where you can enjoy the main night life in Milan.'
                  price="$459/night"
                  location="Milan, Italy"
                  action={actionButtons}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer/>
    </DashboardLayout>
  );
}

export default AwsHome;
