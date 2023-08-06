import nodemailer, { Transporter } from 'nodemailer';

const transporterConfig: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST as string,
  port: parseInt(process.env.EMAIL_PORT as string),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASSWORD as string
  }
});

export { transporterConfig as transporter };
