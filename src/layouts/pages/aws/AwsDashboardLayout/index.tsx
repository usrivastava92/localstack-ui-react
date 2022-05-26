import MDBox from "../../../../components/MDBox";
import Grid from "@mui/material/Grid";
import Footer from "../../../../examples/Footer";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import MDTypography from "../../../../components/MDTypography";
import Icon from "@mui/material/Icon";
import MDButton from "../../../../components/MDButton";
import { ReactNode, useState } from "react";
import { Modal } from "@mui/material";
import { Form, Formik } from "formik";
import Card from "@mui/material/Card";
import FormField, { FormSelect, FormSwitch } from "../../users/new-user/components/FormField";
import { FormikHelpers } from "formik/dist/types";
import Autocomplete from "@mui/material/Autocomplete";
import { awsProfileStorageService } from "../../../../services/StorageService";
import { AWSProfile, awsRegions, nullAwsProfile } from "../types/awsTypes";
import { AWSProfileContext } from "context";
import MDInput from "../../../../components/MDInput";
import MDSnackbar, { SBProps } from "../../../../components/MDSnackbar";
import { defaultSBProps, getSuccessSBProps } from "../utils/notificationUtils";
import { FormDataSchema, ValuesSchema } from "../types/formTypes";
import { addProfileForm } from "./forms";
import { addProfileFormValidation } from "./formValidations";

const { formFields: { displayName, accessKey, secretKey, sessionToken, endpoint, region, isDefault } } = addProfileForm;

const initialValues: ValuesSchema = {
  [displayName.name]: "",
  [accessKey.name]: "",
  [secretKey.name]: "",
  [sessionToken.name]: "",
  [endpoint.name]: "",
  [region.name]: nullAwsProfile.region,
  [isDefault.name]: false
};

const mutableListAwsRegions = [...awsRegions];

function AddAwsProfileForm({ formData }: { formData: FormDataSchema }): JSX.Element {

  const { formFields, values, errors, touched } = formData;
  const { displayName, accessKey, secretKey, sessionToken, endpoint, region, isDefault } = formFields;
  const {
    displayName: displayNameV,
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
              type={displayName.type}
              label={displayName.label}
              name={displayName.name}
              value={displayNameV}
              placeholder={displayName.placeholder}
              error={errors.displayName && touched.displayName}
              success={displayNameV.length > 0 && !errors.displayName}
            />
          </Grid>
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
          <Grid item xs={12} sm={6}>
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

function getDefaultAWSProfile(awsProfiles: AWSProfile[]): AWSProfile {
  const defaultProfile = awsProfiles.find(awsProfile => awsProfile.isDefault);
  return defaultProfile ? defaultProfile : nullAwsProfile;
}

interface AwsDashboardProps {
  children: ReactNode,
  title?: string,
  subTitle?: string
}

function AwsDashboardLayout({ children, title, subTitle }: AwsDashboardProps): JSX.Element {

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [awsProfiles, setAwsProfiles] = useState<AWSProfile[]>(awsProfileStorageService.loadFromLocalStorage());
  const [activeAwsProfile, setActiveAwsProfile] = useState<AWSProfile>(getDefaultAWSProfile(awsProfiles));
  const [sbProps, setSBProps] = useState<SBProps>(defaultSBProps);

  const handleAddNewProfile = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleProfileChange = (displayName: string) => {
    const selectedProfile = awsProfiles.find(awsProfile => awsProfile.displayName === displayName);
    setActiveAwsProfile(selectedProfile ? { ...selectedProfile } : nullAwsProfile);
  };

  const submitForm = async (values: AWSProfile, actions: any) => {
    const newAwsProfiles = [...awsProfiles, values];
    awsProfileStorageService.saveToLocalStorage(newAwsProfiles);
    setAwsProfiles(newAwsProfiles);
    setSBProps(getSuccessSBProps({
      title: "AWS Dashboard",
      content: "Successfully created profile",
      open: true,
      onClose: () => setSBProps(defaultSBProps),
      close: () => setSBProps(defaultSBProps)
    }));
    actions.setSubmitting(false);
    actions.resetForm();
  };

  const handleSubmit = (values: ValuesSchema, actions: FormikHelpers<ValuesSchema>) => submitForm(values as AWSProfile, actions);

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
                              formData={{
                                formFields: addProfileForm.formFields,
                                errors: errors,
                                touched: touched,
                                values: values
                              }}
                            />
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
              <MDTypography variant="h5">{title}</MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDTypography variant="body2" color="text">
                {subTitle}
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={5} sx={{ textAlign: "right" }} display="flex" justifyContent="right">
            <Autocomplete
              disableClearable
              sx={{ mr: 2, width: "12rem", boxShadow: 1, borderRadius: 3 }}
              value={activeAwsProfile.displayName}
              onChange={(event, value) => handleProfileChange(value as string)}
              options={awsProfiles.map(profile => profile.displayName)}
              renderInput={(params) => <MDInput {...params} label="Active Profile" fullWidth />}
            />
            <MDButton variant="gradient" color="info" onClick={handleAddNewProfile}>
              <Icon>add</Icon>&nbsp; Add New
            </MDButton>
          </Grid>
        </Grid>

        {children}

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
        <Footer />
      </DashboardLayout>
    </AWSProfileContext.Provider>
  );
}

export default AwsDashboardLayout;
