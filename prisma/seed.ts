import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { addDays, addHours, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import { PrismaClient } from "../src/generated/prisma/client";
import { generateInviteCode } from "../src/lib/invite-code";
import { buildRecurrenceRule } from "../src/lib/calendar/recurrence";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEMO_PASSWORD = "password123";

function at(daysFromNow: number, hour: number, minute = 0) {
  const base = setMilliseconds(setSeconds(setMinutes(setHours(new Date(), hour), minute), 0), 0);
  return addDays(base, daysFromNow);
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@nexus.edu" },
    update: {},
    create: { name: "Maria Alvarez", email: "teacher@nexus.edu", passwordHash, role: "TEACHER" },
  });

  const [jordan, priya, sam] = await Promise.all(
    [
      { name: "Jordan Lee", email: "jordan@nexus.edu" },
      { name: "Priya Nair", email: "priya@nexus.edu" },
      { name: "Sam Okafor", email: "sam@nexus.edu" },
    ].map((s) =>
      prisma.user.upsert({
        where: { email: s.email },
        update: {},
        create: { ...s, passwordHash, role: "STUDENT" },
      }),
    ),
  );
  const students = [jordan, priya, sam];

  const biology = await upsertClass({
    name: "AP Biology",
    subject: "Science",
    section: "Period 3",
    accentColor: "#1f9d6c",
    ownerId: teacher.id,
  });
  const algebra = await upsertClass({
    name: "Algebra II",
    subject: "Math",
    section: "Period 5",
    accentColor: "#6a63f1",
    ownerId: teacher.id,
  });

  for (const cls of [biology, algebra]) {
    for (const student of students) {
      await prisma.enrollment.upsert({
        where: { classId_userId: { classId: cls.id, userId: student.id } },
        update: {},
        create: { classId: cls.id, userId: student.id },
      });
    }
  }

  const cellsTopic = await upsertTopic(biology.id, "Unit 1: Cells", 0);
  const functionsTopic = await upsertTopic(algebra.id, "Chapter 1: Functions", 0);

  await upsertPost({
    classId: biology.id,
    authorId: teacher.id,
    type: "ANNOUNCEMENT",
    title: "Announcement",
    body: "Welcome to AP Biology! Check the Classwork tab for this week's lab report and quiz.",
  });

  const labReport = await upsertPost({
    classId: biology.id,
    authorId: teacher.id,
    type: "ASSIGNMENT",
    title: "Cell Membrane Lab Report",
    body: "Write up your observations from Friday's lab. Include at least one labeled diagram.",
    topicId: cellsTopic.id,
    dueAt: at(3, 23, 59),
    points: 100,
  });

  // Overdue with no submissions yet — every student shows as "Missing".
  await upsertPost({
    classId: biology.id,
    authorId: teacher.id,
    type: "ASSIGNMENT",
    title: "Mitosis Quiz",
    body: "Short quiz covering the phases of mitosis.",
    topicId: cellsTopic.id,
    dueAt: at(-1, 23, 59),
    points: 50,
  });

  await upsertPost({
    classId: biology.id,
    authorId: teacher.id,
    type: "MATERIAL",
    title: "Syllabus",
    body: "Course syllabus and grading policy.",
  });

  await upsertPost({
    classId: algebra.id,
    authorId: teacher.id,
    type: "ANNOUNCEMENT",
    title: "Announcement",
    body: "Welcome to Algebra II! Problem Set 1 is posted and due next week.",
  });

  await upsertPost({
    classId: algebra.id,
    authorId: teacher.id,
    type: "ASSIGNMENT",
    title: "Problem Set 1",
    body: "Complete problems 1-20 from Chapter 1. Show your work.",
    topicId: functionsTopic.id,
    dueAt: at(5, 23, 59),
    points: 20,
  });

  await upsertPost({
    classId: algebra.id,
    authorId: teacher.id,
    type: "MATERIAL",
    title: "Graphing Calculator Guide",
  });

  // Submissions: one graded, one turned in awaiting grading, one missing (no row).
  const jordanSubmission = await prisma.submission.upsert({
    where: { postId_studentId: { postId: labReport.id, studentId: jordan.id } },
    update: {},
    create: {
      postId: labReport.id,
      studentId: jordan.id,
      content: "The cell membrane regulates what enters and exits the cell via selective permeability...",
      status: "RETURNED",
      submittedAt: at(-1, 14, 0),
    },
  });
  await prisma.grade.upsert({
    where: { submissionId: jordanSubmission.id },
    update: {},
    create: { submissionId: jordanSubmission.id, score: 92, feedback: "Great diagram — cite your source next time.", gradedById: teacher.id },
  });

  await prisma.submission.upsert({
    where: { postId_studentId: { postId: labReport.id, studentId: priya.id } },
    update: {},
    create: {
      postId: labReport.id,
      studentId: priya.id,
      content: "My lab observations showed that the membrane...",
      status: "TURNED_IN",
      submittedAt: at(0, 9, 0),
    },
  });

  // Calendar: recurring class schedules (virtual, so Meetings is demoable) + a personal event.
  const bioStart = at(0, 10, 0);
  await upsertRecurringClassEvent({
    classId: biology.id,
    creatorId: teacher.id,
    title: "AP Biology",
    startAt: bioStart,
    endAt: addHours(bioStart, 1),
    weekdays: [0, 2, 4], // Mon, Wed, Fri
  });

  const algStart = at(1, 13, 0);
  await upsertRecurringClassEvent({
    classId: algebra.id,
    creatorId: teacher.id,
    title: "Algebra II",
    startAt: algStart,
    endAt: addHours(algStart, 1),
    weekdays: [1, 3], // Tue, Thu
  });

  await prisma.calendarEvent.create({
    data: {
      scope: "PERSONAL",
      title: "Office hours",
      description: "Open office hours for any student questions.",
      startAt: at(2, 15, 0),
      endAt: at(2, 16, 0),
      isVirtual: false,
      location: "Room 204",
      creatorId: teacher.id,
    },
  });

  console.log(`Seeded teacher: ${teacher.email}`);
  console.log(`Seeded students: ${students.map((s) => s.email).join(", ")}`);
  console.log(`All demo accounts use the password: ${DEMO_PASSWORD}`);
  console.log(`Class invite codes — AP Biology: ${biology.inviteCode}, Algebra II: ${algebra.inviteCode}`);
}

async function upsertClass(data: { name: string; subject: string; section: string; accentColor: string; ownerId: string }) {
  const existing = await prisma.class.findFirst({ where: { name: data.name, ownerId: data.ownerId } });
  if (existing) return existing;
  return prisma.class.create({ data: { ...data, inviteCode: generateInviteCode() } });
}

async function upsertTopic(classId: string, title: string, order: number) {
  const existing = await prisma.topic.findFirst({ where: { classId, title } });
  if (existing) return existing;
  return prisma.topic.create({ data: { classId, title, order } });
}

async function upsertPost(data: {
  classId: string;
  authorId: string;
  type: "ANNOUNCEMENT" | "ASSIGNMENT" | "MATERIAL";
  title: string;
  body?: string;
  topicId?: string;
  dueAt?: Date;
  points?: number;
}) {
  const existing = await prisma.post.findFirst({ where: { classId: data.classId, title: data.title, type: data.type } });
  if (existing) return existing;
  return prisma.post.create({
    data: { ...data, status: "PUBLISHED", publishedAt: new Date() },
  });
}

async function upsertRecurringClassEvent(opts: {
  classId: string;
  creatorId: string;
  title: string;
  startAt: Date;
  endAt: Date;
  weekdays: number[];
}) {
  const existing = await prisma.calendarEvent.findFirst({ where: { classId: opts.classId, title: opts.title, scope: "CLASS" } });
  if (existing) return existing;

  const recurrenceRule = buildRecurrenceRule({ freq: "WEEKLY", weekdays: opts.weekdays, until: null }, opts.startAt);
  return prisma.calendarEvent.create({
    data: {
      scope: "CLASS",
      classId: opts.classId,
      creatorId: opts.creatorId,
      title: opts.title,
      startAt: opts.startAt,
      endAt: opts.endAt,
      isVirtual: true,
      recurrenceRule,
    },
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
