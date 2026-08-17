import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { getSiteImages } from "@/lib/get-site-images";
import { SiteImagesProvider } from "@/lib/site-images-context";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { images, logo, blurs, slides } = await getSiteImages();

  return (
    <SiteImagesProvider serverImages={images} serverLogo={logo} serverBlurs={blurs} serverSlides={slides}>
      <div className="flex flex-col min-h-screen">
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </SiteImagesProvider>
  );
}
