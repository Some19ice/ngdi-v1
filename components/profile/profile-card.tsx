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
  CardFooter,
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
  Check,
  Award,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Twitch,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import Image from "next/image"

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

  // Mock data for achievements - in a real app, these would come from your database
  const achievements = [
    { id: 1, name: "Early Adopter", icon: <Award className="h-4 w-4" /> },
    { id: 2, name: "Profile Completed", icon: <Check className="h-4 w-4" /> },
    {
      id: 3,
      name: "1 Year Member",
      icon: <CalendarDays className="h-4 w-4" />,
    },
  ]

  const isOnline = true // This would be dynamic in a real app

  // Function to format social links nicely
  const getSocialIcon = (url: string) => {
    if (url.includes("github")) return <Github className="h-4 w-4" />
    if (url.includes("linkedin")) return <Linkedin className="h-4 w-4" />
    if (url.includes("twitter") || url.includes("x.com"))
      return <Twitter className="h-4 w-4" />
    if (url.includes("facebook")) return <Facebook className="h-4 w-4" />
    if (url.includes("instagram")) return <Instagram className="h-4 w-4" />
    if (url.includes("youtube")) return <Youtube className="h-4 w-4" />
    if (url.includes("twitch")) return <Twitch className="h-4 w-4" />
    return <Globe className="h-4 w-4" />
  }

  // Expand social links to support more platforms
  const socialLinks = {
    github: profile.socialLinks?.github,
    linkedin: profile.socialLinks?.linkedin,
    twitter: profile.socialLinks?.twitter,
    facebook: profile.socialLinks?.facebook || null,
    instagram: profile.socialLinks?.instagram || null,
    youtube: profile.socialLinks?.youtube || null,
    twitch: profile.socialLinks?.twitch || null,
    website: profile.socialLinks?.website || null,
  }

  return (
    <Card className="overflow-hidden">
      {/* Profile banner/cover image */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt="Profile cover"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        )}
        {isEditable && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            asChild
          >
            <Link href="/profile/edit">
              <Edit className="h-4 w-4 mr-1" />
              Edit Profile
            </Link>
          </Button>
        )}
      </div>

      <CardHeader className="flex flex-row items-center gap-4 pt-0 -mt-10">
        <div className="relative">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={profile.image || undefined} alt={profile.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span
              className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background"
              title="Online"
            />
          )}
        </div>
        <div className="flex-1 pt-10">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              {profile.name}
              {profile.verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <CardDescription className="inline">
              {profile.organization && (
                <span className="text-muted-foreground">
                  {profile.organization}
                </span>
              )}
            </CardDescription>
            <Badge variant="outline" className="rounded-md">
              {profile.role}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Achievements section */}
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <HoverCard key={achievement.id}>
              <HoverCardTrigger asChild>
                <Badge variant="secondary" className="cursor-help">
                  {achievement.icon}
                  <span className="ml-1">{achievement.name}</span>
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">
                      {achievement.name}
                    </h4>
                    <p className="text-sm">
                      Earned for being an early supporter of the platform.
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>

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

            {Object.values(socialLinks).some((link) => link) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Social Links</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(socialLinks).map(([platform, url]) =>
                    url ? (
                      <Button
                        key={platform}
                        asChild
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={platform}
                        >
                          {getSocialIcon(url)}
                        </a>
                      </Button>
                    ) : null
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

        {/* Interests/Tags section */}
        {profile.interests && profile.interests.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 text-sm font-medium">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-end border-t pt-4">
        {isEditable && (
          <Button asChild variant="outline">
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
