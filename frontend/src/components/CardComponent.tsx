"use client";
import { User } from "@/utils/types";
import { apiUrl } from "@/utils/utils";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import UpdateUser from "./UpdateUser";

const CardComponent: React.FC<{ card: User }> = ({ card }) => {
  const router = useRouter();

  async function deleteUser(id: number) {
    const response = await fetch(`${apiUrl}/api/go/users/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      <div>Failed to delete data</div>;
    }
    console.log(response);
    router.refresh();
  }

  async function updateUser(id: number) {}
  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg p-2 mb-2 hover:bg-gray-100">
        <div className="text-sm text-gray-600">Id: {card.id}</div>
        <div className="text-lg font-semibold text-gray-800">{card.name}</div>
        <div className="text-md text-gray-700">{card.email}</div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => deleteUser(card.id)}
          className={"bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"}
        >
          Delete User
        </button>
        <UpdateUser user={card}/>
      </div>
    </div>
  );
};

export default CardComponent;
