const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendVerificationCode(to, name, code) {
  await transporter.sendMail({
    from: `"Clínica Vida" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Seu código de verificação',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>Olá, ${name}!</h2>
        <p>Use este código para verificar seu email:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 20px 0;">
          ${code}
        </div>
        <p>Esse código expira em 10 minutos.</p>
      </div>
    `
  });
}

module.exports = { sendVerificationCode };