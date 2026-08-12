import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => {
          try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    },
  );
}

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;

    if (!file || !path) {
      return NextResponse.json({ error: "File and path are required" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF files are allowed." }, { status: 400 });
    }

    const supabase = createServiceClient();

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `site-images/${path.replace(/[\[\].]/g, "-")}-${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      if (uploadError.message?.includes("not found") || uploadError.message?.includes("does not exist")) {
        const { error: createError } = await supabase.storage.createBucket("public-assets", {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        });
        if (createError && !createError.message?.includes("already exists")) {
          throw createError;
        }

        const { error: retryError } = await supabase.storage
          .from("public-assets")
          .upload(storagePath, buffer, { contentType: file.type, upsert: true });
        if (retryError) throw retryError;
      } else {
        throw uploadError;
      }
    }

    const { data: urlData } = supabase.storage
      .from("public-assets")
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    const { error: settingsError } = await supabase
      .from("settings")
      .upsert({
        key: `site_image:${path}`,
        value: publicUrl,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });

    if (settingsError) throw settingsError;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
