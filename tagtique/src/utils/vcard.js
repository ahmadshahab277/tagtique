/**
 * Generates and triggers download of a standardized vCard (.vcf) file
 * @param {Object} contact
 * @param {string} contact.name
 * @param {string} [contact.title]
 * @param {string} [contact.organization]
 * @param {string} [contact.phone]
 * @param {string} [contact.email]
 * @param {string} [contact.instagram]
 * @param {string} [contact.website]
 * @param {string} [contact.note]
 */
export function downloadVCard(contact) {
  const nameParts = (contact.name || 'Friend').trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || 'Friend';

  let vcfLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${contact.name || 'Friend'}`,
  ];

  if (contact.title) {
    vcfLines.push(`TITLE:${contact.title}`);
  }
  if (contact.organization) {
    vcfLines.push(`ORG:${contact.organization}`);
  }
  if (contact.phone) {
    vcfLines.push(`TEL;TYPE=CELL:${contact.phone}`);
  }
  if (contact.email) {
    vcfLines.push(`EMAIL;TYPE=INTERNET:${contact.email}`);
  }
  if (contact.website) {
    vcfLines.push(`URL:${contact.website}`);
  }
  if (contact.instagram) {
    vcfLines.push(`X-SOCIALPROFILE;type=instagram:https://instagram.com/${contact.instagram.replace('@', '')}`);
  }
  if (contact.note) {
    vcfLines.push(`NOTE:${contact.note}`);
  }

  vcfLines.push('END:VCARD');

  const blob = new Blob([vcfLines.join('\r\n')], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(contact.name || 'contact').toLowerCase().replace(/\s+/g, '_')}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
