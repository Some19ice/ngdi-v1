"use client"

import Link from "next/link"
import { type ProfileCardProps } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CalendarDays,
  Mail,
  MapPin,
  Building,
  Edit,
  Phone,
  Briefcase,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function ProfileCard({ profile, isEditable = false }: ProfileCardProps) {
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.image || undefined} alt={profile.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="flex items-center gap-4">
            {profile.name}
            {isEditable && (
              <Button asChild variant="ghost" size="icon">
                <Link href="/profile/edit">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit profile</span>
                </Link>
              </Button>
            )}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Badge variant="outline">{profile.role}</Badge>
            {profile.organization && (
              <span className="text-muted-foreground">
                • {profile.organization}
              </span>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}

            {profile.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.organization && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{profile.organization}</span>
              </div>
            )}

            {profile.department && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{profile.department}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>

            {profile.socialLinks && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Social Links</p>
                <div className="flex gap-2">
                  {profile.socialLinks.github && (
                    <Button asChild variant="outline" size="icon">
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                      </a>
                    </Button>
                  )}

                  {profile.socialLinks.linkedin && (
                    <Button asChild variant="outline" size="icon">
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                    </Button>
                  )}

                  {profile.socialLinks.twitter && (
                    <Button asChild variant="outline" size="icon">
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                        <span className="sr-only">Twitter</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {profile.bio && (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 text-sm font-medium">Bio</h3>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </div>
          </>
        )}

        <div className="flex justify-end">
          {isEditable && (
            <Button asChild variant="outline">
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
