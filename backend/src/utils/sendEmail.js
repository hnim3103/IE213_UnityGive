import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  let transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Real NodeMailer Transporter using established envs
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Auto-generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("⚠️ Using Ethereal Email (Test SMTP generated automatically)");
  }

  const message = {
    from: `${process.env.FROM_NAME || 'UnityGive Team'} <${process.env.FROM_EMAIL || 'noreply@unitygive.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(message);
  console.log("Email sent: %s", info.messageId);

  // If using ethereal, directly display the link to the actual email inbox online
  if (!process.env.SMTP_HOST) {
    console.log("=========================================");
    console.log("📩 Preview Real Email: %s", nodemailer.getTestMessageUrl(info));
    console.log("=========================================");
  }
};

export default sendEmail;
