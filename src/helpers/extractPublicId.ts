export const extractPublicId = (url: string): string => {
  const afterUpload = url.split('/upload/')[1];
  return afterUpload.split('/').slice(1).join('/').split('.')[0];
};
