import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import OAuth from '../components/OAuth.jsx';
export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  // console.log(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.email) {
      setErrorMessage("Please fill out all fields");
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setErrorMessage(data.message);
      }
      setLoading(false);

      if (res.ok) {
        navigate("/sign-in  ");
      }
    } catch (err) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex p-3 max-w-fit gap-8 mx-auto flex-col md:flex-row md:gap-20 pt-52">
        {/* left part */}
        <div className="flex-1 md:mt-24 max-w-lg">
          <Link to={"/"} className="font-bold dark:text-white text-4xl">
            <span className=" text-[rgb(151,151,162)]">
            Open
            </span>
            Post
          </Link>
          <p className="text-sm mt-5">
          This is a demo project. You can sign in with <strong className=" text-green-500">ADMIN</strong> email <strong className=" text-green-500">user@gmail.com</strong> and password <strong className=" text-green-500">1234 </strong> 
           or with Google
          </p>
        </div>

        {/* RIGHT PART */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your Username"></Label>
              <TextInput
                type="text"
                placeholder="Username"
                id="username"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your Email"></Label>
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your Password"></Label>
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
              />
            </div>
            <Button
              gradientDuoTone="purpleToBlue"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            <div className="flex items-center justify-center">
              <div className="border-t border-gray-400 flex-grow"></div>
              <span className="mx-4 text-gray-500">or</span>
              <div className="border-t border-gray-400 flex-grow"></div>
            </div>
            <OAuth />
          </form>

          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to={"/sign-in"} className="text-blue-700">
              Sign In
            </Link>
          </div>

          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
