import "../styles/globals.css";
import Providers from "./providers";

export const metadata = {
  title: "LegalAssist",
  description: "AI Legal Assistant and Document Analyzer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
