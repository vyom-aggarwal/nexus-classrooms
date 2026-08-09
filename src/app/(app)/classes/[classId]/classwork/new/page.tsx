import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { prisma } from "@/lib/prisma";
import { NeumorphicCard } from "@/components/ui/surface";
import { PostForm } from "@/components/classwork/post-form";

export default async function NewClassworkPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { classId } = await params;
  const { type } = await searchParams;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);

  if (cls.ownerId !== user.id) notFound();
  if (type !== "ASSIGNMENT" && type !== "MATERIAL") notFound();

  const topics = await prisma.topic.findMany({ where: { classId }, orderBy: { order: "asc" } });

  return (
    <NeumorphicCard className="max-w-2xl flex flex-col gap-2">
      <h1 className="text-xl font-bold text-[var(--text-primary)]">
        {type === "ASSIGNMENT" ? "New assignment" : "New material"}
      </h1>
      <PostForm classId={classId} type={type} topics={topics} />
    </NeumorphicCard>
  );
}
