# Prueba técnica — Front (Pacientes)

Aplicación **Angular 16** con **PrimeNG** para gestionar pacientes contra una **ASP.NET Core Web API** (`/api/patients`).

## Requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado)
- npm (incluido con Node)
- Backend en ejecución (o ajustar proxy) para operaciones reales

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
ng serve
```

La app se sirve en `http://localhost:4200/`. Las peticiones van a `environment.apiUrl` (`/api` por defecto). El archivo [`proxy.conf.json`](proxy.conf.json) reenvía `/api` al backend (por defecto `https://localhost:7152`). **Edita el puerto o el `target`** para que coincida con el de tu API (por ejemplo el de `launchSettings.json`).

### Proxy y CORS

Con el proxy del CLI, el navegador llama al mismo origen (`localhost:4200/api/...`) y el servidor de desarrollo reenvía al Kestrel, evitando problemas de CORS en local.

## Build de producción

```bash
ng build
```

Salida en `dist/prueba-tecnica-front/`. Configura el servidor web o el host de la SPA para servir `index.html` en rutas profundas y define la URL base del API en producción si no usas el mismo origen.

## Pruebas unitarias

```bash
ng test
```

Incluye pruebas del `PatientService` con `HttpTestingController` (verbos GET/POST/PUT/DELETE y `created-after`), más pruebas de utilidades de exportación CSV.

## Exportación Excel / CSV por fecha de creación

En **Pacientes**, el botón **«Exportar por fecha…»** abre un modal con un calendario. Los datos provienen de `GET /api/patients/created-after?fromDate=...` (misma lógica que el stored procedure `GetPatientsCreatedAfter`: pacientes con `CreatedAt` **estrictamente mayor** al valor enviado).

- **`fromDate`**: se calcula como **inicio del día local** (00:00 en la zona horaria del navegador) y se envía en **ISO 8601** (`startOfLocalDayIso` en [`export-helpers.ts`](src/app/features/patients/utils/export-helpers.ts)). Si el backend interpreta el instante en UTC u otra zona, valida que coincida con tu modelo en SQL Server.
- **Excel**: generación en el cliente con la librería **`xlsx`** (SheetJS); descarga un `.xlsx`.
- **CSV**: UTF-8 con **BOM** al inicio para que Excel en Windows reconozca tildes y caracteres especiales.

Si no hay filas para esa fecha, se muestra un aviso y no se descarga archivo.

## Arquitectura y decisiones técnicas

- **Feature `patients`**: listado con tabla **paginada en servidor** (`p-table` lazy), formulario reactivo para alta/edición (PUT solo con campos modificados), detalle con bloque de **citas** preparado para futuro endpoint (solo lectura, vacío), y **exportación** por fecha (`p-dialog` + helpers en `utils/export-helpers.ts`).
- **`core/http`**: interceptor funcional HTTP que muestra errores con **PrimeNG Toast** (`MessageService`), incluyendo `message`, `details[]` si existen, 404 sin cuerpo y fallos de red.
- **Entornos**: [`src/environments/environment.ts`](src/environments/environment.ts) (producción) y [`src/environments/environment.development.ts`](src/environments/environment.development.ts) (desarrollo vía `fileReplacements` en `angular.json`), con `apiUrl` centralizado.
- **Contrato JSON**: los modelos TypeScript usan **camelCase** (convención habitual de ASP.NET Core con `System.Text.Json`). Si tu API devuelve **PascalCase**, alinea las interfaces o configura el backend para un único estilo coherente.

## Rutas principales

| Ruta               | Descripción        |
| ------------------ | ------------------ |
| `/patients`        | Listado            |
| `/patients/new`    | Crear              |
| `/patients/:id`    | Detalle            |
| `/patients/:id/edit` | Editar           |
