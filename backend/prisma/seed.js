import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Cleanup existing seed data ─────────────────
  console.log("🧹 Cleaning up existing data...");
  await prisma.attendanceLog.deleteMany({});
  await prisma.classEnrollment.deleteMany({});
  await prisma.memberMembership.deleteMany({});
  await prisma.classSchedule.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.membershipBenefit.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.coach.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.gym.deleteMany({});
  console.log("✅ Cleanup done\n");

  // ─── Create Super Admin ─────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@gymcore.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      fullName: "Super Admin",
      phone: "+1234567890",
    },
  });
  console.log("✅ Super Admin created:", superAdmin.email);

  // ─── Create Gym ─────────────────────────────────
  const gym = await prisma.gym.create({
    data: {
      name: "GymCore Fitness Center",
      address: "123 Fitness Street, Batubulan Gianyar, Bali 80361",
      phone: "+6221-555-0100",
      email: "info@gymcorefitness.com",
      description: "A modern fitness center offering state-of-the-art equipment, expert coaches, and diverse class programs for all fitness levels.",
      isActive: true,
    },
  });
  console.log("✅ Gym created:", gym.name);

  // ─── Create Gym Admin ───────────────────────────
  const gymAdmin = await prisma.user.create({
    data: {
      email: "gymadmin@gymcore.com",
      password: hashedPassword,
      role: "GYM_ADMIN",
      fullName: "Gym Administrator",
      phone: "+6221-555-0101",
      gymId: gym.id,
    },
  });
  console.log("✅ Gym Admin created:", gymAdmin.email);

  // ─── Create Coaches ─────────────────────────────
  const coaches = await Promise.all([
    prisma.coach.create({
      data: {
        gymId: gym.id,
        fullName: "Sarah Johnson",
        email: "sarah.j@gymcore.com",
        phone: "+6221-555-0201",
        bio: "Certified yoga instructor with 8 years of experience. Specializes in Vinyasa and Hatha yoga.",
        specializations: ["Yoga", "Pilates", "Meditation"],
        isActive: true,
      },
    }),
    prisma.coach.create({
      data: {
        gymId: gym.id,
        fullName: "Marcus Chen",
        email: "marcus.c@gymcore.com",
        phone: "+6221-555-0202",
        bio: "Former competitive athlete and HIIT specialist. Passionate about helping clients achieve peak performance.",
        specializations: ["HIIT", "CrossFit", "Strength Training"],
        isActive: true,
      },
    }),
    prisma.coach.create({
      data: {
        gymId: gym.id,
        fullName: "Diana Putri",
        email: "diana.p@gymcore.com",
        phone: "+6221-555-0203",
        bio: "Professional spinning instructor and endurance coach. Certified by Spinning Academy International.",
        specializations: ["Spinning", "Cardio", "Endurance"],
        isActive: true,
      },
    }),
  ]);
  console.log("✅ 3 Coaches created");

  // ─── Create Facilities ──────────────────────────
  const facilities = await Promise.all([
    prisma.facility.create({
      data: {
        gymId: gym.id,
        name: "Main Studio",
        description: "Spacious studio with mirrors and sound system. Perfect for group classes.",
        capacity: 30,
        isActive: true,
      },
    }),
    prisma.facility.create({
      data: {
        gymId: gym.id,
        name: "Cycling Room",
        description: "Dedicated spinning room with 20 premium bikes and immersive lighting.",
        capacity: 20,
        isActive: true,
      },
    }),
  ]);
  console.log("✅ 2 Facilities created");

  // ─── Create Classes ─────────────────────────────
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        gymId: gym.id,
        name: "Morning Yoga Flow",
        description: "Start your day with a gentle yet energizing yoga flow. Suitable for all levels.",
        category: "Yoga",
        durationMinutes: 60,
        maxCapacity: 25,
        isActive: true,
      },
    }),
    prisma.class.create({
      data: {
        gymId: gym.id,
        name: "HIIT Blast",
        description: "High-intensity interval training to burn calories and build strength in 45 minutes.",
        category: "HIIT",
        durationMinutes: 45,
        maxCapacity: 20,
        isActive: true,
      },
    }),
    prisma.class.create({
      data: {
        gymId: gym.id,
        name: "Power Spin",
        description: "An intense cycling workout with music-driven intervals. Leave your limits at the door!",
        category: "Spinning",
        durationMinutes: 50,
        maxCapacity: 20,
        isActive: true,
      },
    }),
  ]);
  console.log("✅ 3 Classes created");

  // ─── Create Class Schedules (14 total) ──────────
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const scheduleData = [
    // Yoga - Mon, Wed, Fri, Sat, Sun (Main Studio, Sarah)
    { classIdx: 0, coachIdx: 0, facilityIdx: 0, day: "MON", start: "07:00", end: "08:00" },
    { classIdx: 0, coachIdx: 0, facilityIdx: 0, day: "WED", start: "07:00", end: "08:00" },
    { classIdx: 0, coachIdx: 0, facilityIdx: 0, day: "FRI", start: "07:00", end: "08:00" },
    { classIdx: 0, coachIdx: 0, facilityIdx: 0, day: "SAT", start: "09:00", end: "10:00" },
    { classIdx: 0, coachIdx: 0, facilityIdx: 0, day: "SUN", start: "09:00", end: "10:00" },
    // HIIT - Mon, Tue, Wed, Thu, Fri (Main Studio, Marcus)
    { classIdx: 1, coachIdx: 1, facilityIdx: 0, day: "MON", start: "17:00", end: "17:45" },
    { classIdx: 1, coachIdx: 1, facilityIdx: 0, day: "TUE", start: "17:00", end: "17:45" },
    { classIdx: 1, coachIdx: 1, facilityIdx: 0, day: "WED", start: "17:00", end: "17:45" },
    { classIdx: 1, coachIdx: 1, facilityIdx: 0, day: "THU", start: "17:00", end: "17:45" },
    { classIdx: 1, coachIdx: 1, facilityIdx: 0, day: "FRI", start: "17:00", end: "17:45" },
    // Spinning - Tue, Thu, Sat, Sun (Cycling Room, Diana)
    { classIdx: 2, coachIdx: 2, facilityIdx: 1, day: "TUE", start: "08:00", end: "08:50" },
    { classIdx: 2, coachIdx: 2, facilityIdx: 1, day: "THU", start: "08:00", end: "08:50" },
    { classIdx: 2, coachIdx: 2, facilityIdx: 1, day: "SAT", start: "10:30", end: "11:20" },
    { classIdx: 2, coachIdx: 2, facilityIdx: 1, day: "SUN", start: "10:30", end: "11:20" },
  ];

  for (const s of scheduleData) {
    await prisma.classSchedule.create({
      data: {
        classId: classes[s.classIdx].id,
        coachId: coaches[s.coachIdx].id,
        facilityId: facilities[s.facilityIdx].id,
        dayOfWeek: s.day,
        startTime: s.start,
        endTime: s.end,
        isRecurring: true,
        isActive: true,
      },
    });
  }
  console.log("✅ 14 Class Schedules created");

  // ─── Create Membership Plans ────────────────────
  const plans = await Promise.all([
    prisma.membershipPlan.create({
      data: {
        gymId: gym.id,
        name: "Monthly Basic",
        description: "Access to all gym equipment and basic group classes.",
        durationDays: 30,
        price: 500000,
        isActive: true,
        benefits: {
          create: [{ description: "Full gym equipment access" }, { description: "Locker room access" }, { description: "Up to 3 group classes per week" }, { description: "Free towel service" }],
        },
      },
    }),
    prisma.membershipPlan.create({
      data: {
        gymId: gym.id,
        name: "Quarterly Premium",
        description: "Full access to all classes, facilities, and premium perks.",
        durationDays: 90,
        price: 1200000,
        isActive: true,
        benefits: {
          create: [
            { description: "Unlimited gym equipment access" },
            { description: "Unlimited group classes" },
            { description: "Priority class booking" },
            { description: "Free parking" },
            { description: "Personal locker" },
            { description: "1 free personal training session per month" },
          ],
        },
      },
    }),
  ]);
  console.log("✅ 2 Membership Plans created");

  // ─── Create Members ─────────────────────────────
  const members = await Promise.all([
    prisma.member.create({
      data: {
        gymId: gym.id,
        fullName: "Andi Prasetyo",
        email: "andi.p@email.com",
        phone: "+6281-234-5001",
        gender: "Male",
        dateOfBirth: new Date("1995-03-15"),
        qrCode: "GYM-ANDI001PRAS",
        barcodeValue: "100000010001",
        isActive: true,
      },
    }),
    prisma.member.create({
      data: {
        gymId: gym.id,
        fullName: "Siti Rahayu",
        email: "siti.r@email.com",
        phone: "+6281-234-5002",
        gender: "Female",
        dateOfBirth: new Date("1998-07-22"),
        qrCode: "GYM-SITI002RAHA",
        barcodeValue: "100000010002",
        isActive: true,
      },
    }),
    prisma.member.create({
      data: {
        gymId: gym.id,
        fullName: "Budi Santoso",
        email: "budi.s@email.com",
        phone: "+6281-234-5003",
        gender: "Male",
        dateOfBirth: new Date("1990-11-08"),
        qrCode: "GYM-BUDI003SANT",
        barcodeValue: "100000010003",
        isActive: true,
      },
    }),
    prisma.member.create({
      data: {
        gymId: gym.id,
        fullName: "Maya Dewi",
        email: "maya.d@email.com",
        phone: "+6281-234-5004",
        gender: "Female",
        dateOfBirth: new Date("1997-01-30"),
        qrCode: "GYM-MAYA004DEWI",
        barcodeValue: "100000010004",
        isActive: true,
      },
    }),
    prisma.member.create({
      data: {
        gymId: gym.id,
        fullName: "Rizky Fauzan",
        email: "rizky.f@email.com",
        phone: "+6281-234-5005",
        gender: "Male",
        dateOfBirth: new Date("1993-09-12"),
        qrCode: "GYM-RIZK005FAUZ",
        barcodeValue: "100000010005",
        isActive: true,
      },
    }),
  ]);
  console.log("✅ 5 Members created");

  // ─── Assign Memberships ─────────────────────────
  const now = new Date();
  for (let i = 0; i < members.length; i++) {
    const plan = i < 3 ? plans[0] : plans[1];
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 15));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    await prisma.memberMembership.create({
      data: {
        memberId: members[i].id,
        membershipPlanId: plan.id,
        startDate,
        endDate,
        status: "ACTIVE",
      },
    });
  }
  console.log("✅ Memberships assigned to all members");

  // ─── Create Sample Attendance Logs ──────────────
  for (let day = 0; day < 30; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    // Random number of check-ins per day (1-4)
    const count = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < count; j++) {
      const member = members[Math.floor(Math.random() * members.length)];
      const checkInDate = new Date(date);
      checkInDate.setHours(6 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));
      await prisma.attendanceLog.create({
        data: {
          memberId: member.id,
          gymId: gym.id,
          checkInAt: checkInDate,
          method: ["QR_CODE", "BARCODE", "MANUAL"][Math.floor(Math.random() * 3)],
        },
      });
    }
  }
  console.log("✅ Sample attendance logs created (30 days)");

  // ─── Create Promotions ──────────────────────────
  await prisma.promotion.create({
    data: {
      gymId: gym.id,
      title: "New Year, New You!",
      description: "Get 20% off on all quarterly memberships. Start your fitness journey today!",
      discountType: "PERCENTAGE",
      discountValue: 20,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      isActive: true,
    },
  });
  console.log("✅ 1 Promotion created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("──────────────────────────────");
  console.log("📧 Super Admin: admin@gymcore.com / password123");
  console.log("📧 Gym Admin:   gymadmin@gymcore.com / password123");
  console.log("──────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
