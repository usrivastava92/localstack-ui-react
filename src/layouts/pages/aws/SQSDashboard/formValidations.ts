import * as Yup from 'yup';
import { deleteMessageForm } from './forms';

const {
  formFields: { receiptHandle }
} = deleteMessageForm;

export const deleteMessageFormValidation = Yup.object().shape({
  [receiptHandle.name]: Yup.string().trim().required(receiptHandle.errorMsg)
});
