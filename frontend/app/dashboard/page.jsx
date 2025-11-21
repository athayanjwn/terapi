import { cookies } from "next/headers";

export default function Dashboard() {

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div>
      <div>
        <h1>Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="p-6">
        <p>Selamat datang!</p>
      </div>
    </div>
  );
}
