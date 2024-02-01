"use client";
// CreateUserComponent.tsx
import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { apiUrl } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";

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
})

const CreateUser: React.FC = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const router = useRouter();
  const handleCreateUser: SubmitHandler<FormData> = async (data) => {
    console.log("User data:", data);
    // Add additional logic here if needed
    const res = await axios.post(`${apiUrl}/api/go/users`, data);
    if (res.status) {
      reset({ email: "", name: "" });
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleCreateUser)}
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
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Create User
      </button>
    </form>
  );
};

export default CreateUser;
