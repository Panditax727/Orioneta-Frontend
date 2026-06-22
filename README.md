# Orioneta Frontend

Interfaz web de Orioneta, una plataforma de mensajeria privada con amistades,
grupos, archivos, presencia en tiempo real, personalizacion y Neta Market.

## Enlaces

- Aplicacion: <https://orioneta.accesscam.org>
- Frontend: <https://github.com/Panditax727/Orioneta-Frontend>
- Backend: <https://github.com/OrionTheProgrammer/Orioneta-Backend>
- Rama de integracion y produccion: `main`

## Funcionalidades

- Registro e inicio de sesion local.
- Inicio de sesion con Google y GitHub.
- Perfil, avatar local, estado e insignias.
- Solicitudes de amistad por friend code.
- Chats privados y conversaciones grupales.
- Mensajes y presencia mediante WebSocket.
- Archivos, imagenes, audio y video almacenados por media-service/MinIO.
- Llamadas, camara y pantalla compartida mediante WebRTC.
- Configuracion, temas y Neta Market.
- Acuerdos de privacidad y tratamiento de datos.

## Tecnologias

- React 19 y React Router.
- Vite 8.
- Tailwind CSS y estilos por feature.
- Lucide React.
- Fetch API, WebSocket y WebRTC.
- Nginx como servidor de archivos estaticos.
- Caddy como terminador TLS y reverse proxy.

## Desarrollo

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Por defecto, Vite abre <http://localhost:5173>.

Para utilizar un gateway externo:

```env
VITE_API_BASE_URL=https://orioneta.accesscam.org
VITE_REALTIME_BASE_URL=https://orioneta.accesscam.org
```

Cuando ambas variables estan vacias, el frontend usa rutas same-origin. Este es
el modo empleado en produccion porque Caddy enruta `/api`, `/oauth2` y
`/ws` al backend.

## Calidad

```bash
npm run lint
npm run build
```

El pipeline exige que ambas tareas terminen correctamente antes de publicar la
imagen.

## Docker

El Dockerfile es multietapa:

1. `node:22-alpine` instala dependencias con `npm ci` y genera `dist`.
2. `nginx:1.27-alpine` sirve solo el resultado compilado.

```bash
docker build -t orioneta-frontend:local .
docker run --rm -p 5173:80 orioneta-frontend:local
curl http://localhost:5173/health
```

`.dockerignore` evita enviar dependencias locales, resultados anteriores y
archivos de entorno al contexto de construccion.

## Despliegue

El workflow [deploy-frontend.yml](.github/workflows/deploy-frontend.yml):

1. Se ejecuta con cada cambio en `main`.
2. Publica `latest` y una etiqueta con el SHA en Docker Hub.
3. Abre temporalmente SSH para la IP del runner.
4. Actualiza los contenedores de frontend y Caddy en Amazon EC2.
5. Valida Caddy y el endpoint `/health`.
6. Revoca la regla SSH incluso si el despliegue falla.

Produccion utiliza:

```text
Dynu -> EC2:80/443 -> Caddy
                         +-> React/Nginx
                         +-> NLB -> Gateway en EKS
```

HTTPS es obligatorio para camara, microfono, pantalla compartida y WebRTC.

## Estructura

```text
src/
├── features/    # vistas y logica por capacidad
├── router/      # rutas y proteccion de sesion
├── services/    # clientes REST y media
├── shared/      # componentes y estilos reutilizables
└── store/       # sesion y estado compartido
```

## Equipo

- [OrionTheProgrammer](https://github.com/OrionTheProgrammer)
- [Panditax727](https://github.com/Panditax727)

