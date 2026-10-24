export const formatPrice = (price: number) => `${price.toLocaleString("en-US")} ETB`

// Asks Cloudinary for a smaller, automatically optimized version of the image
export const optimizeImage = (url: string, width = 600) =>
  url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`)