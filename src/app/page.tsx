'use client'

import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import AudioVisualizer from '../components/AudioVisualizer'
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [visualizationQuality, setVisualizationQuality] = useState('medium')

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    const savedQuality = localStorage.getItem('visualizationQuality')

    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode))
    if (savedQuality) setVisualizationQuality(savedQuality)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleFileUpload = (file: File) => {
    setAudioFile(file)
  }

  const handleSettingsChange = (newDarkMode: boolean, newQuality: string) => {
    setDarkMode(newDarkMode)
    setVisualizationQuality(newQuality)
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout onFileUpload={handleFileUpload} onSettingsChange={handleSettingsChange}>
        {audioFile ? (
          <AudioVisualizer audioFile={audioFile} quality={visualizationQuality} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-2xl text-muted-foreground">Upload an audio file to start visualizing</p>
          </div>
        )}
      </Layout>
      <Toaster />
    </div>
  )
}

