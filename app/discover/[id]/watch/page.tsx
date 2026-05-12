export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = await params;
  const id = searchParams.id;
  return <main>{id}</main>;
}
