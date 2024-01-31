"use client";
import { FC, useState } from "react";
import Modal from "react-modal";
import { User } from "@/utils/types";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/utils/utils";
import axios from "axios";

interface UpdateUserProps {
  user: User;
}

interface FormData {
  name: string;
  email: string;
}

const schema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "email must be a string",
    })
    .email("Invalid email address"),
});
const UpdateUser: FC<UpdateUserProps> = ({ user }) => {
  const [modalIsOpen, setIsOpen] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user.email,
      name: user.name,
    },
  });

  const router = useRouter();

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleUpdateUser: SubmitHandler<FormData> = async (data) => {
    const payload = {
      id: user.id,
      name: data.name,
      email: data.email,
    };
    const res = await axios.put(`${apiUrl}/api/go/users/${user.id}`, payload);
    if (res.status) {
      reset({ email: "", name: "" });
      closeModal()
      router.refresh();
    }
  };
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  return (
    <div>
      <button
        onClick={openModal}
        className={"bg-cyan-700 hover:bg-cyan-600 text-white py-2 px-4 rounded"}
      >
        Update User
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={customStyles}
        // className={"text-black"}
      >
        <form
          onSubmit={handleSubmit(handleUpdateUser)}
          className=" p-4 border rounded bg-white text-gray-950"
        >
          <div className="mb-4 text-sm">
            <label
              htmlFor="name"
              className="block text-gray-600 font-semibold mb-2"
            >
              Name
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="name"
                  className={`w-full h-8 p-2 border text-black${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded`}
                  placeholder="Enter your name"
                />
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4 text-sm">
            <label
              htmlFor="email"
              className="block text-gray-600 font-semibold mb-2"
            >
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  id="email"
                  className={`w-full h-8 p-2 border text-black${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded`}
                  placeholder="Enter your email"
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Update
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UpdateUser;
