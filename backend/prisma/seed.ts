import bcrypt from "bcryptjs";
import { PrismaClient, Role, AvailabilityType, AppointmentSource, AppointmentStatus, NotificationType } from "@prisma/client";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.appointmentActivity.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availabilityWindow.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.recurrenceSeries.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [admin, manager, scheduler, staffUser, customerUser] = await Promise.all([
    prisma.user.create({ data: { email: "admin@example.com", passwordHash, firstName: "System", lastName: "Admin", role: Role.SYSTEM_ADMIN } }),
    prisma.user.create({ data: { email: "manager@example.com", passwordHash, firstName: "Mina", lastName: "Manager", role: Role.MANAGER } }),
    prisma.user.create({ data: { email: "scheduler@example.com", passwordHash, firstName: "Sam", lastName: "Scheduler", role: Role.SCHEDULER } }),
    prisma.user.create({ data: { email: "staff@example.com", passwordHash, firstName: "Diego", lastName: "Reyes", role: Role.STAFF } }),
    prisma.user.create({ data: { email: "customer@example.com", passwordHash, firstName: "Maria", lastName: "Santos", role: Role.CUSTOMER } })
  ]);

  const staff = await prisma.staffProfile.create({
    data: {
      userId: staffUser.id,
      displayName: "Dr. Reyes",
      timezone: "America/Chicago"
    }
  });

  const customer = await prisma.customerProfile.create({
    data: {
      userId: customerUser.id,
      firstName: "Maria",
      lastName: "Santos",
      email: "customer@example.com",
      timezone: "America/Chicago"
    }
  });

  const consultation = await prisma.service.create({
    data: {
      name: "Consultation",
      durationMinutes: 45,
      bufferAfterMinutes: 15
    }
  });

  await prisma.service.create({ data: { name: "Follow-up", durationMinutes: 30 } });
  await prisma.service.create({ data: { name: "Installation Call", durationMinutes: 60 } });

  await prisma.staffService.create({
    data: {
      staffId: staff.id,
      serviceId: consultation.id
    }
  });

  await prisma.availabilityWindow.create({
    data: {
      staffId: staff.id,
      type: AvailabilityType.AVAILABLE,
      dayOfWeek: 1,
      startTimeLocal: "09:00",
      endTimeLocal: "17:00",
      timezone: "America/Chicago",
      isRecurringWeekly: true
    }
  });

  const start = DateTime.now().setZone("America/Chicago").plus({ days: 1 }).startOf("hour").set({ hour: 10 });
  const end = start.plus({ minutes: 45 });

  const appointment = await prisma.appointment.create({
    data: {
      customerId: customer.id,
      staffId: staff.id,
      serviceId: consultation.id,
      createdById: scheduler.id,
      source: AppointmentSource.ADMIN_BOOKING,
      status: AppointmentStatus.CONFIRMED,
      startTimeUtc: start.toUTC().toJSDate(),
      endTimeUtc: end.toUTC().toJSDate(),
      timezone: "America/Chicago"
    }
  });

  await prisma.notification.create({
    data: {
      appointmentId: appointment.id,
      recipientEmail: customer.email,
      type: NotificationType.APPOINTMENT_REMINDER,
      scheduledForUtc: start.minus({ hours: 24 }).toUTC().toJSDate()
    }
  });

  console.log("Seed complete", {
    admin: admin.email,
    manager: manager.email,
    scheduler: scheduler.email,
    staff: staffUser.email,
    customer: customerUser.email
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
