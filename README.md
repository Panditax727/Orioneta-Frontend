<div align="center">

# 🌌 Orioneta

Más que mensajes. Un universo conectado.

---

# 🌌 Orioneta Frontend

### Conectando personas en un universo digital.

Interfaz moderna • Arquitectura escalable • Diseño anime/cartoon • Microservicios

Orioneta es una plataforma de comunicación moderna diseñada para ofrecer una experiencia rápida, intuitiva y altamente personalizable.

El proyecto está siendo desarrollado bajo una arquitectura basada en microservicios con el objetivo de construir una plataforma escalable, mantenible y preparada para evolucionar junto a las necesidades de sus usuarios.

Nuestra visión es crear un ecosistema donde la comunicación, la colaboración y la interacción social convivan en una experiencia unificada, elegante y accesible.

</div>

---

## 📖 Descripción

Orioneta es una plataforma de comunicación desarrollada con un enfoque moderno en experiencia de usuario, rendimiento y escalabilidad.

El sistema está compuesto por múltiples servicios independientes que trabajan en conjunto para proporcionar funcionalidades de mensajería, gestión de usuarios, grupos privados, notificaciones y futuras herramientas colaborativas.

El frontend de Orioneta tiene como objetivo ofrecer una interfaz visual atractiva, consistente y fácil de utilizar, combinando diseño moderno, accesibilidad y personalización.

---

## 🚀 Visión

Construir una plataforma de comunicación capaz de adaptarse a diferentes formas de interacción digital, priorizando la libertad de personalización, la calidad de la experiencia de usuario y una arquitectura preparada para crecer a largo plazo.

Orioneta busca convertirse en un espacio donde la tecnología y el diseño trabajen juntos para crear una experiencia de comunicación única.

---

## 🌠 Filosofía

Cada decisión dentro de Orioneta está guiada por cinco principios fundamentales:

- Simplicidad.
- Escalabilidad.
- Seguridad.
- Rendimiento.
- Experiencia de usuario.

Creemos que una buena plataforma no solo debe funcionar correctamente, sino también sentirse agradable de utilizar.

---

## ✨ Características

- 🔐 Sistema de autenticación y autorización.
- 💬 Chats privados (1 a 1).
- 👥 Conversaciones grupales.
- 📸 Gestión de perfiles y avatares.
- 🌙 Interfaz moderna con modo oscuro.
- ⚡ Comunicación en tiempo real.
- 🎨 Diseño personalizado inspirado en anime/cartoon.
- 📱 Diseño responsive para múltiples dispositivos.
- 🔄 Integración con arquitectura de microservicios.

---

## 🏗️ Arquitectura

```text
Frontend (React + Vite)
        │
        ▼
API Gateway
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
Auth  User  Conversation
Service Service Service
```

El frontend consume los distintos microservicios mediante un API Gateway centralizado.

---

## 🛠️ Tecnologías

- React
- Vite
- JavaScript / TypeScript
- Tailwind CSS
- React Router
- WebSockets (Próximamente)

---

## 📂 Estructura del Proyecto

```text
src/
│
├── assets/
├── components/
├── pages/
├── layouts/
├── services/
├── hooks/
├── routes/
├── styles/
└── utils/
```

---

## 🚀 Instalación

### Clonar repositorio

```bash
git clone https://github.com/Panditax727/Orioneta-Frontend.git
```

### Entrar al proyecto

```bash
cd Orioneta-Frontend
```

### Instalar dependencias

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:5173
```

### Configurar conexion con backend

Crea un archivo `.env` usando el ejemplo incluido:

```bash
cp .env.example .env
```

Para backend local:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Para probar contra EC2, usa la URL publica del gateway:

```env
VITE_API_BASE_URL=http://TU_EC2_PUBLIC_DNS:8080
```

El realtime se deriva de `VITE_API_BASE_URL` y usa `/ws/chat`. Si necesitas
apuntar WebSocket a otra URL, puedes sobrescribirlo:

```env
VITE_REALTIME_BASE_URL=http://TU_EC2_PUBLIC_DNS:8080
```

El frontend espera estos endpoints del gateway:

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/oauth2/providers
GET  /oauth2/authorization/google
GET  /oauth2/authorization/github
```

Para login/registro con Google o GitHub, el `auth-service` debe redirigir al
frontend despues del proveedor externo:

```env
ORIONETA_OAUTH2_SUCCESS_REDIRECT_URI=http://localhost:5173/auth/oauth2/callback
ORIONETA_OAUTH2_FAILURE_REDIRECT_URI=http://localhost:5173/auth/oauth2/error
```

La respuesta de autenticacion debe incluir `accessToken`, `refreshToken`,
`tokenType`, `expiresInSeconds`, `userId`, `email` y `role`.

---

## 🌌 Visión del Proyecto

Orioneta busca convertirse en una plataforma de mensajería moderna donde la experiencia visual sea tan importante como la funcionalidad.

El proyecto está siendo desarrollado siguiendo principios de:

- Arquitectura Hexagonal
- Domain Driven Design (DDD)
- Clean Architecture
- GitHub Flow
- Microservicios

---

## 📌 Estado del Proyecto

🚧 En desarrollo activo

### Progreso actual

- [x] Diseño inicial
- [x] Configuración Frontend
- [x] Sistema de autenticación frontend conectado al gateway
- [ ] Chats privados
- [ ] Chats grupales
- [ ] WebSockets
- [ ] Notificaciones en tiempo real
- [ ] Sistema de archivos
- [ ] Videollamadas

---

## 👨‍💻 Equipo

### Orioneta Team

Desarrollado por:

**Panditax727**
**OrionTheProgrammer**

GitHub:

https://github.com/Panditax727

---

## 📜 Licencia

Este proyecto se encuentra bajo desarrollo privado.

Todos los derechos reservados © Orioneta.
