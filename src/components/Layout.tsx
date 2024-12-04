'use client'

import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { ToastAction } from "./ui/toast";
import { Button } from "./ui/button";
import { Music, PlusCircle, Settings } from "lucide-react";
import { Input } from "./ui/input";
import SupportedAudio from "./SupportedAudio";

interface LayoutProps {
  children: React.ReactNode;
  onFileUpload: (file: File) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onFileUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (file) {
      setIsUploading(true);
      try {
        if (!file.type.startsWith("audio/")) {
          throw new Error("Please upload an audio file.");

          await new Promise((resolve) => setTimeout(resolve, 1000));
          onFileUpload(file);
          toast({
            title: "File uploaded Successfully",
            description: `${file.name} is ready to visualise and edit`,
          });
        }
      } catch (error) {
        console.error("File upload error : ", error);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description:
            error instanceof Error
              ? error.message
              : "There was an error uploading your file. Please try again",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-300 text-gray-800">
      <aside className="w-full md:w-64 bg-gray-200 p-4 shadow-md">
        <h1 className="text-3xl font-bold mb-2">MusicVis</h1>
        <p className="text-sm font-light text-gray-400 mb-6">Edit music while visualising its beats</p>
        <nav className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Music
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
        <div
          className={`mt-6 border-2 border-dashed rounded-lg p-4 text-center ${
            dragOver ? "border-blue-500" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
            disabled={isUploading}
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Music className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {isUploading
                  ? "Uploading ..."
                  : "Drag and Drop you audio file here or click to browse"}
              </span>
            </div>
          </label>
        </div>
        <SupportedAudio />
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
};

export default Layout;
