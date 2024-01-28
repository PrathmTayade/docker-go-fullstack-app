import CardComponent from "@/components/CardComponent";
import { User } from "@/utils/types";
import Image from "next/image";

export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${apiUrl}/api/go/users`, {
    cache: "no-store",
  });
  const users: User[] = await response.json();
  if (!response.ok) {
    <div>Failed to fetch data</div>;
  }
  return (
    <main className="flex bg-cyan-500 min-h-screen flex-col items-center justify-between p-24">
      <div className="relative">
        <Image
          width={200}
          height={200}
          priority={true}
          className="rounded-full mb-6 mx-auto"
          src={"/gologo.svg"}
          alt={"Go logo"}
        />
      </div>
      <h2 className="text-xl font-bold text-center text-white mb-6">
        Go Backend
      </h2>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex gap-3 items-center justify-between bg-white p-4 rounded-lg shadow"
          >
            <CardComponent card={user} />
            <div className="flex flex-col gap-2">
              <button
                // onClick={() => deleteUser(user.id)}
                className={
                  "bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
                }
              >
                Delete User
              </button>
              <button
                // onClick={() => update(user.id)}
                className={
                  "bg-cyan-700 hover:bg-blue-600 text-white py-2 px-4 rounded"
                }
              >
                Update User
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
