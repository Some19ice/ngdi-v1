"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = require("bcryptjs");
const client_1 = require("@prisma/client");
async function main() {
    console.log("Starting to seed users...");
    try {
        // Create admin user
        const adminExists = await prisma_1.prisma.user.findUnique({
            where: { email: "admin@ngdi.gov.ng" },
        });
        if (!adminExists) {
            const hashedAdminPassword = await (0, bcryptjs_1.hash)("Admin123!@#", 10);
            await prisma_1.prisma.user.create({
                data: {
                    email: "admin@ngdi.gov.ng",
                    password: hashedAdminPassword,
                    name: "Administrator",
                    role: client_1.UserRole.ADMIN,
                    organization: "NGDI",
                    department: "Administration",
                    phone: "+234800000000",
                },
            });
            console.log("Admin user created successfully.");
        }
        else {
            // Update admin password if user already exists
            const hashedAdminPassword = await (0, bcryptjs_1.hash)("Admin123!@#", 10);
            await prisma_1.prisma.user.update({
                where: { email: "admin@ngdi.gov.ng" },
                data: { password: hashedAdminPassword },
            });
            console.log("Admin user password updated successfully.");
        }
        // Create test user
        const testUserExists = await prisma_1.prisma.user.findUnique({
            where: { email: "test@example.com" },
        });
        if (!testUserExists) {
            const hashedTestPassword = await (0, bcryptjs_1.hash)("password123", 10);
            await prisma_1.prisma.user.create({
                data: {
                    email: "test@example.com",
                    password: hashedTestPassword,
                    name: "Test User",
                    role: client_1.UserRole.USER,
                    organization: "Test Organization",
                    department: "Testing",
                    phone: "+234800000001",
                },
            });
            console.log("Test user created successfully.");
        }
        else {
            console.log("Test user already exists.");
        }
        // Create node officer
        const nodeOfficerExists = await prisma_1.prisma.user.findUnique({
            where: { email: "nodeofficer@ngdi.gov.ng" },
        });
        if (!nodeOfficerExists) {
            const hashedPassword = await (0, bcryptjs_1.hash)("officer123", 10);
            await prisma_1.prisma.user.create({
                data: {
                    email: "nodeofficer@ngdi.gov.ng",
                    password: hashedPassword,
                    name: "Node Officer",
                    role: client_1.UserRole.NODE_OFFICER,
                    organization: "NGDI",
                    department: "Operations",
                    phone: "+234800000002",
                },
            });
            console.log("Node officer created successfully.");
        }
        else {
            console.log("Node officer already exists.");
        }
        console.log("Seeding completed successfully.");
    }
    catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
main()
    .then(() => console.log("Seeding completed."))
    .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
});
