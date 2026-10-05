// Attribution for an Openverse (openly licensed) photo: short caption on the sheet, full credit kept in the block.
export function openverseCredit(item) {
  const license = `CC ${String(item.license || '').toUpperCase()} ${item.license_version || ''}`.trim();
  return { caption: `Foto: ${item.creator || 'tundmatu autor'} · ${license}`, credit: item.attribution || '', source: item.foreign_landing_url || '' };
}
