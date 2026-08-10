import Link from "next/link";
import { format } from "date-fns";
import { ClipboardList, Plus, FileText, ClipboardCheck, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { getClasswork } from "@/lib/queries/classwork";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/ui/surface";
import { neumorphicButtonClasses } from "@/components/ui/button";
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
  ].filter((g) => g.posts.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {isOwner && (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/classes/${classId}/classwork/new?type=ASSIGNMENT`}
            className={neumorphicButtonClasses({ variant: "primary" })}
          >
            <Plus size={18} />
            New assignment
          </Link>
          <Link
            href={`/classes/${classId}/classwork/new?type=MATERIAL`}
            className={neumorphicButtonClasses({ variant: "raised" })}
          >
            <Plus size={18} />
            New material
          </Link>
          <NewTopicButton classId={classId} />
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={26} />}
          title={isOwner ? "No classwork yet" : "Nothing posted yet"}
          description={
            isOwner
              ? "Post an assignment or material to get started."
              : "Check back once your teacher posts classwork."
          }
        />
      ) : (
        <div className="flex flex-col gap-7">
          {grouped.map((group) => (
            <section key={group.id ?? "general"} className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] pl-1">
                {group.title}
              </h2>
              <Surface variant="raised" className="p-3 flex flex-col neu-divide">
                {group.posts.map((post) => {
                  const isAssignment = post.type === "ASSIGNMENT";
                  const Icon = isAssignment ? ClipboardCheck : FileText;
                  const tone = isAssignment ? "var(--warning)" : "var(--success)";
                  const submissionStatus = !isOwner ? post.submissions[0]?.status : undefined;

                  return (
                    <Link
                      key={post.id}
                      href={`/classes/${classId}/classwork/${post.id}`}
                      className="flex items-center justify-between gap-4 p-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Surface
                          variant="pressed"
                          depth="sm"
                          rounded="control"
                          className="h-10 w-10 shrink-0 flex items-center justify-center"
                          style={{ color: tone }}
                        >
                          <Icon size={18} />
                        </Surface>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {post.dueAt
                              ? `Due ${format(post.dueAt, "MMM d, h:mm a")}`
                              : isAssignment
                                ? "No due date"
                                : "Reference material"}
                            {post.points != null && ` · ${post.points} pts`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isOwner
                          ? post.status === "DRAFT" && <StatusBadge status="DRAFT" />
                          : isAssignment && <StatusBadge status={submissionStatus ?? "MISSING"} />}
                        <ChevronRight
                          size={16}
                          className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                    </Link>
                  );
                })}
              </Surface>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
