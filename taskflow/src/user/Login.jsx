import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormInput from "../components/form/FormInput";
import { Button } from "antd";
import { useHttpClient } from "../shared/hooks/http-hook";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../shared/hooks/ThemeContext";

const schema = yup.object().shape({
  email: yup.string().email().required("Email is Required"),
  password: yup.string().required("Password is Required"),
});

const Login = () => {


const{login} = useTheme();

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // ✅ Submit Handler
  const onSubmit = async (data) => {
    try {
      const response = await sendRequest(
        "http://localhost:3000/api/v1/users/login",
        "POST",
        JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        {
          "Content-Type": "application/json",
        }
      );

      login(response.token)
      toast.success('Login Successfully')
      navigate('/admin/dashboard')
    } catch (err) {
      
      toast.error('Something Went Wrong')
      console.log(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Login
        </h2>

        <div className="mb-4">
          <FormInput
            label="Email"
            name="email"
            type="email"
            register={register}
            required
            error={errors.email}
            placeholder="Enter Email"
          />
        </div>

        <div className="mb-4">
          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            required
            error={errors.password}
            placeholder="Enter Password"
          />
        </div>

        <Button
          type="primary"
          htmlType="submit"
          className="w-full mt-4"
          loading={isLoading}
        >
          Login
        </Button>
          <div className="mt-5">
            <p className="text-sm">Dont Have Account ? <Link className="text-blue-800" to={'/signup'}>Create Account</Link></p>
          </div>
      </form>
    </div>
  );
};

export default Login;
