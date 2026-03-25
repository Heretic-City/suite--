import type { Metadata } from "next";
import { ScaffoldStarkAppWithProviders } from "~~/components/ScaffoldStarkAppWithProviders";
import "~~/styles/globals.css";
import { ThemeProvider } from "~~/components/ThemeProvider";

// 1. THIS IS YOUR NEW METADATA (Banners, descriptions, favicons)
export const metadata: Metadata = {
  title: "Heretic City: suite--",
  description: "Step into web 3 through Heretic City",
  icons: "/logo.ico",
  
  openGraph: {
    title: "Heretic City: suite--",
    description: "Step into web 3 through Heretic City",
    url: "https://www.heretic.city", 
    siteName: "Heretic City",
    images: [
      {
        url: "/banner.png", 
        width: 1200,
        height: 630,
        alt: "Heretic City Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Heretic City: suite--",
    description: "Step into web 3 through Heretic City",
    images: ["/banner.png"], 
  },
};

// 2. THIS IS YOUR EXACT ORIGINAL PROVIDER WRAPPER
const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider enableSystem>
          <ScaffoldStarkAppWithProviders>
            {children}
          </ScaffoldStarkAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

// 3. ONLY ONE DEFAULT EXPORT
export default ScaffoldStarkApp;