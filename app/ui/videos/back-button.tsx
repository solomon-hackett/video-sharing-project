"use client";
import { useRouter } from 'next/navigation';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BackButton() {
  const { back } = useRouter();
  return (
    <div className="mb-6">
      <button onClick={back} className="btn btn-ghost btn-sm">
        <ArrowLeftIcon className="controls-icon" />
        Back
      </button>
    </div>
  );
}
