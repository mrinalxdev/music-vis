import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Music, Upload } from 'lucide-react'

interface AddMusicProps {
  isOpen: boolean
  onClose: () => void
  onFileUpload: (file: File) => void
}

export const AddMusic: React.FC<AddMusicProps> = ({ isOpen, onClose, onFileUpload }) => {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = () => {
    if (file) {
      onFileUpload(file)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Music</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="music-file" className="text-right">
              File
            </Label>
            <Input
              id="music-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          {file && (
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleUpload} disabled={!file}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

