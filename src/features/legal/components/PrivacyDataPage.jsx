import { ArrowLeft, Database, Eye, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../../../assets/logo.png";

const DATA_GROUPS = [
  {
    title: "Cuenta y perfil",
    text: "Nombre visible, correo, foto, biografia, codigo de amigo, estado y preferencias de visibilidad.",
  },
  {
    title: "Conversaciones",
    text: "Mensajes, archivos adjuntos, participantes, grupos privados, notificaciones y marcas de lectura.",
  },
  {
    title: "Personalizacion",
    text: "Temas, fondos, estilo de burbujas, fuentes, sonidos y ajustes que hacen tu espacio mas propio.",
  },
  {
    title: "Seguridad",
    text: "Datos tecnicos necesarios para iniciar sesion, mantener tu cuenta protegida y prevenir abuso.",
  },
  {
    title: "Diagnostico de beta",
    text: "Errores, estado de servicios, eventos de conexion y datos tecnicos minimos para corregir fallos durante la beta cerrada.",
  },
];

const USER_RIGHTS = [
  "Acceder a tus datos principales.",
  "Corregir informacion incompleta o desactualizada.",
  "Solicitar eliminacion cuando corresponda.",
  "Cambiar preferencias de visibilidad y personalizacion.",
  "Cerrar sesion y dejar de usar la cuenta cuando quieras.",
  "Pedir revision manual si un dato de beta parece incorrecto.",
];

export default function PrivacyDataPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <Link to="/login" className="legal-back-link">
          <ArrowLeft size={17} />
          Volver
        </Link>

        <div className="legal-brand">
          <img src={logoImage} alt="Orioneta" />
          <span>Orioneta</span>
        </div>

        <p className="legal-eyebrow">Privacidad y datos · Beta cerrada</p>
        <h1>Reglas claras para probar Orioneta con confianza.</h1>
        <p className="legal-lead">
          Este acuerdo resume que datos usa Orioneta durante la beta cerrada,
          para que se usan, que controles tienes y que limites existen mientras
          el producto sigue en validacion tecnica.
        </p>
      </section>

      <section className="legal-content">
        <div className="legal-card legal-card-highlight">
          <ShieldCheck size={22} />
          <div>
            <h2>Compromiso simple</h2>
            <p>
              Usamos tus datos para entregar mensajeria privada,
              personalizacion, seguridad de cuenta, almacenamiento de archivos
              y diagnostico operativo de la beta. No vendemos tus conversaciones
              ni usamos tus mensajes para publicidad externa.
            </p>
          </div>
        </div>

        <div className="legal-grid">
          {DATA_GROUPS.map((group) => (
            <article className="legal-card" key={group.title}>
              <Database size={19} />
              <h2>{group.title}</h2>
              <p>{group.text}</p>
            </article>
          ))}
        </div>

        <article className="legal-section">
          <h2>1. Datos que recopilamos</h2>
          <p>
            Recopilamos los datos que entregas al crear tu cuenta, los datos que
            generas al usar chats y grupos, y datos tecnicos necesarios para que
            la aplicacion funcione con estabilidad y seguridad. Durante la beta
            tambien podemos registrar errores de frontend/backend, salud de
            microservicios, identificadores tecnicos de sesion, tiempos de
            respuesta y eventos necesarios para reproducir fallos.
          </p>
        </article>

        <article className="legal-section">
          <h2>2. Para que usamos los datos</h2>
          <p>
            Los usamos para iniciar sesion, crear tu perfil, mostrar tus amigos,
            enviar y recibir mensajes, entregar notificaciones, guardar
            preferencias visuales, mantener la plataforma segura y diagnosticar
            problemas del servicio. En beta cerrada, el diagnostico sirve para
            priorizar correcciones, validar escalabilidad, revisar integracion
            de archivos y mejorar la experiencia antes de abrir el acceso.
          </p>
        </article>

        <article className="legal-section">
          <h2>3. Controles disponibles</h2>
          <ul>
            {USER_RIGHTS.map((right) => (
              <li key={right}>{right}</li>
            ))}
          </ul>
        </article>

        <article className="legal-section">
          <h2>4. Comparticion y terceros</h2>
          <p>
            Orioneta puede apoyarse en proveedores de infraestructura,
            autenticacion o almacenamiento para operar la plataforma. Esos
            proveedores deben usarse solo para prestar el servicio y bajo
            medidas razonables de seguridad. Si usas Google o GitHub para
            entrar, tambien se aplican sus condiciones propias.
          </p>
        </article>

        <article className="legal-section">
          <h2>5. Seguridad y conservacion</h2>
          <p>
            Aplicamos controles tecnicos para proteger la cuenta y limitar el
            acceso no autorizado. Conservamos los datos mientras sean necesarios
            para operar Orioneta, cumplir obligaciones, resolver incidentes o
            mantener la integridad de conversaciones y amistades. Los archivos
            subidos se almacenan mediante el servicio multimedia y MinIO; las
            referencias se guardan para que otros usuarios autorizados puedan
            ver avatares, adjuntos o temas publicados.
          </p>
        </article>

        <article className="legal-section">
          <h2>6. Limites de la beta cerrada</h2>
          <p>
            La beta cerrada no debe usarse para informacion altamente sensible,
            datos bancarios, documentos legales privados ni contenido que no
            quieras exponer a un entorno aun en pruebas. Aunque aplicamos buenas
            practicas, el objetivo de esta etapa es encontrar fallos y mejorar
            la estabilidad.
          </p>
        </article>

        <article className="legal-section">
          <h2>7. Base legal y actualizaciones</h2>
          <p>
            Este texto toma como referencia principios de transparencia,
            finalidad, seguridad y derechos de los titulares presentes en la
            normativa chilena de datos personales y en estandares modernos de
            informacion al usuario. Si Orioneta cambia funciones importantes,
            este acuerdo debe actualizarse.
          </p>
        </article>

        <div className="legal-card legal-card-footer">
          <LockKeyhole size={20} />
          <div>
            <h2>Contacto de privacidad</h2>
            <p>
              Puedes pedir ayuda sobre tus datos al equipo de Orioneta escribiendo
              a orioneta.noreply@gmail.com con el asunto "Privacidad Orioneta
              Beta". Tambien puedes pedir correccion, eliminacion razonable o
              revision de un incidente de datos.
            </p>
          </div>
        </div>

        <div className="legal-note">
          <Eye size={16} />
          <p>
            Ultima actualizacion: 28 de junio de 2026. Si cambiamos funciones
            importantes, tambien actualizaremos este acuerdo.
          </p>
        </div>
      </section>
    </main>
  );
}
