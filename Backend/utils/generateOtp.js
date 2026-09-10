import crypto from "crypto";

const generateOTP = () => crypto.randomInt(100000, 1000000).toString();
export default generateOTP;