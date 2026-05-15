import { Metadata } from "next";

import FYP from "@/app/ui/videos/home/fyp";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to SoloStream, my mini streaming platform project.",
};

export default function Page() {
  return (
    <main>
      <FYP />
    </main>
  );
}
