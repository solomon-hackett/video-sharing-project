import Form from "@/app/ui/auth/login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [callbackUrl: string]: string }>;
}) {
  const callback = (await searchParams).callbackUrl ?? "/";
  return (
    <main>
      <Form callbackUrl={callback} />
    </main>
  );
}
