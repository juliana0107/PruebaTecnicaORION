# ORION Maintenance Lite

Sistema de gestión centralizada de mantenimiento de infraestructura ITS (Intelligent Transportation Systems) para la concesión vial **Autopistas Inteligentes S.A.**

## Descripción

ORION Maintenance Lite centraliza la gestión del ciclo de vida del mantenimiento de los activos ITS de la concesión: Paneles de Mensajería Variable (PMV), Cámaras CCTV, Estaciones Meteorológicas, Sensores de Tráfico y Aforadores.

El sistema permite administrar activos, crear y gestionar órdenes de trabajo preventivas y correctivas, asignar cuadrillas y visualizar indicadores operacionales desde un dashboard consolidado.

## Stack tecnológico

- **Backend:** Node.js 22 + Express 5 + TypeScript
- **Base de datos:** PostgreSQL 15
- **Validación:** Zod
- **Autenticación:** JWT + bcrypt
- **Testing:** Vitest
- **Frontend:** React 19 + Vite + TypeScript + TanStack React Query
- **Infraestructura:** Docker + Docker Compose

## Ejecución

```bash
docker compose up

## Seeders

docker exec -i orion_postgres psql -U orion_user -d orion_maintenance < backend/src/db/seed-demo.sql