import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleLoginButton() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/google", {
        token: credentialResponse.credential,
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      alert("Đăng nhập thành công!");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
    />
  );
}
