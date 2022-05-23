import MDBox from "../../../../components/MDBox";
import Grid from "@mui/material/Grid";
import Footer from "../../../../examples/Footer";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import MDTypography from "../../../../components/MDTypography";
import Icon from "@mui/material/Icon";
import MDButton from "../../../../components/MDButton";
import { useState } from "react";
import { Modal } from "@mui/material";
import { Form, Formik, FormikErrors, FormikTouched, FormikValues } from "formik";
import Card from "@mui/material/Card";
import FormField from "../../users/new-user/components/FormField";
import * as Yup from "yup";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import MDSnackbar from "../../../../components/MDSnackbar";
import { FormikHelpers } from "formik/dist/types";

interface FormFieldSchema {
  placeholder?: string;
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

interface ValuesSchema {
  [key: string]: string;
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
      errorMsg: "Secret Key is required.",
      placeholder: ""
    },
    sessionKey: {
      name: "sessionKey",
      label: "Session Key",
      type: "text",
      errorMsg: "Session Key is required.",
      placeholder: "Session Key (Optional)"
    },
    endpoint: {
      name: "endpoint",
      label: "Endpoint",
      type: "text",
      errorMsg: "Endpoint is required.",
      placeholder: "Endpoint (Optional)"
    }
  }
};

const { formFields: { accessKey, secretKey, sessionKey, endpoint } } = addProfileForm;

const initialValues: ValuesSchema = {
  [accessKey.name]: "",
  [secretKey.name]: "",
  [sessionKey.name]: "",
  [endpoint.name]: ""
};

const addProfileFormValidation = Yup.object().shape({
  [accessKey.name]: Yup.string().trim().required(accessKey.errorMsg),
  [secretKey.name]: Yup.string().trim().required(secretKey.errorMsg)
});

function AddAwsProfileForm(formData: FormDataSchema): JSX.Element {

  const { formFields, values, errors, touched } = formData;
  const { accessKey, secretKey, sessionKey, endpoint } = formFields;
  const { accessKey: accessKeyV, secretKey: secretKeyV, sessionKey: sessionKeyV, endpoint: endpointV } = values;

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
              value={accessKeyV}
              placeholder={accessKey.placeholder}
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
              placeholder={secretKey.placeholder}
              error={errors.secretKey && touched.secretKey}
              success={secretKeyV.length > 0 && !errors.secretKey}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type={sessionKey.type}
              label={sessionKey.label}
              name={sessionKey.name}
              value={sessionKeyV}
              placeholder={sessionKey.placeholder}
              error={errors.sessionKey && touched.sessionKey}
              success={sessionKeyV.length > 0 && !errors.sessionKey}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type={endpoint.type}
              label={endpoint.label}
              name={endpoint.name}
              value={endpointV}
              placeholder={endpoint.placeholder}
              error={errors.endpoint && touched.endpoint}
              success={secretKeyV.length > 0 && !errors.endpoint}
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
      secretAccessKey: "local-secret-access-key"
    }
  });

  const [tables, setTables] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const closeError = () => setShowError(false);
  const handleAddNewProfile = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  client.listTables({ Limit: 10 })
    .then(output => setTables(output?.TableNames))
    .catch(error => setShowError(true));

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

  const handleSubmit = (values: ValuesSchema, actions: FormikHelpers<ValuesSchema>) => submitForm(values, actions);

  return (
    <DashboardLayout>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <MDBox py={3} mb={20} height="65vh">
          <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
            <Grid item xs={12} lg={8}>
              <Formik initialValues={initialValues} validationSchema={addProfileFormValidation} onSubmit={handleSubmit}>
                {({ values, errors, touched, isSubmitting }) => (
                  <Form id={addProfileForm.formId} autoComplete="off">
                    <Card sx={{ height: "100%" }}>
                      <MDBox p={3}>
                        <MDBox>
                          <AddAwsProfileForm
                            formFields={addProfileForm.formFields}
                            errors={errors}
                            touched={touched}
                            values={values} />
                          <MDBox mt={2} width="100%" display="flex" justifyContent="right">
                            <MDButton
                              disabled={isSubmitting}
                              type="submit"
                              variant="gradient"
                              color="dark">
                              Save
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
              Create a new AWS Profile or choose an existing AWS profile {tables.map(name => <div
              key={name}>{name}</div>)}
            </MDTypography>
          </MDBox>
        </Grid>
        <Grid item xs={12} md={5} sx={{ textAlign: "right" }}>
          <MDButton variant="gradient" color="info" onClick={handleAddNewProfile}>
            <Icon>add</Icon>&nbsp; Add New
          </MDButton>
        </Grid>
      </Grid>
      {/*<MDSnackbar
        color="error"
        icon="warning"
        title="AWS Error"
        content="Unable to list table"
        dateTime="11 mins ago"
        open={showError}
        onClose={closeError}
        close={closeError}
        bgWhite
      />*/}
      <Footer />
    </DashboardLayout>
  );
}

export default DDBDashboard;
