import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { prisma } from "@/lib/prisma";
import { NeumorphicCard } from "@/components/ui/surface";
import { PostForm } from "@/components/classwork/post-form";

export default async function EditClassworkPage({
  params,
}: {
  params: Promise<{ classId: string; postId: string }>;
}) {
  const { classId, postId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);
  if (cls.ownerId !== user.id) notFound();

  const [post, topics] = await Promise.all([
    prisma.post.findUnique({ where: { id: postId } }),
    prisma.topic.findMany({ where: { classId }, orderBy: { order: "asc" } }),
  ]);

  if (!post || post.classId !== classId || post.type === "ANNOUNCEMENT") notFound();

  return (
    <NeumorphicCard className="max-w-2xl flex flex-col gap-2">
      <h1 className="text-xl font-bold text-[var(--text-primary)]">Edit {post.type === "ASSIGNMENT" ? "assignment" : "material"}</h1>
      <PostForm
        classId={classId}
        postId={post.id}
        type={post.type as "ASSIGNMENT" | "MATERIAL"}
        topics={topics}
        initial={{
          title: post.title,
          body: post.body,
          topicId: post.topicId,
          dueAt: post.dueAt,
          points: post.points,
        }}
      />
    </NeumorphicCard>
  );
}
