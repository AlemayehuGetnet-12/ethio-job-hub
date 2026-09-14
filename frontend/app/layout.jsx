import "./globals.css";
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import LanguageProvider from './context/LanguageProvider';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: "EthioJobs Connect",
  description: "Ethiopian job marketplace for job seekers and employers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            {/* pt-16 offsets the fixed top navbar so page content is not hidden under it */}
            <div className="flex-1 pt-16">{children}</div>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
