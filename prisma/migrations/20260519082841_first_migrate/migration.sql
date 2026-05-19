-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `passwordHash` VARCHAR(191) NULL,
    `clubAffiliation` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `isBanned` BOOLEAN NOT NULL DEFAULT false,
    `strikeCount` INTEGER NOT NULL DEFAULT 0,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rides` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startLocation` VARCHAR(191) NOT NULL,
    `endLocation` VARCHAR(191) NOT NULL,
    `dateScheduled` DATETIME(3) NOT NULL,
    `timeStart` VARCHAR(191) NOT NULL,
    `distanceKm` DECIMAL(8, 2) NOT NULL,
    `skillLevel` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
    `bikeRequirement` VARCHAR(191) NOT NULL DEFAULT 'All Bikes',
    `whatsappGroupUrl` VARCHAR(191) NOT NULL,
    `whatsappJoinsCount` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
    `featuredSlot` ENUM('HERO_BANNER', 'WEEKEND_PICK', 'EDITORS_CHOICE') NULL,
    `organizerId` VARCHAR(191) NOT NULL,
    `imageUrls` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stories` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `destinationTag` VARCHAR(191) NOT NULL,
    `flairType` VARCHAR(191) NOT NULL,
    `contentBody` LONGTEXT NOT NULL,
    `mediaUrls` JSON NOT NULL,
    `mediaMeta` JSON NOT NULL,
    `images` JSON NULL,
    `postType` ENUM('STORY', 'REVIEW') NOT NULL DEFAULT 'REVIEW',
    `ratingScore` DECIMAL(3, 1) NOT NULL,
    `voteCount` INTEGER NOT NULL DEFAULT 0,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actionSeverity` ENUM('SUCCESS', 'WARNING', 'DANGER') NOT NULL,
    `actionType` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `popular_routes` (
    `id` VARCHAR(191) NOT NULL,
    `orderNo` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `place` TEXT NOT NULL,
    `iframeUrl` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rides` ADD CONSTRAINT `rides_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stories` ADD CONSTRAINT `stories_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_logs` ADD CONSTRAINT `admin_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
