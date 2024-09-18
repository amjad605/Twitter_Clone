import jwt from "jsonwebtoken";
export const generateTokenAndSetCookie = (id, res) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });
    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, //15 days in milliseconds
      httpOnly: true, //prevents client side javascript from reading the cookie
      sameSite: "strict", //csrf protection
      secure: process.env.NODE_ENV === "production", //cookie will only be set in https in production
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};
