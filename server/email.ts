import nodemailer from "nodemailer";

// Create transporter (using test account for demo)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025"),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

export async function sendInvoiceEmail(
  customerEmail: string,
  customerName: string,
  invoiceNumber: string,
  pdfBuffer: Buffer,
  staffName: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@amaw-pyay.com",
      to: customerEmail,
      subject: `ပြေစာ / Invoice #${invoiceNumber} - အမောပြေ`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">အမောပြေ - Pure Water Delivery</h2>
          <p>မြန်မာ</p>
          <p>အလေးစိုက်သည့် ${customerName} အား,</p>
          <p>ကျွန်ုပ်တို့၏ ပြေစာ #${invoiceNumber} ကို အပ်ဆောင်ပေးပါသည်။</p>
          <p>ဝန်ထမ်း: ${staffName}</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p>English</p>
          <p>Dear ${customerName},</p>
          <p>Please find attached our invoice #${invoiceNumber}.</p>
          <p>Staff: ${staffName}</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.docx`,
          content: pdfBuffer,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Invoice sent to ${customerEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send invoice to ${customerEmail}:`, error);
    return false;
  }
}
