// formik components
import { ErrorMessage, Field, useFormikContext } from "formik";

// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import Switch from "@mui/material/Switch";
import { Autocomplete } from "@mui/material";

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

export function FormSwitch({ label, name }: Props): JSX.Element {
  const { setFieldValue, values } = useFormikContext();
  const getValue = (): boolean => {
    // @ts-ignore
    const value = values[name];
    if (typeof value !== "boolean") {
      throw Error(`value of FormSwitch element should only be boolean, found ${typeof value} -> ${value}`);
    }
    return value;
  };
  const toggleValue = () => setFieldValue(name, !getValue());
  return (
    <MDBox
      display="flex"
      justifyContent={{ md: "flex-start" }}
      alignItems="center"
      lineHeight={1}
    >
      <MDTypography variant="caption">
        {label}
      </MDTypography>
      <MDBox ml={1}>
        <Switch checked={getValue()} onChange={toggleValue} />
      </MDBox>
      <MDBox mt={0.75}>
        <MDTypography component="div" variant="caption" color="error" fontWeight="regular">
          {/* @ts-ignore */}
          <ErrorMessage name={name} />
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

interface FormSelectProps extends Props {
  options: string[];
}


export function FormSelect({ label, name, options, ...rest }: FormSelectProps): JSX.Element {
  const { setFieldValue, values } = useFormikContext();
  const getValue = (): string => {
    // @ts-ignore
    return values[name];
  };
  return (
    <MDBox mb={1.5}>
      <Autocomplete
        value={getValue()}
        options={options}
        onChange={(e, v) => {
          setFieldValue(name, v);
        }}
        renderInput={(params) => (
          <Field {...params} {...rest} name={name} as={MDInput} variant="standard" label={label} fullWidth />
        )} />
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
