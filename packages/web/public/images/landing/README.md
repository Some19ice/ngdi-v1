# Landing Page Images

This directory contains images displayed in the landing page carousel.

## Image Guidelines

- **Format**: Use WebP format for optimal performance (with fallback options if needed)
- **Dimensions**: Recommended size is 800x600 pixels
- **File Size**: Keep each image under 500KB for optimal loading performance
- **Quality**: Use high-quality, relevant images that represent the platform's purpose

## How to Add New Images

1. Add your image file to this directory
2. Update the `landingImages` array in `/lib/landing-images.ts`
3. Follow the existing structure:

```typescript
{
  src: "/images/landing/your-image-name.webp",
  alt: "Descriptive alt text",
  caption: "Optional caption text"
}
```

## Converting Images to WebP

You can convert images to WebP format using:

- **Online tools**: [Squoosh](https://squoosh.app/) or [Convertio](https://convertio.co/)
- **Command line**: Use cwebp tool
  ```
  cwebp -q 80 input.jpg -o output.webp
  ```

The carousel component will handle the loading and display of your images. 