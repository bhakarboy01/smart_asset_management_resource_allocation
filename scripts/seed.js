// Compiled seed script for production Docker use (no TypeScript required)
"use strict";

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Categories ────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    db.category.upsert({
      where: { name: "Camera & Photography" },
      update: {},
      create: { name: "Camera & Photography", description: "DSLRs, lenses, tripods, filters", icon: "📷", color: "#f97316" },
    }),
    db.category.upsert({
      where: { name: "Audio Equipment" },
      update: {},
      create: { name: "Audio Equipment", description: "Microphones, speakers, mixers, amplifiers", icon: "🎤", color: "#3b82f6" },
    }),
    db.category.upsert({
      where: { name: "Lighting" },
      update: {},
      create: { name: "Lighting", description: "Studio lights, LED panels, softboxes, reflectors", icon: "💡", color: "#f59e0b" },
    }),
    db.category.upsert({
      where: { name: "Stage & Performance" },
      update: {},
      create: { name: "Stage & Performance", description: "Stage props, curtains, podiums", icon: "🎭", color: "#8b5cf6" },
    }),
    db.category.upsert({
      where: { name: "Costumes & Apparel" },
      update: {},
      create: { name: "Costumes & Apparel", description: "Traditional and modern costumes, accessories", icon: "👗", color: "#ec4899" },
    }),
    db.category.upsert({
      where: { name: "Recording & AV" },
      update: {},
      create: { name: "Recording & AV", description: "Recorders, projectors, screens, switchers", icon: "🎬", color: "#10b981" },
    }),
    db.category.upsert({
      where: { name: "Event Infrastructure" },
      update: {},
      create: { name: "Event Infrastructure", description: "Banners, flex boards, display stands, cable drums", icon: "🏗️", color: "#6366f1" },
    }),
  ]);

  const [photography, audio, lighting, stage, costumes, recording, infra] = categories;

  // ─── Admin User ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@sampadaa.in" },
    update: {},
    create: {
      name: "Arjun Verma",
      email: "admin@sampadaa.in",
      password: adminPassword,
      role: "ADMIN",
      department: "Computer Science & Engineering",
      rollNumber: "ADMIN001",
      phone: "9876543210",
    },
  });

  // ─── Regular Users ─────────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash("User@1234", 12);
  const user1 = await db.user.upsert({
    where: { email: "rahul@sampadaa.in" },
    update: {},
    create: {
      name: "Rahul Kumar Sharma",
      email: "rahul@sampadaa.in",
      password: userPassword,
      role: "USER",
      rollNumber: "21116044",
      department: "Electrical Engineering",
      phone: "9871234567",
    },
  });

  const user2 = await db.user.upsert({
    where: { email: "priya@sampadaa.in" },
    update: {},
    create: {
      name: "Priya Nair",
      email: "priya@sampadaa.in",
      password: userPassword,
      role: "USER",
      rollNumber: "22114032",
      department: "Computer Science & Engineering",
      phone: "9845678901",
    },
  });

  const user3 = await db.user.upsert({
    where: { email: "vikram@sampadaa.in" },
    update: {},
    create: {
      name: "Vikram Singh Yadav",
      email: "vikram@sampadaa.in",
      password: userPassword,
      role: "USER",
      rollNumber: "20117056",
      department: "Mechanical Engineering",
      phone: "9912345678",
    },
  });

  // ─── Assets ────────────────────────────────────────────────────────────────
  const assets = await Promise.all([
    db.asset.upsert({
      where: { serialNumber: "CAM-CANON-001" },
      update: {},
      create: {
        name: "Canon EOS 80D DSLR Camera",
        description: "24.2 MP APS-C sensor, dual pixel AF, Full HD video. Ideal for event and stage photography.",
        categoryId: photography.id,
        totalQuantity: 3,
        availableQty: 3,
        status: "AVAILABLE",
        condition: "GOOD",
        location: "Cultural Council Office, SAC Building",
        serialNumber: "CAM-CANON-001",
        purchasePrice: 75000,
        notes: "Includes 18-55mm kit lens. Carry bag provided.",
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "CAM-SONY-001" },
      update: {},
      create: {
        name: "Sony Alpha A7 III Mirrorless Camera",
        description: "Full-frame 24.2 MP sensor with 5-axis stabilisation. Excellent for low-light stage photography.",
        categoryId: photography.id,
        totalQuantity: 2,
        availableQty: 2,
        status: "AVAILABLE",
        condition: "EXCELLENT",
        location: "Cultural Council Office, SAC Building",
        serialNumber: "CAM-SONY-001",
        purchasePrice: 185000,
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "MIC-SHURE-001" },
      update: {},
      create: {
        name: "Shure SM58 Vocal Microphone",
        description: "Industry-standard dynamic microphone for live vocals. Cardioid polar pattern.",
        categoryId: audio.id,
        totalQuantity: 8,
        availableQty: 8,
        status: "AVAILABLE",
        condition: "GOOD",
        location: "Audio Room, SAC Building",
        serialNumber: "MIC-SHURE-001",
        purchasePrice: 12000,
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "AMP-QSC-001" },
      update: {},
      create: {
        name: "QSC GX5 Power Amplifier",
        description: "500W power amplifier for main PA speaker setup during events.",
        categoryId: audio.id,
        totalQuantity: 2,
        availableQty: 2,
        status: "AVAILABLE",
        condition: "GOOD",
        location: "Audio Room, SAC Building",
        serialNumber: "AMP-QSC-001",
        purchasePrice: 45000,
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "LIGHT-GODOX-001" },
      update: {},
      create: {
        name: "Godox SL-60W LED Video Light",
        description: "60W daylight-balanced LED studio light with softbox. Perfect for stage and photography.",
        categoryId: lighting.id,
        totalQuantity: 6,
        availableQty: 6,
        status: "AVAILABLE",
        condition: "EXCELLENT",
        location: "Lighting Store, SAC Building",
        serialNumber: "LIGHT-GODOX-001",
        purchasePrice: 18000,
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "PROJ-EPSON-001" },
      update: {},
      create: {
        name: "Epson EH-TW7100 4K Projector",
        description: "3000 lumen 4K UHD projector. Used for large screen projection at cultural events.",
        categoryId: recording.id,
        totalQuantity: 2,
        availableQty: 2,
        status: "AVAILABLE",
        condition: "GOOD",
        location: "AV Room, Convocation Hall",
        serialNumber: "PROJ-EPSON-001",
        purchasePrice: 120000,
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "COST-KLASIK-001" },
      update: {},
      create: {
        name: "Classical Indian Dance Costume Set",
        description: "Complete Bharatanatyam costume set including saree, jewellery, and accessories. 5 sets available.",
        categoryId: costumes.id,
        totalQuantity: 5,
        availableQty: 5,
        status: "AVAILABLE",
        condition: "GOOD",
        location: "Costume Room, Gymkhana",
        serialNumber: "COST-KLASIK-001",
        purchasePrice: 8000,
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "STAGE-PODIUM-001" },
      update: {},
      create: {
        name: "Wooden Stage Podium",
        description: "Foldable wooden podium for speeches and anchoring. IIT Roorkee logo engraved.",
        categoryId: stage.id,
        totalQuantity: 3,
        availableQty: 3,
        status: "AVAILABLE",
        condition: "FAIR",
        location: "Stage Store, Convocation Hall",
        serialNumber: "STAGE-PODIUM-001",
        purchasePrice: 5000,
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "INFRA-BANNER-001" },
      update: {},
      create: {
        name: "Event Flex Banner Stand Set",
        description: "Roll-up banner stands (2m height). Includes 10 stands with carrying bags.",
        categoryId: infra.id,
        totalQuantity: 10,
        availableQty: 10,
        status: "AVAILABLE",
        condition: "GOOD",
        location: "Storage Room, SAC Building",
        serialNumber: "INFRA-BANNER-001",
        purchasePrice: 2000,
      },
    }),
    db.asset.upsert({
      where: { serialNumber: "MIX-YAMAHA-001" },
      update: {},
      create: {
        name: "Yamaha MG16XU 16-Channel Mixer",
        description: "16-channel audio mixing console with USB interface. Used for all major events.",
        categoryId: audio.id,
        totalQuantity: 1,
        availableQty: 1,
        status: "AVAILABLE",
        condition: "GOOD",
        location: "Audio Room, SAC Building",
        serialNumber: "MIX-YAMAHA-001",
        purchasePrice: 38000,
      },
    }),
  ]);

  // ─── Sample bookings ────────────────────────────────────────────────────────
  const canon = assets[0];
  const mic = assets[2];

  // Use upsert-style guard: only create if booking doesn't already exist for this combo
  const existingBooking1 = await db.booking.findFirst({
    where: { userId: user1.id, assetId: canon.id, eventName: "Thomso 2024" },
  });
  const booking1 = existingBooking1 || await db.booking.create({
    data: {
      userId: user1.id,
      assetId: canon.id,
      quantity: 1,
      purpose: "Photography coverage for Thomso 2024 cultural night event at Convocation Hall.",
      eventName: "Thomso 2024",
      fromDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      toDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: "PENDING",
    },
  });

  const existingBooking2 = await db.booking.findFirst({
    where: { userId: user2.id, assetId: mic.id, eventName: "Sargam Open Mic" },
  });
  const booking2 = existingBooking2 || await db.booking.create({
    data: {
      userId: user2.id,
      assetId: mic.id,
      quantity: 2,
      purpose: "Music club open mic event in SAC seminar hall.",
      eventName: "Sargam Open Mic",
      fromDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      toDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "APPROVED",
    },
  });

  // ─── Audit logs ─────────────────────────────────────────────────────────────
  const existingAuditCount = await db.auditLog.count({ where: { userId: admin.id, action: "USER_REGISTERED" } });
  if (existingAuditCount === 0) {
    await db.auditLog.createMany({
      data: [
        { userId: admin.id, action: "USER_REGISTERED", details: "Admin account initialised during setup" },
        { userId: user1.id, action: "USER_REGISTERED", details: "New user registered: rahul@sampadaa.in" },
        { userId: user2.id, action: "USER_REGISTERED", details: "New user registered: priya@sampadaa.in" },
        { userId: user3.id, action: "USER_REGISTERED", details: "New user registered: vikram@sampadaa.in" },
        { userId: admin.id, action: "ASSET_CREATED", entityType: "Asset", details: "Asset created: Canon EOS 80D DSLR Camera" },
        { userId: user1.id, action: "BOOKING_CREATED", entityType: "Booking", entityId: booking1.id, details: "Booking created for Canon EOS 80D DSLR Camera" },
        { userId: admin.id, action: "BOOKING_APPROVED", entityType: "Booking", entityId: booking2.id, details: "Booking approved: Sargam Open Mic for Priya Nair" },
      ],
    });
  }

  // ─── Notifications ──────────────────────────────────────────────────────────
  const existingNotifCount = await db.notification.count({ where: { userId: user1.id } });
  if (existingNotifCount === 0) {
    await db.notification.createMany({
      data: [
        {
          userId: user1.id,
          title: "Welcome to Sampadaa! 🎉",
          message: "Your account has been created. You can now browse and book assets.",
          type: "success",
        },
        {
          userId: user1.id,
          title: "Booking Request Submitted",
          message: "Your request for Canon EOS 80D is pending admin approval.",
          type: "info",
        },
        {
          userId: user2.id,
          title: "Booking Approved ✓",
          message: "Your request for Shure SM58 Microphones has been approved.",
          type: "success",
        },
        {
          userId: admin.id,
          title: "New Booking Request",
          message: "Rahul Kumar Sharma has requested Canon EOS 80D DSLR Camera for Thomso 2024.",
          type: "info",
        },
      ],
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Demo Credentials:");
  console.log("  Admin  → admin@sampadaa.in / Admin@1234");
  console.log("  User 1 → rahul@sampadaa.in / User@1234");
  console.log("  User 2 → priya@sampadaa.in / User@1234");
  console.log("  User 3 → vikram@sampadaa.in / User@1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
