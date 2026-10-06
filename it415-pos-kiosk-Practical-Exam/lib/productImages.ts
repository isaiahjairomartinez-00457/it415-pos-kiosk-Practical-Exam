const PRODUCT_IMAGES: Record<string, string> = {
  "chicken inasal": "/images/products/chicken-inasal.jpg",
  "chicken inasal with rice": "/images/products/chicken-inasal-rice.jpg",
  "pork bbq meal": "/images/products/pork-bbq-meal.jpg",
  "java rice": "/images/products/java-rice.jpg",
  "iced tea": "/images/products/iced-tea.jpg",
  "halo-halo": "/images/products/halo-halo.jpg",
  atchara: "/images/products/atchara.jpg",
};

function normalizeProductName(productName: string) {
  return productName.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Resolves the real product artwork from the product's menu name. */
export function getProductImage(productName: string): string | undefined {
  return PRODUCT_IMAGES[normalizeProductName(productName)];
}
