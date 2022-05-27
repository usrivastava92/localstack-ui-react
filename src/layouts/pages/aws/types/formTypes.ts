import { FormikErrors, FormikTouched, FormikValues } from 'formik';

export interface FormFieldSchema {
  placeholder?: string;
  name: string;
  label: string;
  type: string;
  errorMsg: string;
}

export interface FormSchema {
  formId: string;
  formFields: {
    [key: string]: FormFieldSchema;
  };
}

export interface FormDataSchema {
  values: FormikValues;
  touched: FormikTouched<FormikValues>;
  formFields: {
    [key: string]: FormFieldSchema;
  };
  errors: FormikErrors<FormikValues>;
}

export interface ValuesSchema {
  [key: string]: any;
}
