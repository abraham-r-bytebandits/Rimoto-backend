import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import nodemailer from 'nodemailer';
import { envConfig } from '../configs/env';

const transporter = nodemailer.createTransport({
  host: envConfig.SMTP_HOST,
  port: envConfig.SMTP_PORT,
  secure: envConfig.SMTP_PORT === 465,
  service: envConfig.SMTP_HOST === 'smtp.gmail.com' ? 'gmail' : undefined,
  auth: {
    user: envConfig.SMTP_USER,
    pass: envConfig.SMTP_PASS,
  },
});

export const submitClaim = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      claimType,
      customerName,
      orderNumber,
      email,
      phone,
      billingAddress,
      shippingAddress,
      purchaseDate,
      productName,
      productColor,
      productSize,
      returningProductName,
      returningProductColor,
      returningProductSize,
      exchangeProductName,
      exchangeProductColor,
      exchangeProductSize,
      reason,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const invoiceFile = files?.['invoice']?.[0];
    const productMediaFiles = files?.['productMedia'] || [];

    if (!invoiceFile) {
      res.status(400).json({ success: false, error: 'Invoice file is required' });
      return;
    }

    if (productMediaFiles.length === 0) {
      res.status(400).json({ success: false, error: 'Product media is required' });
      return;
    }

    const invoiceUrl = `/uploads/claims/${invoiceFile.filename}`;
    const productMediaUrls = productMediaFiles.map(f => `/uploads/claims/${f.filename}`);

    const newClaim = await prisma.claim.create({
      data: {
        claimType: claimType.toUpperCase(),
        customerName,
        orderNumber,
        email,
        phone,
        billingAddress,
        shippingAddress,
        purchaseDate: new Date(purchaseDate),
        productName,
        productColor,
        productSize,
        returningProductName,
        returningProductColor,
        returningProductSize,
        exchangeProductName,
        exchangeProductColor,
        exchangeProductSize,
        reason,
        invoiceUrl,
        productMediaUrls,
      },
    });

    // Send email using a custom Rimoto theme design
    const emailHtml = `
      <div style="font-family: sans-serif; background-color: #f4f4f0; padding: 40px 20px; color: #000;">
        <div style="max-w-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #000; box-shadow: 6px 6px 0px #bcfb4c; padding: 40px;">
          <h1 style="text-transform: uppercase; letter-spacing: 2px; font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 20px;">Claim Submitted Successfully</h1>
          <p style="font-size: 16px; margin-top: 20px;">Hi <strong>${customerName}</strong>,</p>
          <p style="font-size: 16px;">We have received your <strong>${claimType.toUpperCase()}</strong> claim (Order #${orderNumber}).</p>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">Our team is reviewing the details and verifying the provided images/invoices. We will get back to you within 48 hours with the next steps.</p>
          
          <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin-top: 30px;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Have queries?</p>
            <p style="margin: 5px 0; font-size: 14px;">Email: contact@rimotogear.com</p>
            <p style="margin: 5px 0; font-size: 14px;">Phone: +91 74491 02000</p>
          </div>
          
          <p style="font-size: 12px; margin-top: 40px; color: #888; text-transform: uppercase;">Rimoto Gear Team</p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: '"Rimoto Gear Support" <no-reply@rimotogear.com>',
        to: email,
        subject: `Rimoto Claim Received - Order #${orderNumber}`,
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
      // We don't fail the request if email fails, just log it.
    }

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: newClaim,
    });
  } catch (error: any) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ success: false, error: 'Internal server error', detail: error.message });
  }
};

export const getClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    const claims = await prisma.claim.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: claims });
  } catch (error: any) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ success: false, error: 'Internal server error', detail: error.message });
  }
};
