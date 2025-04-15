import { Inter } from "next/font/google"; // 注意这里从 'next/font/google' 导入
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  // 不再需要 weight 数组，除非你需要特定字重
});

export const metadata = {
  title: "DeepSeek-clone",
  description: "Full Stack Project",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en" className={inter.variable}>
          <body className="antialiased">
            <Toaster
              toastOptions={{
                success: { style: { background: "green", color: "white" } },
                error: { style: { background: "red", color: "white" } },
              }}
            />
            {children}
          </body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
