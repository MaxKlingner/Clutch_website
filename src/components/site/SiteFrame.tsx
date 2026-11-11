import Footer from "@/components/Footer";
import SiteHeader from "@/components/site/SiteHeader";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f8] text-[#0f1c1a]">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
