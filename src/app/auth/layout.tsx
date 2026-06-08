export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF5E8] text-[#1A1A2E] px-4 py-12 selection:bg-[#D8615C] selection:text-white">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
