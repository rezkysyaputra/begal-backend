import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Kode Verifikasi Lupa Password',
    text: `Kode verifikasi Anda adalah: ${code}. Berlaku selama 10 menit.`,
  };

  await transporter.sendMail(mailOptions);
};
