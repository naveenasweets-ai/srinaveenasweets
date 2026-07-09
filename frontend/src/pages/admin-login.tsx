// AdminLogin.jsx
import  { useState } from "react";
import AuthApi from "../api/auth";

const AdminLogin = () => {
  const { adminLogin } = AuthApi(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-background">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          adminLogin(email, password);
        }}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold text-center text-primary mb-6">
          Admin Login
        </h2>

        <label className="block text-text text-sm mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-muted rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-primary-light"
        />

        <label className="block text-text text-sm mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-muted rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-primary-light"
        />

        <button
          type="submit"
          className="w-full bg-primary text-surface py-2 rounded-md hover:bg-primary-dark transition-colors text-white! font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
