"use client";
import Layout from "@/components/Layout";
import { Inter } from "next/font/google";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setAudioFile(file);
  };
  return (
    <>
      <Layout onFileUpload={handleFileUpload}>Hello</Layout>
    </>
  );
}
