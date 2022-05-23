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
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import MDSnackbar from "../../../../components/MDSnackbar";

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

const addProfileValidation = [
  Yup.object().shape({
    [accessKey.name]: Yup.string().required(accessKey.errorMsg),
    [secretKey.name]: Yup.string().required(secretKey.errorMsg)
  })
];


function AddAwsProfileForm(formData: FormDataSchema): JSX.Element {
  const {formFields, values, errors, touched} = formData;
  const {accessKey, secretKey} = formFields;
  const {accessKey: accessKeyV, secretKey: secretKeyV} = values;

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

function DDBDashboard(): JSX.Element {

  const client = new DynamoDB({
    region: "ap-south-1",
    credentials: {
      accessKeyId: "local-access-key-id",
      secretAccessKey: "local-secret-access-key",
    }
  });

  const [tables, setTables] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const closeError = () => setShowError(false);
  const handleAddNewProfile = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  client.listTables({Limit: 10})
    .then(output => setTables(output?.TableNames))
    .catch(error => setShowError(true))

  const sleep = (ms: any) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const submitForm = async (values: any, actions: any) => {
    await sleep(1000);
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(values, null, 2));
    actions.setSubmitting(false);
    actions.resetForm();
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
              <Formik initialValues={initialValues} validationSchema={addProfileValidation} onSubmit={submitForm}>
                {({values, errors, touched, isSubmitting}) => (
                  <Form id={addProfileForm.formId} autoComplete="off">
                    <Card sx={{height: "100%"}}>
                      <MDBox p={3}>
                        <MDBox>
                          <AddAwsProfileForm formFields={addProfileForm.formFields} errors={errors} touched={touched}
                                             values={values}/>
                          <MDBox mt={2} width="100%" display="flex" justifyContent="right">
                            <MDButton disabled={isSubmitting} type="submit" variant="gradient"
                                      color="dark">Save</MDButton>
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
              Create a new AWS Profile or choose an existing AWS profile {tables.map(name => <div
              key={name}>{name}</div>)}
            </MDTypography>
          </MDBox>
        </Grid>
        <Grid item xs={12} md={5} sx={{textAlign: "right"}}>
          <MDButton variant="gradient" color="info" onClick={handleAddNewProfile}>
            <Icon>add</Icon>&nbsp; Add New
          </MDButton>
        </Grid>
      </Grid>
      <MDSnackbar
        color="error"
        icon="warning"
        title="AWS Error"
        content="Unable to list table"
        dateTime="11 mins ago"
        open={showError}
        onClose={closeError}
        close={closeError}
        bgWhite
      />
      <Footer/>
    </DashboardLayout>
  );
}

export default DDBDashboard;
