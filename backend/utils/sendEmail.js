import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("Email transport is not configured. Skipping sendEmail.");
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

export default sendEmail;
