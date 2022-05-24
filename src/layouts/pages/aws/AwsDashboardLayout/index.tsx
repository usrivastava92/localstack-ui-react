import MDBox from "../../../../components/MDBox";
import Grid from "@mui/material/Grid";
import Footer from "../../../../examples/Footer";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import MDTypography from "../../../../components/MDTypography";
import Icon from "@mui/material/Icon";
import MDButton from "../../../../components/MDButton";
import { ReactNode, useState } from "react";
import { Modal } from "@mui/material";
import { Form, Formik, FormikErrors, FormikTouched, FormikValues } from "formik";
import Card from "@mui/material/Card";
import FormField, { FormSelect, FormSwitch } from "../../users/new-user/components/FormField";
import * as Yup from "yup";
import { FormikHelpers } from "formik/dist/types";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { AWSProfile, awsRegions, nullAwsProfile } from "../types/awsTypes";
import AWSProfileContext from "../context";

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
  [key: string]: any;
}

const awsProfiles: AWSProfile[] = [
  {
    displayName: "localstack",
    accessKey: "a",
    secretKey: "a",
    region: "ap-southeast-1",
    endpoint: "http://localhost:4566",
    isDefault: true
  },
  { displayName: "second profile", accessKey: "1", secretKey: "2", region: "ap-southeast-2", isDefault: false },
  { displayName: "third profile", accessKey: "1", secretKey: "2", region: "ap-southeast-3", isDefault: false }
];

const addProfileForm: FormSchema = {
  formId: "add-aws-profile",
  formFields: {
    accessKey: {
      name: "accessKey",
      label: "Access Key *",
      type: "text",
      errorMsg: "Access Key is required."
    },
    secretKey: {
      name: "secretKey",
      label: "Secret Key *",
      type: "text",
      errorMsg: "Secret Key is required.",
      placeholder: ""
    },
    region: {
      name: "region",
      label: "Region *",
      type: "text",
      errorMsg: "Invalid AWS Region",
      placeholder: ""
    },
    sessionToken: {
      name: "sessionToken",
      label: "Session Token",
      type: "text",
      errorMsg: "",
      placeholder: "Session Token (Optional)"
    },
    endpoint: {
      name: "endpoint",
      label: "Endpoint",
      type: "text",
      errorMsg: "",
      placeholder: "Endpoint (Optional)"
    },
    isDefault: {
      name: "isDefault",
      label: "Use this as default ",
      type: "text",
      errorMsg: "Default option can only be true/false",
      placeholder: ""
    }
  }
};

const { formFields: { accessKey, secretKey, sessionToken, endpoint, region, isDefault } } = addProfileForm;

const initialValues: ValuesSchema = {
  [accessKey.name]: "",
  [secretKey.name]: "",
  [sessionToken.name]: "",
  [endpoint.name]: "",
  [region.name]: nullAwsProfile.region,
  [isDefault.name]: false
};

const mutableListAwsRegions = [...awsRegions];
const addProfileFormValidation = Yup.object().shape({
  [accessKey.name]: Yup.string().trim().required(accessKey.errorMsg),
  [secretKey.name]: Yup.string().trim().required(secretKey.errorMsg),
  [region.name]: Yup.string().trim().required(region.errorMsg).oneOf(mutableListAwsRegions, region.errorMsg),
  [isDefault.name]: Yup.string().trim().required(isDefault.errorMsg).oneOf(["true", "false"], isDefault.errorMsg)
});

function AddAwsProfileForm(formData: FormDataSchema): JSX.Element {

  const { formFields, values, errors, touched } = formData;
  const { accessKey, secretKey, sessionToken, endpoint, region } = formFields;
  const {
    accessKey: accessKeyV,
    secretKey: secretKeyV,
    sessionToken: sessionTokenV,
    endpoint: endpointV,
    region: regionV
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
            <FormSelect
              options={mutableListAwsRegions}
              label={region.label}
              name={region.name}
              value={regionV}
              placeholder={region.placeholder}
              error={errors.region && touched.region}
              success={regionV.length > 0 && !errors.region}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type={sessionToken.type}
              label={sessionToken.label}
              name={sessionToken.name}
              value={sessionTokenV}
              placeholder={sessionToken.placeholder}
              error={errors.sessionToken && touched.sessionToken}
              success={sessionTokenV.length > 0 && !errors.sessionToken}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormField
              type={endpoint.type}
              label={endpoint.label}
              name={endpoint.name}
              value={endpointV}
              placeholder={endpoint.placeholder}
              error={errors.endpoint && touched.endpoint}
              success={endpointV.length > 0 && !errors.endpoint}
            />
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

function getDefaultAWSProfile(): AWSProfile {
  const defaultProfile = awsProfiles.find(awsProfile => awsProfile.isDefault);
  return defaultProfile ? defaultProfile : nullAwsProfile;
}

function AwsDashboardLayout({ children }: { children: ReactNode }): JSX.Element {

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [activeAwsProfile, setActiveAwsProfile] = useState<AWSProfile>(getDefaultAWSProfile());

  const closeError = () => setShowError(false);
  const handleAddNewProfile = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleProfileChange = (displayName: string) => {
    const selectedProfile = awsProfiles.find(awsProfile => awsProfile.displayName === displayName);
    setActiveAwsProfile(selectedProfile ? { ...selectedProfile } : nullAwsProfile);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const submitForm = async (values: any, actions: any) => {
    await sleep(1000);
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(values, null, 2));
    actions.setSubmitting(false);
    actions.resetForm();
  };

  const handleSubmit = (values: ValuesSchema, actions: FormikHelpers<ValuesSchema>) => submitForm(values, actions);

  return (
    <AWSProfileContext.Provider value={activeAwsProfile}>
      <DashboardLayout>
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description">
          <MDBox py={3} mb={20} height="65vh">
            <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
              <Grid item xs={12} lg={8}>
                <Formik initialValues={initialValues} validationSchema={addProfileFormValidation}
                        onSubmit={handleSubmit}>
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
                            <MDBox mt={2} width="100%" display="flex" justifyContent="space-between">
                              <FormSwitch
                                type={isDefault.type}
                                label={isDefault.label}
                                name={isDefault.name}
                              />
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
              <MDTypography variant="h5">AWS Profile</MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDTypography variant="body2" color="text">
                Create a new profile / Choose an existing one
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={5} sx={{ textAlign: "right" }} display="flex" justifyContent="right">
            <Autocomplete
              sx={{ mr: 2, width: 200, boxShadow: 2, borderRadius: 3 }}
              value={activeAwsProfile.displayName}
              onChange={(event, value) => handleProfileChange(value as string)}
              options={awsProfiles.map(profile => profile.displayName)}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Active Profile" fullWidth />
              )}
            />
            <MDButton variant="gradient" color="info" onClick={handleAddNewProfile}>
              <Icon>add</Icon>&nbsp; Add New
            </MDButton>
          </Grid>
        </Grid>

        {children}

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
    </AWSProfileContext.Provider>
  );
}

export default AwsDashboardLayout;
