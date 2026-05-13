import { headers } from 'next/headers';

import { auth } from '@/app/lib/auth';

export default async function UserPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
}
