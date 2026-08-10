import Link from "next/link";
import { format } from "date-fns";
import { MessageSquare, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { getJoinableMeeting } from "@/lib/queries/meetings";
import { EmptyState } from "@/components/empty-state";
import { AnnouncementComposer } from "@/components/classes/announcement-composer";
import { PostCard } from "@/components/classes/post-card";
import { NeumorphicCard, Surface } from "@/components/ui/surface";
import { neumorphicButtonClasses } from "@/components/ui/button";

export default async function ClassStreamPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);
  const isOwner = cls.ownerId === user.id;

  const [posts, liveEvent] = await Promise.all([
    prisma.post.findMany({
      where: { classId, status: "PUBLISHED" },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getJoinableMeeting(user.id, classId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      {liveEvent && (
        <Surface variant="raised" glow="accent" className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Surface
              variant="raised"
              depth="sm"
              rounded="control"
              className="h-11 w-11 shrink-0 flex items-center justify-center text-[var(--accent-foreground)] bg-[linear-gradient(145deg,var(--accent-hover),var(--accent))]"
            >
              <Video size={20} />
            </Surface>
            <div className="min-w-0">
              <p className="font-semibold text-[var(--text-primary)] truncate">{liveEvent.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Starting soon · {format(liveEvent.startAt, "h:mm a")}
              </p>
            </div>
          </div>
          <Link href={`/meet/${liveEvent.id}`} className={neumorphicButtonClasses({ variant: "primary" })}>
            Join now
          </Link>
        </Surface>
      )}

      {isOwner && (
        <NeumorphicCard>
          <AnnouncementComposer classId={classId} />
        </NeumorphicCard>
      )}

      {posts.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={28} />}
          title="No posts yet"
          description={
            isOwner
              ? "Announcements, assignments, and materials you post will show up here."
              : "Your teacher hasn't posted anything yet."
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              type={post.type}
              title={post.title}
              body={post.body}
              authorName={post.author.name}
              createdAt={post.createdAt}
              dueAt={post.dueAt}
              points={post.points}
            />
          ))}
        </div>
      )}
    </div>
  );
}
