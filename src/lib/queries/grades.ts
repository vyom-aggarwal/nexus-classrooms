import { prisma } from "@/lib/prisma";

export async function getGradebook(classId: string) {
  const [assignments, roster] = await Promise.all([
    prisma.post.findMany({
      where: { classId, type: "ASSIGNMENT", status: "PUBLISHED" },
      select: { id: true, title: true, points: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.enrollment.findMany({
      where: { classId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  const submissions = await prisma.submission.findMany({
    where: { post: { classId, type: "ASSIGNMENT" } },
    include: { grade: true },
  });

  const cellKey = (postId: string, studentId: string) => `${postId}:${studentId}`;
  const cells = new Map(submissions.map((s) => [cellKey(s.postId, s.studentId), s]));

  const students = roster.map((e) => e.user);

  const studentAverages = new Map<string, number | null>();
  for (const student of students) {
    const percentages: number[] = [];
    for (const a of assignments) {
      const grade = cells.get(cellKey(a.id, student.id))?.grade;
      if (grade && a.points) percentages.push((grade.score / a.points) * 100);
    }
    studentAverages.set(student.id, percentages.length ? average(percentages) : null);
  }

  const assignmentAverages = new Map<string, number | null>();
  for (const a of assignments) {
    const scores = students
      .map((s) => cells.get(cellKey(a.id, s.id))?.grade?.score)
      .filter((s): s is number => s != null);
    assignmentAverages.set(a.id, scores.length ? average(scores) : null);
  }

  return { assignments, students, cells, studentAverages, assignmentAverages };
}

export async function getStudentGradesForClass(classId: string, studentId: string) {
  const posts = await prisma.post.findMany({
    where: { classId, type: "ASSIGNMENT", status: "PUBLISHED" },
    include: {
      submissions: { where: { studentId }, include: { grade: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const graded = posts.filter((p) => p.submissions[0]?.grade);
  const percentages = graded
    .filter((p) => p.points)
    .map((p) => (p.submissions[0].grade!.score / p.points!) * 100);

  return {
    posts,
    overallPercent: percentages.length ? average(percentages) : null,
  };
}

export async function getStudentGradesAllClasses(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: studentId },
    include: { class: { select: { id: true, name: true, accentColor: true } } },
  });

  const byClass = await Promise.all(
    enrollments.map(async (e) => ({
      class: e.class,
      ...(await getStudentGradesForClass(e.class.id, studentId)),
    })),
  );

  return byClass;
}

function average(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
