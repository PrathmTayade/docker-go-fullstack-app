import CardComponent from "@/components/CardComponent";
import CreateUser from "@/components/CreateUser";
import { User } from "@/utils/types";
import { apiUrl } from "@/utils/utils";
import Image from "next/image";

export default async function Home() {
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

      <div className="gap-3 grid grid-cols-3 grid-flow-row">
        <CreateUser />
        {users.map((user) => (
          <div
            key={user.id}
            className="flex gap-3 items-center justify-between bg-white p-4 rounded-lg shadow"
          >
            <CardComponent card={user} />
            
          </div>
        ))}
      </div>
    </main>
  );
}
