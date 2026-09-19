/**
 * Contact placeholders — replace before launch.
 */
export const contact = {
  email: "hello@haircutzbylarry.com",
  phoneDisplay: "+234 800 000 0000",
  phoneE164: "2348000000000",
  instagramHandle: "haircutzbylarry",
  address: "Lagos, Nigeria (walk-in by appointment)",
} as const;

export const contactLinks = {
  mailto: `mailto:${contact.email}`,
  tel: `tel:+${contact.phoneE164}`,
  whatsapp: `https://wa.me/${contact.phoneE164}`,
  instagram: `https://www.instagram.com/${contact.instagramHandle}/`,
  maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`,
} as const;
