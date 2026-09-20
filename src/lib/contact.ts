/**
 * Shop contact details for /contact and related links.
 */
export const contact = {
  email: "hello@haircutzbylarry.com",
  phoneDisplay: "+234 813 751 4547",
  phoneE164: "2348137514547",
  whatsappDisplay: "+234 813 240 2254",
  whatsappE164: "2348132402254",
  instagramHandle: "Larrycut_z",
  address: "11, Bailey street, Abule Ijesha, Yaba, Lagos",
} as const;

export const contactLinks = {
  mailto: `mailto:${contact.email}`,
  tel: `tel:+${contact.phoneE164}`,
  whatsapp: `https://wa.me/${contact.whatsappE164}`,
  instagram: `https://www.instagram.com/${contact.instagramHandle}/`,
  maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`,
  /** LARRY-CUTZ Google Business listing — leave a review */
  googleReview:
    "https://www.google.com/search?kgmid=%2Fg%2F11yh2kv5s0&hl=en-NG&q=LARRY-CUTZ&shem=epsd1%2Cltae%2Crimspwouoe&shndl=30&source=sh%2Fx%2Floc%2Fosrp%2Fm1%2F3&kgs=1dfb36a472923089",
} as const;
