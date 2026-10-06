/** Where proposal requests go. Neither value is ever shown on the page; they only appear in the link a button opens. */
const CONTACT = {
  email: "ahelmsmanhas.justborn@gmail.com",
  /** International format without "+" or leading zeros: Bangladesh (+880) followed by 1521444725. */
  whatsapp: "8801521444725",
} as const

export const emailLink = (subject: string, body: string) => `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export const whatsappLink = (text: string) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`
