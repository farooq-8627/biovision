import './globals.css';
import { Inter } from 'next/font/google';
import { WebRTCProvider } from '@/context/WebRTCContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BioVision - Real-time Biometric Analysis',
  description: 'A Next.js application for real-time video analysis with eye-tracking, emotion detection, and heart rate monitoring',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebRTCProvider>
          {children}
        </WebRTCProvider>
      </body>
    </html>
  );
}
