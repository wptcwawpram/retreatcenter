import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { getSiteImages } from "@/lib/get-site-images";
import { SiteImagesProvider } from "@/lib/site-images-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { images, logo, blurs, slides } = await getSiteImages();

  return (
    <SiteImagesProvider serverImages={images} serverLogo={logo} serverBlurs={blurs} serverSlides={slides}>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardTopbar />
          <main className="flex-1 overflow-y-auto bg-luxury/60 backdrop-blur-sm p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SiteImagesProvider>
  );
}
