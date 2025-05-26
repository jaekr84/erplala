import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-3xl font-semibold text-gray-800 mb-10 tracking-tight">
          Bienvenido al ERP <span className="text-blue-600">Lalá</span>
        </h1>
      </div>
    </div>
  );
}