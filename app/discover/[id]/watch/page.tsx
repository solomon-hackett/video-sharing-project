import BackButton from '@/app/ui/videos/back-button';
import IndividualVideo from '@/app/ui/videos/individual-video';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return (
    <main className="container-md page-content">
      <BackButton />
      {/* Video content */}
      <IndividualVideo id={id} />
    </main>
  );
}
