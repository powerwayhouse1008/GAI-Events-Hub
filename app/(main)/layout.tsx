import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
