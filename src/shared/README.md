## SHARED

### Components
-   Button - Botón con variantes (primary, ghost, danger, subtle) y tamaños
-   Input - Input con label, error, icon y rightElement
-   Modal - Modal reutilizable con header, content y footer
-   Avatar - Avatar con soporte para imagen o iniciales y estado online
-   Badge - Badge con variantes (primary, success, warning, error, info) y tamaños
-   Loader - Spinner de carga

### Hooks
-   useTheme - Hook para acceder al sistema de tema
-   useMediaQuery - Hook para detectar media queries y breakpoints
-   useAuth - Hook para autenticación (por implementar)
-   useWebSocket - Hook para conexiones WebSocket (por implementar)

### Utils
-   helpers.js - Funciones helper (formatRelativeTime, formatFileSize, truncateText, etc.)
-   constants.js - Constantes de la aplicación (API endpoints, límites, etc.)
-   validators.js - Validadores (email, password, username)

### Theme
-   colors.js - Sistema de colores basado en el diseño
-   typography.js - Sistema de tipografía
-   spacing.js - Sistema de espaciado y breakpoints
-   index.js - Exportación unificada del tema