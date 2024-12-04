import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange: (darkMode: boolean, quality: string) => void
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose, onSettingsChange }) => {
  const [darkMode, setDarkMode] = useState(false)
  const [quality, setQuality] = useState('medium')

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    const savedQuality = localStorage.getItem('visualizationQuality')

    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode))
    if (savedQuality) setQuality(savedQuality)
  }, [])

  const handleSave = () => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    localStorage.setItem('visualizationQuality', quality)
    onSettingsChange(darkMode, quality)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-foreground">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="quality" className="text-foreground">Visualization Quality</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

