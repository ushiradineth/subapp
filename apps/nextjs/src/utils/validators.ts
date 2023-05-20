import * as yup from "yup";

export const idValidator = yup.string().length(24).required();
export const textValidator = yup.string().min(1).max(500).required();
export const emailValidator = yup.string().email().required();
export const nameValidator = yup.string().min(1).max(100).required();
export const passwordValidator = yup
  .string()
  .required()
  .min(8)
  .max(20)
  .matches(/(?=.*[A-Z])/, "Password must have atleast one Uppercase Character")
  .matches(/(?=.*[0-9])/, "Password must have atleast one Number")
  .matches(/(?=.*[!@#\$%\^&\*])/, "Password must have atleast one Special Character");