import { redirect } from "next/navigation";

export default async function RoutesIndex({ params }: PageProps<"/[lang]/admin/routes">) {
  const { lang } = await params;
  redirect(`/${lang}/admin/routes/24`);
}
