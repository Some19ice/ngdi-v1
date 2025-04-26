"use client"

import { Download, Upload, FileUp, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProfileStatisticsSectionProps {
  downloads: number
  uploads: number
  contributions: number
}

export function ProfileStatisticsSection({
  downloads = 0,
  uploads = 0,
  contributions = 0,
}: ProfileStatisticsSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Activity Statistics</h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 p-3 rounded-md bg-muted/40 hover:bg-muted transition-colors">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-md">
              <Download className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Downloads</p>
              <p className="text-2xl font-bold">{downloads}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-md bg-muted/40 hover:bg-muted transition-colors">
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-md">
              <Upload className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Uploads</p>
              <p className="text-2xl font-bold">{uploads}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-md bg-muted/40 hover:bg-muted transition-colors">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-md">
              <FileUp className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Contributions</p>
              <p className="text-2xl font-bold">{contributions}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-md bg-muted/40 hover:bg-muted transition-colors">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-md">
              <TrendingUp className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Activity</p>
              <p className="text-2xl font-bold">
                {downloads + uploads + contributions}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
