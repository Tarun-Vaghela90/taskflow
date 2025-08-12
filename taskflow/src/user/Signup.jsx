import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormInput from "../components/form/FormInput";
import { Button, Radio } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useHttpClient } from "../shared/hooks/http-hook";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  email: yup.string().email().required("Email is Required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is Required"),
  fullName: yup.string().required("Full Name is Required"),
  status: yup.boolean().required("Please select a role"),
});

const Signup = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("Token"); // if you need to send a token

      const response = await sendRequest(
        "http://localhost:3000/api/v1/users/signup",
        "POST",
        JSON.stringify({
          fullName: data.fullName, // ✅ correct case
          email: data.email,
          password: data.password,
          isAdmin: data.status, // ✅
        }),
        {
          "Content-Type": "application/json",
          Token: token ? token : "", // ✅ send token header if present
        }
      );

      localStorage.setItem("Token", response.token);
      toast.success("Account Created Successfully");
      navigate("/admin/dashboard");
    } catch (err) {
      console.log(err);

      const serverErrors = err?.message;

      if (Array.isArray(serverErrors)) {
        serverErrors.forEach((e) => {
          toast.error(`${e.path}: ${e.msg}`);
        });
      } else {
        toast.error(serverErrors || "Something went wrong");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">Signup</h2>

        <div className="mb-4">
          <FormInput
            label="Full Name"
            name="fullName" // ✅ correct field name
            type="text"
            register={register}
            required
            error={errors.fullName}
            placeholder="Enter Full Name"
          />
        </div>

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

        {/* ✅ Admin/User Radio Group */}
        <div className="mb-4">
          <label className="mb-1 font-medium text-gray-700">Select Role</label>
          <Radio.Group
            onChange={(e) => setValue("status", e.target.value)}
            value={watch("status")}
          >
            <Radio value={true}>Admin</Radio>
            <Radio value={false}>User</Radio>
          </Radio.Group>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          className="w-full mt-4"
          loading={isLoading}
        >
          Submit
        </Button>

        <div className="mt-5">
          <p className="text-sm">
            Have an account?{" "}
            <Link className="text-blue-800" to={"/"}>
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
