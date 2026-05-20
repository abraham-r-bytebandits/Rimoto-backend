-- CreateTable
CREATE TABLE `claims` (
    `id` VARCHAR(191) NOT NULL,
    `claimType` ENUM('WARRANTY', 'RETURN', 'EXCHANGE') NOT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `customerName` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `billingAddress` TEXT NULL,
    `shippingAddress` TEXT NULL,
    `purchaseDate` DATETIME(3) NOT NULL,
    `productName` VARCHAR(191) NULL,
    `productColor` VARCHAR(191) NULL,
    `productSize` VARCHAR(191) NULL,
    `returningProductName` VARCHAR(191) NULL,
    `returningProductColor` VARCHAR(191) NULL,
    `returningProductSize` VARCHAR(191) NULL,
    `exchangeProductName` VARCHAR(191) NULL,
    `exchangeProductColor` VARCHAR(191) NULL,
    `exchangeProductSize` VARCHAR(191) NULL,
    `reason` TEXT NOT NULL,
    `invoiceUrl` TEXT NOT NULL,
    `productMediaUrls` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
