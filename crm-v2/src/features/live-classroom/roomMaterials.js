// Õppevara files that can go on the board: images and PDFs.
export const fileKind = (file) => {
  const value = `${file?.contentType || file?.type || ''} ${file?.name || ''} ${file?.url || ''}`.toLocaleLowerCase('et');
  if (/image\/|\.(png|jpe?g|gif|webp)(\?|$)/.test(value)) return 'image';
  if (/application\/pdf|\.pdf(\?|$)/.test(value)) return 'pdf';
  return '';
};
