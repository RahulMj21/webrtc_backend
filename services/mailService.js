exports.sendMail = async ({ to, subject, html }) => {
  const nodemailer = require("nodemailer");
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    to,
    subject,
    html,
  });

  if (!info) return false;
  return info;
};
