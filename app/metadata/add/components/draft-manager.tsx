"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, FileText, Clock } from "lucide-react"
import { NGDIMetadataFormData } from "@/types/ngdi-metadata"
import { toast } from "sonner"
import { format } from "date-fns"

interface DraftEntry {
  id: string
  data: Partial<NGDIMetadataFormData>
  timestamp: string
  title?: string
}

interface DraftManagerProps {
  onLoadDraft: (data: Partial<NGDIMetadataFormData>) => void
}

export function DraftManager({ onLoadDraft }: DraftManagerProps) {
  const [drafts, setDrafts] = useState<DraftEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // Load drafts from localStorage when opened
  useEffect(() => {
    if (open) {
      loadAllDrafts()
    }
  }, [open])

  // Function to load all drafts from localStorage
  const loadAllDrafts = () => {
    setIsLoading(true)
    try {
      const allDrafts: DraftEntry[] = []

      // Auto-saved draft
      const currentDraft = localStorage.getItem("ngdi-metadata-form-draft")
      if (currentDraft) {
        try {
          const data = JSON.parse(currentDraft)
          const title =
            data.generalInfo?.dataInformation?.dataName || "Untitled Draft"
          allDrafts.push({
            id: "current",
            data,
            timestamp: new Date().toISOString(),
            title,
          })
        } catch (e) {
          console.error("Error parsing current draft", e)
        }
      }

      setDrafts(allDrafts)
    } catch (e) {
      console.error("Error loading drafts:", e)
      toast.error("Failed to load saved drafts")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to load a specific draft
  const handleLoadDraft = (draft: DraftEntry) => {
    try {
      onLoadDraft(draft.data)
      setOpen(false)
      toast.success(`Loaded draft: ${draft.title || "Untitled"}`)
    } catch (e) {
      console.error("Error loading draft:", e)
      toast.error("Failed to load draft")
    }
  }

  // Function to delete a draft
  const handleDeleteDraft = (draft: DraftEntry, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the load draft action

    try {
      if (draft.id === "current") {
        localStorage.removeItem("ngdi-metadata-form-draft")
      } else {
        // For other saved drafts in the future
        localStorage.removeItem(`ngdi-metadata-form-${draft.id}`)
      }

      // Update the drafts list
      setDrafts(drafts.filter((d) => d.id !== draft.id))
      toast.success("Draft deleted")
    } catch (e) {
      console.error("Error deleting draft:", e)
      toast.error("Failed to delete draft")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Manage Drafts
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Saved Drafts</DialogTitle>
          <DialogDescription>
            Load or delete your previously saved form drafts
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No saved drafts found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleLoadDraft(draft)}
                  className="flex items-center justify-between p-3 rounded-md border bg-card transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {draft.title || "Untitled Draft"}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {draft.timestamp
                        ? format(new Date(draft.timestamp), "PPp")
                        : "Unknown date"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteDraft(draft, e)}
                    className="ml-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                    aria-label="Delete draft"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
