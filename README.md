# Velasquez Food Truck Web

Proyecto Vite + React + TypeScript para Velasquez Food Truck.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Variables de entorno

Crea `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

## Estructura

```txt
src/
  components/   UI por secciones
  data/         datos estáticos del negocio y menú actual
  lib/          clientes externos como Supabase
  types/        tipos TypeScript compartidos
  utils/        funciones reutilizables
```
