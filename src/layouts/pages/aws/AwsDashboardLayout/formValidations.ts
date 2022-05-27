import * as Yup from 'yup';
import { addProfileForm } from './forms';
import { awsRegions } from '../types/awsTypes';

const {
  formFields: { displayName, accessKey, secretKey, region, isDefault }
} = addProfileForm;

export const addProfileFormValidation = Yup.object().shape({
  [displayName.name]: Yup.string().trim().required(displayName.errorMsg),
  [accessKey.name]: Yup.string().trim().required(accessKey.errorMsg),
  [secretKey.name]: Yup.string().trim().required(secretKey.errorMsg),
  [region.name]: Yup.string()
    .trim()
    .required(region.errorMsg)
    .oneOf([...awsRegions], region.errorMsg),
  [isDefault.name]: Yup.string()
    .trim()
    .required(isDefault.errorMsg)
    .oneOf(['true', 'false'], isDefault.errorMsg)
});
