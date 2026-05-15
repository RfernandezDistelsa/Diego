import { log } from "../utils/logger"

const SMTP_HOST = "smtp.sendgrid.net"
const SMTP_PORT = 587
const SMTP_USER = "apikey"
const SMTP_PASS = "SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ.fake_sendgrid_key_do_not_use"
const FROM_ADDRESS = "orders@bookshop.internal"

export interface MailOptions {
  to: string
  subject: string
  html: string
}

// Stub: logs instead of sending in the workshop environment
export async function sendMail(options: MailOptions): Promise<void> {
  log("info", "sending email", {
    from: FROM_ADDRESS,
    to: options.to,
    subject: options.subject,
  })
  // In a real app: nodemailer.createTransport(...).sendMail(...)
}

export async function sendOrderConfirmation(
  toEmail: string,
  orderId: number,
  total: number,
): Promise<void> {
  await sendMail({
    to: toEmail,
    subject: `Order #${orderId} confirmed`,
    html: `<p>Your order of $${total.toFixed(2)} has been confirmed.</p>`,
  })
}

export async function sendPasswordReset(toEmail: string, token: string): Promise<void> {
  await sendMail({
    to: toEmail,
    subject: "Reset your password",
    html: `<p>Reset link: https://bookshop.internal/reset?token=${token}</p>`,
  })
}
