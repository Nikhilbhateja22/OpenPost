import { useSelector } from "react-redux";
import { Alert, Button, Modal, TextInput, Label } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSucess,
} from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  // const [uploadComplete, setUploadComplete] = useState(false);
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          "Could not upload image (File must be less than 2MB)"
        );

        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
          // setUploadComplete(true);
        });
      }
    );
  };

  // useEffect(() => {
  //   if (uploadComplete) {
  //     PutData();
  //     setUploadComplete(false);
  //   }
  // }, [uploadComplete]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const PutData = async () => {
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setImageFileUploadProgress(null);
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError("Please wait for image to upload");
      return;
    }
    PutData();
  };
  useEffect(() => {
    if (updateUserSuccess) {
      const timeoutId = setTimeout(() => {
        setUpdateUserSuccess(null);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [updateUserSuccess]);

  const handleDeleteUser = async (e) => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch(`/api/user/signout`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSucess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full mt-14">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        ></input>
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              strokeWidth={3.5}
              styles={{
                root: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(242,94,92, ${imageFileUploadProgress / 100})`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-4 border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              "opacity-80"
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        <Label htmlFor="username" className=" block mb-[-12px] text-lg mx-1">
          <span className="text-gray-500">Username</span>
        </Label>
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        {/* <Button type="button" id="email" className=" bg-white text-black">
          {currentUser.email}
        </Button> */}
        <Label htmlFor="email" className=" block mb-[-12px] text-lg mx-1">
          <span className="text-gray-500">Email</span>
        </Label>
        <div
          id="email"
          className="text-sm sm:text-md dark:text-white border h-11 rounded-lg border-gray-400 dark:border-gray-600 dark:bg-gray-700"
        >
          <div className="rounded-lg px-2 pt-3">{currentUser.email}</div>
        </div>

        <TextInput
          type="password"
          id="password"
          placeholder="Change Password"
          onChange={handleChange}
        />

        {currentUser.isAdmin ? (
          <Button
            type="submit"
            gradientDuoTone="pinkToOrange"
            outline
            disabled={loading || imageFileUploading}
          >
            {loading ? "loading..." : "Update"}
          </Button>
        ) : (
          <Button
            type="submit"
            gradientDuoTone="purpleToBlue"
            outline
            disabled={loading || imageFileUploading}
          >
            {loading ? "loading..." : "Update"}
          </Button>
        )}

        {currentUser.isAdmin && (
          <Link to={"/create-post"}>
            <Button
              className="w-full"
              type="submit"
              gradientDuoTone="purpleToBlue"
            >
              Create a post
            </Button>
          </Link>
        )}
      </form>

      <div className="text-red-500 flex justify-between mt-5">
        <span
          onClick={() => {
            setShowModal(true);
          }}
          className="cursor-pointer hover:text-red-700"
        >
          Delete Account
        </span>
        <span
          onClick={handleSignout}
          className="cursor-pointer hover:text-red-700"
        >
          Sign Out
        </span>
      </div>
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}

      {/* {error && (
          <Alert color="failure" className="mt-5">
            {error}
          </Alert>
        )} */}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle
              className="h-14 w-14 text-gray-400
            dark:text-gray-200 mb-4 mx-auto"
            />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-grey-400">
              Are you sure you want to delete your account
            </h3>

            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
