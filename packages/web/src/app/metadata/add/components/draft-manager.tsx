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
import {
  Loader2,
  Trash2,
  FileText,
  Clock,
  Save,
  Cloud,
  HardDrive,
} from "lucide-react"
import { NGDIMetadataFormData } from "@/types/ngdi-metadata"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  saveDraft as saveDraftToServer,
  getUserDrafts,
  getDraft,
  deleteDraft as deleteDraftFromServer,
} from "@/app/actions/draft"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DraftEntry {
  id: string
  data: Partial<NGDIMetadataFormData>
  timestamp: string
  title?: string
  isServerSide?: boolean
}

interface ServerDraft {
  id: string
  title: string
  lastUpdated: string
  createdAt: Date
}

interface DraftManagerProps {
  onLoadDraft: (data: Partial<NGDIMetadataFormData>) => void
  currentData?: Partial<NGDIMetadataFormData>
  formTitle?: string
}

export function DraftManager({
  onLoadDraft,
  currentData,
  formTitle,
}: DraftManagerProps) {
  const [drafts, setDrafts] = useState<DraftEntry[]>([])
  const [serverDrafts, setServerDrafts] = useState<ServerDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("local")

  // Load drafts from localStorage and server when opened
  useEffect(() => {
    if (open) {
      loadAllDrafts()
    }
  }, [open])

  // Function to load all drafts from localStorage
  const loadAllDrafts = async () => {
    setIsLoading(true)
    try {
      const allDrafts: DraftEntry[] = []

      // Local storage draft
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

      // Server drafts
      const response = await getUserDrafts()
      if (response.success && response.drafts) {
        setServerDrafts(response.drafts)
      } else {
        console.error("Error loading server drafts:", response.error)
      }
    } catch (e) {
      console.error("Error loading drafts:", e)
      toast.error("Failed to load saved drafts")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to load a specific local draft
  const handleLoadLocalDraft = (draft: DraftEntry) => {
    try {
      onLoadDraft(draft.data)
      setOpen(false)
      toast.success(`Loaded draft: ${draft.title || "Untitled"}`)
    } catch (e) {
      console.error("Error loading draft:", e)
      toast.error("Failed to load draft")
    }
  }

  // Function to load a specific server draft
  const handleLoadServerDraft = async (draftId: string) => {
    try {
      setIsLoading(true)
      const response = await getDraft(draftId)

      if (response.success && response.draft) {
        onLoadDraft(response.draft.data as Partial<NGDIMetadataFormData>)
        setOpen(false)
        toast.success(`Loaded draft: ${response.draft.title || "Untitled"}`)
      } else {
        toast.error("Failed to load draft")
      }
    } catch (e) {
      console.error("Error loading server draft:", e)
      toast.error("Failed to load draft")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to delete a local draft
  const handleDeleteLocalDraft = (draft: DraftEntry, e: React.MouseEvent) => {
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

  // Function to delete a server draft
  const handleDeleteServerDraft = async (
    draftId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation() // Prevent triggering the load draft action

    try {
      setIsLoading(true)
      const response = await deleteDraftFromServer(draftId)

      if (response.success) {
        // Update the server drafts list
        setServerDrafts(serverDrafts.filter((d) => d.id !== draftId))
        toast.success("Draft deleted")
      } else {
        toast.error("Failed to delete draft")
      }
    } catch (e) {
      console.error("Error deleting server draft:", e)
      toast.error("Failed to delete draft")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to save current draft to server
  const handleSaveToServer = async () => {
    if (!currentData || Object.keys(currentData).length === 0) {
      toast.error("No data to save")
      return
    }

    try {
      setIsSaving(true)
      const title =
        formTitle ||
        currentData.generalInfo?.dataInformation?.dataName ||
        "Untitled Draft"

      const draftData = {
        title,
        data: currentData,
        lastUpdated: new Date().toISOString(),
      }

      const response = await saveDraftToServer(draftData)

      if (response.success) {
        toast.success("Draft saved to server")
        // Refresh the drafts list
        await loadAllDrafts()
      } else {
        toast.error(`Failed to save draft: ${response.error}`)
      }
    } catch (e) {
      console.error("Error saving draft to server:", e)
      toast.error("Failed to save draft to server")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center space-x-2">
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Manage Drafts
          </Button>
        </DialogTrigger>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveToServer}
          disabled={
            isSaving || !currentData || Object.keys(currentData).length === 0
          }
          className="flex items-center"
          title="Save to server for persistence across devices"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="mr-2 h-4 w-4" />
          )}
          Save to Server
        </Button>
      </div>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Saved Drafts</DialogTitle>
          <DialogDescription>
            Load or delete your previously saved form drafts
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center">
              <HardDrive className="mr-2 h-4 w-4" />
              Local Drafts
            </TabsTrigger>
            <TabsTrigger value="server" className="flex items-center">
              <Cloud className="mr-2 h-4 w-4" />
              Server Drafts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No local drafts found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleLoadLocalDraft(draft)}
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
                    <Badge variant="secondary" className="mr-2">
                      Local
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteLocalDraft(draft, e)}
                      className="ml-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                      aria-label="Delete draft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="server" className="py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : serverDrafts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No server drafts found</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToServer}
                  disabled={
                    isSaving ||
                    !currentData ||
                    Object.keys(currentData).length === 0
                  }
                  className="mt-4 flex items-center mx-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Current Form
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {serverDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleLoadServerDraft(draft.id)}
                    className="flex items-center justify-between p-3 rounded-md border bg-card transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{draft.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {draft.lastUpdated
                          ? format(new Date(draft.lastUpdated), "PPp")
                          : "Unknown date"}
                      </div>
                    </div>
                    <Badge variant="secondary" className="mr-2">
                      Server
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteServerDraft(draft.id, e)}
                      className="ml-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                      aria-label="Delete draft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
