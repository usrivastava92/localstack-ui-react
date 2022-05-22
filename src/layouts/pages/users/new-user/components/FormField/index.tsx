// formik components
import { ErrorMessage, Field } from "formik";

// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";

// Declaring props types for FormField
interface Props {
  label: string;
  name: string;

  [key: string]: any;
}

function FormField({ label, name, ...rest }: Props): JSX.Element {
  return (
    <MDBox mb={1.5}>
      <Field {...rest} name={name} as={MDInput} variant="standard" label={label} fullWidth />
      <MDBox mt={0.75}>
        <MDTypography component="div" variant="caption" color="error" fontWeight="regular">
          {/* @ts-ignore */}
          <ErrorMessage name={name} />
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

export default FormField;
