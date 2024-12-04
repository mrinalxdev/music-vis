import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Settings, Upload, Music } from 'lucide-react'

import { ToastAction } from "@/components/ui/toast"
import { SupportedFormats } from './SupportedFormats'
import { AddMusic } from './AddMusic'
import { SettingsDialog } from './SettingsDialog'
import { useToast } from '@/hooks/use-toast'

interface LayoutProps {
  children: React.ReactNode
  onFileUpload: (file: File) => void
  onSettingsChange: (darkMode: boolean, quality: string) => void
}

export const Layout: React.FC<LayoutProps> = ({ children, onFileUpload, onSettingsChange }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (file: File) => {
    if (file) {
      setIsUploading(true)
      try {
        if (!file.type.startsWith('audio/')) {
          throw new Error('Please upload an audio file.')
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        onFileUpload(file)
        toast({
          title: "File uploaded successfully",
          description: `${file.name} is ready for visualization.`,
        })
      } catch (error) {
        console.error('File upload error:', error)
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error instanceof Error ? error.message : "There was an error uploading your file. Please try again.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground">
      <aside className="w-full md:w-64 bg-card p-4 shadow-md">
        <h1 className="text-2xl font-bold mb-2">MusicVis</h1>
        <p className='mb-6 text-xs font-light'>Edit Music while visualising its beat</p>
        <nav className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddMusicOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Music
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
        <div 
          className={`mt-6 border-2 border-dashed rounded-lg p-4 text-center ${dragOver ? 'border-primary bg-primary/20' : 'border-border'}`}
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
              <Music className="h-12 w-12 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {isUploading ? 'Uploading...' : 'Drag & drop your audio file here or click to browse'}
              </span>
            </div>
          </label>
        </div>
        <SupportedFormats />
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>
      <AddMusic isOpen={isAddMusicOpen} onClose={() => setIsAddMusicOpen(false)} onFileUpload={handleFileUpload} />
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSettingsChange={onSettingsChange} />
    </div>
  )
}

