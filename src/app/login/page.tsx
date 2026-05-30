import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">BookLeaf</h1>
          <p className="mt-2 text-gray-600">Author Support Portal</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>
          <LoginForm />
        </div>
        <p className="text-center mt-6 text-xs text-gray-400">
          BookLeaf Publishing — Author Support & Communication Portal
        </p>
      </div>
    </div>
  );
}
