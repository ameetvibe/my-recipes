"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void
  maxImages?: number
  disabled?: boolean
  initialImages?: string[]
}

export function ImageUpload({ onImagesChange, maxImages = 5, disabled = false, initialImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    const remainingSlots = maxImages - images.length
    const filesToUpload = filesArray.slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      alert(`You can only upload up to ${maxImages} images`)
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      const uploadedUrls: string[] = []

      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Please choose a file smaller than 5MB`)
          continue
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `recipe-images/${fileName}`

        // Upload file
        const { data, error } = await supabase.storage
          .from('recipe-images')
          .upload(filePath, file)

        if (error) {
          console.error('Upload error:', error)
          alert(`Failed to upload ${file.name}`)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onImagesChange(newImages)

    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled || uploading) return
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Recipe Images</label>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
          disabled || uploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-orange-300 hover:border-orange-500 cursor-pointer hover:bg-gradient-to-br hover:from-orange-50 hover:to-pink-50 hover:scale-[1.02] hover:shadow-lg'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-orange-600 font-medium">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full">
              <Upload className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB each (max {maxImages} images)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={url}
                  alt={`Recipe image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && !uploading && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 hover:border-orange-300 hover:from-orange-100 hover:to-pink-100 text-orange-700 font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add More Images ({images.length}/{maxImages})
        </Button>
      )}
    </div>
  )
}
