import * as yup from "yup";

export const idValidator = yup.string().max(30).required();
export const textValidator = yup.string().min(1).max(500).required();
export const emailValidator = yup.string().email().required();
export const nameValidator = yup.string().min(1).max(100).required();
export const urlValidator = yup.string().url().required();
export const fileValidator = yup.string().required();
export const numberValidator = yup.number().required();
export const ratingValidator = yup.number().max(5).min(1).required();
export const periodValidtor = yup.number().min(1).max(365).oneOf([1, 7, 28, 365], "Period has to be either 1, 7, 28, or 365").required();
export const otpValidtor = yup.string().min(1).max(6).required();

export const passwordValidator = yup
  .string()
  .required()
  .min(8)
  .max(20)
  .matches(/(?=.*[A-Z])/, "Password must have atleast one Uppercase Character")
  .matches(/(?=.*[0-9])/, "Password must have atleast one Number")
  .matches(/(?=.*[!@#\$%\^&\*])/, "Password must have atleast one Special Character");

export const confirmPasswordValidator = yup
  .string()
  .required("Confirm Password is a required field")
  .test("passwords-match", "Passwords must match", function (value) {
    return this.parent.Password === value;
  });

export const LoginSchema = yup
  .object()
  .shape({
    Password: passwordValidator,
    Email: emailValidator,
  })
  .required();

export type LoginFormData = yup.InferType<typeof LoginSchema>;

export const RegisterSchema = yup
  .object()
  .shape({
    ConfirmPassword: confirmPasswordValidator,
    Password: passwordValidator,
    Email: emailValidator,
    Name: nameValidator,
  })
  .required();

export type RegisterFormData = yup.InferType<typeof RegisterSchema>;

export const ForgetPasswordSchema = yup
  .object()
  .shape({
    Email: emailValidator,
  })
  .required();

export type ForgetPasswordFormData = yup.InferType<typeof ForgetPasswordSchema>;

export const ResetPasswordSchema = yup
  .object()
  .shape({
    OTP: otpValidtor,
    Password: passwordValidator,
  })
  .required();

export type ResetPasswordFormData = yup.InferType<typeof ResetPasswordSchema>;

export const TierSchema = yup
  .object()
  .shape({
    Period: periodValidtor,
    Price: numberValidator,
    Description: textValidator,
    Name: nameValidator,
  })
  .required();

export type TierFormData = yup.InferType<typeof TierSchema>;

export const ProductSchema = yup
  .object()
  .shape({
    Images: fileValidator,
    Link: urlValidator,
    Category: idValidator,
    Description: textValidator,
    Name: nameValidator,
    Logo: fileValidator,
  })
  .required();

export type ProductFormData = yup.InferType<typeof ProductSchema>;

export const UserSchema = yup
  .object()
  .shape({
    Image: fileValidator,
    Name: nameValidator,
    Email: emailValidator,
  })
  .required();

export type UserFormData = yup.InferType<typeof UserSchema>;

export const CommentSchema = yup
  .object()
  .shape({
    Comment: textValidator,
  })
  .required();

export type CommentFormData = yup.InferType<typeof CommentSchema>;

export const ReviewSchema = yup
  .object()
  .shape({
    Review: textValidator,
    Rating: numberValidator,
  })
  .required();

export type ReviewFormData = yup.InferType<typeof ReviewSchema>;
