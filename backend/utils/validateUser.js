import { body } from "express-validator";

export const validateSignup = [
  body("username").not().isEmpty().withMessage("username is required"),
  body("fullName").not().isEmpty().withMessage("fullName is required"),
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters")
    .isStrongPassword()
    .withMessage(
      "Password must contains at least one upper case , one lower case and symbol "
    ),
];
export const validateNewPassword = body("newPassword")
  .isLength({ min: 8 })
  .withMessage("New password must be at least 8 characters")
  .isStrongPassword()
  .withMessage(
    " New Password must contains at least one upper case , one lower case and symbol "
  );
