# Sistema de Imágenes Unificado

## Resumen

Todas las imágenes (posts, autores, categorías) ahora se almacenan en un único directorio compartido:

```
public/uploads/gallery/
```

## Cambios Principales

### Antes
- `public/uploads/blog/{slug}/` - Imágenes de posts
- `public/uploads/authors/{slug}/` - Avatares de autores  
- `public/uploads/categories/{slug}/` - Imágenes de categorías

### Ahora
- `public/uploads/gallery/` - TODAS las imágenes

## Ventajas

1. **Reutilización**: Una misma imagen puede ser usada en posts, autores y categorías
2. **Simplicidad**: Un solo lugar para administrar todas las imágenes
3. **Sin duplicados**: No es necesario subir la misma imagen varias veces
4. **Gestión más fácil**: Todas las imágenes visibles en una sola galería

## Componentes Actualizados

- `src/components/admin/PostForm.tsx` - Cover y body images
- `app/(admin)/admin/authors/page.tsx` - Avatar selection
- `app/(admin)/admin/categories/page.tsx` - Category image selection
- `src/components/admin/ImageGallery.tsx` - Gallery component (sin cambios)

## APIs Actualizadas

Se eliminó la funcionalidad de auto-mover imágenes cuando cambia el slug:

- `app/api/admin/posts/route.ts` - Eliminado moveUploads y rewriteImageUrl
- `app/api/admin/authors/route.ts` - Eliminado moveUploads y rewriteImageUrl
- `app/api/admin/categories/route.ts` - Eliminado moveUploads y rewriteImageUrl

## Migración

Si ya tenías imágenes en los directorios antiguos, ejecuta:

```bash
node scripts/migrate-images-to-gallery.js
```

Este script:
1. Encuentra todas las imágenes en subdirectorios
2. Las mueve a `gallery/`
3. Maneja conflictos de nombres agregando sufijos numéricos
4. Limpia directorios vacíos

## Uso

### Admin Panel

Cuando subas o selecciones imágenes en cualquier parte del admin:
- Posts (cover y body)
- Authors (avatar)
- Categories (image)

Todas las imágenes se subirán a `gallery/` y podrás ver TODAS las imágenes disponibles en la galería, sin importar dónde las vayas a usar.

### Upload API

```
POST /api/upload
Body: { file, destDir: "gallery" }
```

```
GET /api/upload?dir=gallery&recursive=true
```

```
DELETE /api/upload?rel=gallery/filename.jpg
```

## Notas

- Las URLs de imágenes en la base de datos siguen siendo completas: `/uploads/gallery/image.jpg`
- El componente `ImageGallery` acepta `destDir="gallery"` en todos los lugares
- No hay cambios en cómo se muestran las imágenes en las páginas públicas
