import { FormSchema } from "../types/formTypes";

export const addProfileForm: FormSchema = {
  formId: "add-aws-profile",
  formFields: {
    displayName: {
      name: "displayName",
      label: "Display Name *",
      type: "text",
      errorMsg: "Display Name is required."
    },
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