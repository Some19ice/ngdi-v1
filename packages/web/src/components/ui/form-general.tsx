'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Checkbox } from './checkbox';
import { Label } from './label';

const generalSchema = z.object({
  author: z.string().min(1, "Author is required"),
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  dateFrom: z.date(),
  dateTo: z.date(),
  abstract: z.string().min(50, "Abstract must be at least 50 characters"),
  purpose: z.string().min(50, "Purpose must be at least 50 characters"),
  thumbnail: z.string().url("Invalid URL format"),
  frameworkType: z.string().min(1, "Framework type is required"),
  categories: z.array(z.string()).min(1, "At least one category must be selected"),
});

type GeneralFormData = z.infer<typeof generalSchema>

interface FormGeneralProps {
  onNext: (data: GeneralFormData) => void
  initialData?: Partial<GeneralFormData>
}

export function FormGeneral({ onNext, initialData }: FormGeneralProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralFormData>({
    resolver: zodResolver(generalSchema),
    defaultValues: initialData,
  })

  const categories = [
    "Water Bodies",
    "Boundaries",
    "Education",
    "Elevation",
    "Environment",
    "Geographic Information",
    "Health",
    "Imagery/Earthly Observations",
    "Transportation",
    "Utilities",
  ]

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Author</Label>
          <Input {...register("author")} />
          {errors.author && (
            <span className="text-red-500 text-sm">
              {errors.author.message?.toString()}
            </span>
          )}
        </div>

        <div>
          <Label>Title</Label>
          <Input {...register("title")} />
          {errors.title && (
            <span className="text-red-500 text-sm">
              {errors.title.message?.toString()}
            </span>
          )}
        </div>

        <div>
          <Label>Organization</Label>
          <Input {...register("organization")} />
          {errors.organization && (
            <span className="text-red-500 text-sm">
              {errors.organization.message}
            </span>
          )}
        </div>

        <div>
          <Label>Date From</Label>
          <Input type="date" {...register("dateFrom")} />
          {errors.dateFrom && (
            <span className="text-red-500 text-sm">
              {errors.dateFrom.message}
            </span>
          )}
        </div>

        <div>
          <Label>Date To</Label>
          <Input type="date" {...register("dateTo")} />
          {errors.dateTo && (
            <span className="text-red-500 text-sm">
              {errors.dateTo.message}
            </span>
          )}
        </div>

        <div className="col-span-2">
          <Label>Abstract</Label>
          <Textarea {...register("abstract")} rows={4} />
          {errors.abstract && (
            <span className="text-red-500 text-sm">
              {errors.abstract.message}
            </span>
          )}
        </div>

        <div className="col-span-2">
          <Label>Purpose</Label>
          <Textarea {...register("purpose")} rows={4} />
          {errors.purpose && (
            <span className="text-red-500 text-sm">
              {errors.purpose.message}
            </span>
          )}
        </div>

        <div className="col-span-2">
          <Label>Thumbnail URL</Label>
          <Input {...register("thumbnail")} />
          {errors.thumbnail && (
            <span className="text-red-500 text-sm">
              {errors.thumbnail.message}
            </span>
          )}
        </div>

        <div className="col-span-2">
          <Label>Framework Data Type</Label>
          <select
            {...register("frameworkType")}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a type</option>
            <option value="vector">Vector</option>
            <option value="raster">Raster</option>
            <option value="tabular">Tabular</option>
          </select>
          {errors.frameworkType && (
            <span className="text-red-500 text-sm">
              {errors.frameworkType.message}
            </span>
          )}
        </div>

        <div className="col-span-2">
          <Label>Categories</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {categories.map((category) => (
              <Label key={category} className="flex items-center space-x-2">
                <Checkbox value={category} {...register("categories")} />
                <span>{category}</span>
              </Label>
            ))}
          </div>
          {errors.categories && (
            <span className="text-red-500 text-sm">
              {errors.categories.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Next →</Button>
      </div>
    </form>
  )
} 