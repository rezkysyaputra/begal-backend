export const extractPublicId = (url: string): string => {
  // Memotong bagian '/upload/' dan versi di URL
  const afterUpload = url.split('/upload/')[1];
  // Memotong versi 'v...' dan mengambil hanya public_id tanpa ekstensi
  return afterUpload.split('/').slice(1).join('/').split('.')[0];
};
