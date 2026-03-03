const baseUrl =
  typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://cote-cour.fr";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Côté-Cour",
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "MultimediaApplication",
  operatingSystem: "Web, Mobile",
  description:
    "Application d'aide à la mémorisation des textes et répliques pour les étudiants en théâtre et comédiens.",
  url: baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`,
  inLanguage: "fr",
  offers: {
    "@type": "Offer",
    price: "5",
    priceCurrency: "EUR",
  },
};

export function JsonLdSoftwareApplication() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
