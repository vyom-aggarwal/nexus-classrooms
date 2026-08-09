import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-end p-6">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-6">{children}</div>
    </div>
  );
}
