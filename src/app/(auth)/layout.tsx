import { getSiteImages } from "@/lib/get-site-images";
import { SiteImagesProvider } from "@/lib/site-images-context";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { images, logo, blurs, slides } = await getSiteImages();

  return (
    <SiteImagesProvider serverImages={images} serverLogo={logo} serverBlurs={blurs} serverSlides={slides}>
      {children}
    </SiteImagesProvider>
  );
}
