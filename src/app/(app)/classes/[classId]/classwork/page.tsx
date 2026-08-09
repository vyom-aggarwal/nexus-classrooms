import Link from "next/link";
import { format } from "date-fns";
import { ClipboardList, Plus, FileText, ClipboardCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { getClasswork } from "@/lib/queries/classwork";
import { EmptyState } from "@/components/empty-state";
import { NeumorphicCard } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/classwork/status-badge";
import { NewTopicButton } from "@/components/classwork/new-topic-button";

export default async function ClassClassworkPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);
  const isOwner = cls.ownerId === user.id;

  const { topics, posts } = await getClasswork(classId, isOwner, user.id);

  const grouped = [
    { id: null as string | null, title: "General", posts: posts.filter((p) => !p.topicId) },
    ...topics.map((t) => ({ id: t.id, title: t.title, posts: posts.filter((p) => p.topicId === t.id) })),
  ].filter((g) => g.posts.length > 0 || g.id === null);

  return (
    <div className="flex flex-col gap-6">
      {isOwner && (
        <div className="flex flex-wrap gap-3">
          <Link href={`/classes/${classId}/classwork/new?type=ASSIGNMENT`}>
            <NeumorphicButton variant="primary">
              <Plus size={18} />
              New assignment
            </NeumorphicButton>
          </Link>
          <Link href={`/classes/${classId}/classwork/new?type=MATERIAL`}>
            <NeumorphicButton variant="raised">
              <Plus size={18} />
              New material
            </NeumorphicButton>
          </Link>
          <NewTopicButton classId={classId} />
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title={isOwner ? "No classwork yet" : "Nothing posted yet"}
          description={isOwner ? "Post an assignment or material to get started." : "Check back once your teacher posts classwork."}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((group) => (
            <section key={group.id ?? "general"} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {group.title}
              </h2>
              <div className="flex flex-col gap-3">
                {group.posts.map((post) => {
                  const Icon = post.type === "ASSIGNMENT" ? ClipboardCheck : FileText;
                  const submissionStatus =
                    !isOwner && "submissions" in post ? post.submissions[0]?.status : undefined;
                  return (
                    <Link key={post.id} href={`/classes/${classId}/classwork/${post.id}`}>
                      <NeumorphicCard className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon size={20} className="text-[var(--text-secondary)] shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                            {post.dueAt && (
                              <p className="text-xs text-[var(--text-secondary)]">
                                Due {format(post.dueAt, "MMM d, h:mm a")}
                              </p>
                            )}
                          </div>
                        </div>
                        {isOwner ? (
                          post.status === "DRAFT" && <StatusBadge status="DRAFT" />
                        ) : post.type === "ASSIGNMENT" ? (
                          <StatusBadge status={submissionStatus ?? "MISSING"} />
                        ) : null}
                      </NeumorphicCard>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
