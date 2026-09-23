import mongoose from "mongoose";
import { registerUser, loginUser, verifyOtp } from "./Controller/authController.js";

async function run() {
  await mongoose.connect("mongodb+srv://mern:PZfCpjgWSjXJJQEB@cluster0.5cn0oid.mongodb.net/?appName=Cluster0");
  
  const email2 = `test2_direct_${Date.now()}@example.com`;
  
  const makeReqRes = (body) => {
    let statusCode = 200;
    let jsonBody = null;
    return {
      req: { body },
      res: {
        status: function(s) { statusCode = s; return this; },
        json: function(j) { jsonBody = j; return this; },
        _get: () => ({ status: statusCode, data: jsonBody })
      }
    };
  };

  try {
    let { req, res } = makeReqRes({ name: "Test 2 Direct", email: email2, password: "OldPassword1!" });
    await registerUser(req, res);
    console.log("Register 1:", res._get().status);
    
    let { req: req2, res: res2 } = makeReqRes({ name: "Test 2 Direct Updated", email: email2, password: "NewPassword1!" });
    await registerUser(req2, res2);
    console.log("Register 2:", res2._get().status);
    
    const User = mongoose.model("User");
    let u = await User.findOne({ email: email2 });
    console.log("User in DB:", !!u, "Name:", u?.name, "OTP generated:", !!u?.otp);
    
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
