import { FormSchema } from "../types/formTypes";

export const deleteMessageForm: FormSchema = {
  formId: "delete-message",
  formFields: {
    receiptHandle: {
      name: "receiptHandle",
      label: "Receipt Handle",
      type: "text",
      errorMsg: "Receipt Handle is required."
    }
  }
};