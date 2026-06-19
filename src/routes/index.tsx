import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import logisticsFlowAsset from "@/assets/proceso5411.png";
import DependeMarca from "@/assets/DependeMarca.png";
import heroImage from "@/assets/hero.png";
import slackConfirmaLlegadaAsset from "@/assets/Slack.png";
import cajaArmada from "@/assets/cajaArmada.png";
import pedirAprobacion from "@/assets/Autorizacion.png";
import {
  ClipboardList,
  Warehouse,
  Users,
  Inbox,
  Link2,
  ListChecks,
  FileText,
  PackageCheck,
  AlertTriangle,
  Boxes,
  Truck,
  ScanLine,
  PackageOpen,
  ClipboardCheck,
  Forklift,
  Play,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Proceso 5411 — Guía Interactiva Logística" },
      {
        name: "description",
        content:
          "Guía interactiva del proceso operativo logístico 5411: inbound, outbound, shipping y returns paso a paso.",
      },
      { property: "og:title", content: "Proceso 5411 — Guía Interactiva" },
      {
        property: "og:description",
        content:
          "Explorá el proceso 5411 fase por fase: roadmap, diagramas, responsables y documentación.",
      },
    ],
  }),
  component: Index,
});

// Definición de tipos para soportar acciones multimedia específicas
type ActionType = "asn" | "box" | "labels" | "tracker" | "compare_tracking" | "recepcion_ordenes" | "cargar_orden_mintsoft" | "mandar_a_armar_orden" | "caja_armada_ejemplo" | "explicacion_ups_tracker" | "ejemplo_autorizacion";

type Stage = {
  id: string;
  number: number;
  name: string;
  short: string;
  objective: string;
  responsible: string;
  inputs: string[];
  activities: {
    title: string;
    detail?: string;
    blocks?: { type: "text" | "button"; content?: string; action?: ActionType }[];
    items?: string[];
  }[];
  docs: string[];
  outputs: string[];
  dependencies: string[];
  warehouse: string;
  critical?: string[];
  phaseColor?: string;
  phaseVar: string;
};

// Configuración centralizada de recursos multimedia para evitar lógica dura repetitiva
const MEDIA_RESOURCES: Record<string, { title: string; type: "video" | "audio" | "image"; src: string }> = {
  asn: { title: "Cómo crear un ASN", type: "video", src: "https://www.youtube.com/embed/y7goZ96k0eY?autoplay=1&rel=0" },
  box: { title: "Cómo crear una caja", type: "video", src: "https://www.youtube.com/embed/doRO4KPgpFo?autoplay=1&rel=0" },
  tracker: { title: "Explicación de Tracker", type: "video", src: "video de tracker" },
  labels: { title: "Cómo Enviar labels", type: "video", src: "https://www.youtube.com/embed/Ox7jbakLZK8" },
  compare_tracking: { title: "ASN REPORT", type: "video", src: "https://www.youtube.com/embed/98-NbpaRlWw" },
  warehouse_camilo: { title: "Video del Warehouse - Camilo", type: "video", src: "https://www.youtube.com/embed/0MqtGJ3c_pY" },
  audio_camilo: { title: "Perspectiva de Camilo - Audio", type: "audio", src: "audio camilo" },
  samuel_inbound: { title: "Video de Samuel", type: "video", src: "https://www.youtube.com/embed/_46d3mhvRwI" },
  generic_warehouse: { title: "Video del Warehouse", type: "video", src: "https://www.youtube.com/embed/eJvWNrbTwZc?autoplay=1&rel=0" },
  recepcion_ordenes: {
    title: "Recepción de órdenes",
    type: "video",
    src: "URL_DEL_VIDEO_O_GUIA"
  },

  cargar_orden_mintsoft: {
    title: "Cómo cargar una orden",
    type: "video",
    src: "URL_DEL_VIDEO_O_GUIA"
  },
  mandar_a_armar_orden: {
    title: "Cómo mandar a armar una orden",
    type: "video",
    src: "URL_DEL_VIDEO_O_GUIA"
  },
  caja_armada_ejemplo: {
    title: "Caja armada - Ejemplo",
    type: "image",
    src: cajaArmada,
  },

  explicacion_ups_tracker: {
    title: "Explicación UPS y Tracker",
    type: "video",
    src: "URL_DEL_VIDEO_O_GUIA"
  },
  ejemplo_autorizacion: {
    title: "Ejemplo de autorización",
    type: "image",
    src: pedirAprobacion
  },
};

const STAGES: Stage[] = [
  {
    id: "inbound",
    number: 1,
    name: "Inbound",
    short: "Entrada de mercadería al warehouse",
    objective:
      "El cliente avisa que viene mercadería en camino y se prepara el sistema para recibirla correctamente en el warehouse.",
    responsible: "Equipo BS AS / Operaciones",
    inputs: ["Mail del cliente con Tracking", "Excel o PDF con Packing List"],
    activities: [
      {
        title: "1. Recepción del Packing List",
        blocks: [
          { type: "text", content: "La marca envía mail con tracking # + Packing List." },
          { type: "text", content: " Con este documento creamos el ASN = significa Advanced Shipping Notice (Aviso de Envío Anticipado) " },
          { type: "button", action: "asn", content: "Como crear un ASN" },
          { type: "text", content: "Y también creamos las CAJAS en Mintsoft. Para que el warehouse sepa cuantas cajas hay en el cargamento." },
          { type: "button", action: "box", content: "Como crear una caja" },
          { type: "text", content: "Lo ideal es cargarlo antes de que la mercadería llegue al warehouse para avisarle al sistema y al equipo de Dallas que hay un cargamento próximo a llegar." }
        ]
      },
      {
        title: "2. Tracker de la marca",
        detail: "Cada marca tiene si tracker donde ponemos la información de las órdenes y los cargamentos. Una vez generado el ASN debemos anotarlo en la hoja de cargamentos (ASN# +tracking, unidades, caja y ETA).",
        blocks: [{ type: "button", action: "tracker", content: "Explicación de Tracker" }],
      },
      {
        title: "3. Cargamento",
        blocks: [
          {
            type: "text",
            content: "Una vez que se recibe la foto de camilo por el grupo, anotamos en el Tracking and hacemos el envío de las carton labes (email INBOUND con el nombre de la marca, el número de cargamento y carton labels). Si hay cajas faltantes esperar a que llegue el restante y hablar con la marca si hace falta."
          },
          {
            type: "button",
            action: "labels",
            content: "Como Enviar labels"
          }
        ]
      },
      {
        title: "4. Validation Tracking vs ASN -  Respuesta a la marca",
        detail: "Se compara el tracking físico contra el ASN cargado en el sistema. Una vez que finaliza el escaneo, se le envía a la marca el ASN REPORT.(Si es que lo pide)",
        blocks: [{ type: "button", action: "compare_tracking", content: "ASN REPORT" }],
      },
    ],
    docs: ["Packing List", "ASN Template", "Tracker de la marca"],
    outputs: ["ASN cargado en Mintsoft", "Tracker actualizado"],
    dependencies: ["Aviso previo del cliente"],
    warehouse:
      "1. Camilo recepciona la mercadería y sube las fotos de los cargamentos a Slack al grupo de la marca.",
    critical: [
      "Verificar que el ASN se esté generando para el cliente correcto. Siempre filtrar al cliente antes de empezar a cargar.",
      "Si un producto no está creado, incluir sus códigos de barras (barcodes) al cargar el ASN.",
      "Confirmar que el ASN se encuentre en estado 'AWAITING DELIVERY'; de lo contrario, Samuel no podrá visualizarlo.",
      "Al crear las cajas, seleccionar siempre la opción 'RS Transit'."
    ],
    phaseVar: "--phase-1",
  },
  {
    id: "outbound",
    number: 3,
    name: "Outbound",
    short: "Preparación de órdenes de salida",
    objective:
      "Procesar los pedidos que van a salir del warehouse hacia boutiques o majors. Una orden es un pedido de productos a preparar y enviar.",
    responsible: "Equipo BS AS",
    inputs: ["Órdenes recibidas por mail", "Stock validado"],
    activities: [
      {
        title: "Proceso de recepción y preparación de órdenes",
        blocks: [
          {
            type: "text",
            content: "Las órdenes pueden recibirse por distintas vías según la modalidad de trabajo con cada marca."
          },
          {
            type: "text",
            content: "• Por correo electrónico."
          },
          {
            type: "text",
            content: "• Incluidas dentro de la información enviada al momento de asignar el cargamento."
          },
          {
            type: "text",
            content: "• Buscándolas directamente en la plataforma utilizada por la marca."
          },
          {
            type: "text",
            content: "Una vez recibidas, todas las órdenes deben ingresarse en el Tracker para realizar su seguimiento operativo."
          },
          {
            type: "button",
            action: "recepcion_ordenes",
            content: "Ver recepción de órdenes"
          },
          {
            type: "text",
            content: "Las órdenes se clasifican según su tipo:"
          },
          {
            type: "text",
            content: "• Major"
          },
          {
            type: "text",
            content: "• Boutique"
          },
          {
            type: "text",
            content: "Luego se define la modalidad operativa:"
          },
          {
            type: "text",
            content: "• Cross Dock: ingreso y despacho inmediato de la mercadería."
          },
          {
            type: "text",
            content: "• Pick & Pack: preparación de pedidos a partir de la mercadería recibida."
          },
          {
            type: "text",
            content: "Finalizada la verificación, la orden se carga en Mintsoft utilizando el template SOL X TEST para su correcta gestión y seguimiento."
          },
          {
            type: "button",
            action: "cargar_orden_mintsoft",
            content: "Cómo cargar una orden"
          }
        ]
        
      },
      {
        title: "Mandar a armar las órdenes",
        blocks: [
          {
            type: "text",
            content:
              "Mandar a armar una orden significa que se debe solicitar al warehouse que prepare y arme la caja correspondiente a la orden. Una vez finalizado el armado, el warehouse enviará una fotografía donde se visualizan las medidas de la caja."
          },
          {
            type: "text",
            content:
              "Las órdenes de Boutique y Major tienen procesos distintos y es importante respetar las reglas de armado."
          },
          {
            type: "text",
            content:
              "BOUTIQUES"
          },
          {
            type: "text",
            content:
              "• Crear batches de hasta 50 unidades o 5 órdenes."
          },
          {
            type: "text",
            content:
              "• Utilizar como referencia: 'Boutique - Fecha de hoy'."
          },
          {
            type: "text",
            content:
              "• Si una orden tiene prioridad sobre otra, crearla en un batch separado y avisar la prioridad al warehouse."
          },
          {
            type: "text",
            content:
              "MAJORS"
          },
          {
            type: "text",
            content:
              "• Crear 1 batch por orden."
          },
          {
            type: "text",
            content:
              "• Si la orden tiene stores, incluir hasta 2 stores por batch."
          },
          {
            type: "text",
            content:
              "• Utilizar como referencia: 'MAJOR - #PO'."
          },
          {
            type: "text",
            content:
              "Recordatorio: Anotar en el Tracker que la orden entro a Mintsoft"
          },
          {
            type: "button",
            action: "mandar_a_armar_orden",
            content: "Cómo mandar a armar una orden"
          }
        ]
      },
      {
        title: "Sacar órdenes",
        blocks: [
          {
            type: "text",
            content:
              "Cuando se solicita 'sacá esta orden', significa que la orden ya fue preparada por el warehouse y se encuentra lista para ser despachada a su destino correspondiente, ya sea una Boutique o un Major."
          },
          {
            type: "text",
            content:
              "La recepción de la foto enviada por el warehouse confirma que la caja ya fue armada y está lista para los siguientes pasos del proceso."
          },
          {
            type: "button",
            action: "caja_armada_ejemplo",
            content: "Caja armada - Ejemplo"
          },
          {
            type: "text",
            content:
              "En algunos casos, aunque la orden esté preparada, no puede despacharse inmediatamente. Es necesario contar con la autorización del cliente, del Major o de la Boutique antes de coordinar la salida desde el warehouse."
          },
          {
            type: "button",
            action: "ejemplo_autorizacion",
            content: "Autorización - Ver ejemplo"
          },
          {
            type: "text",
            content:
              "Una vez solicitada la autorización, se debe actualizar el Tracker indicando que la orden se encuentra 'routeada'. Esto significa que ya se notificó al cliente que la caja está lista para salir del warehouse y que se está esperando la aprobación final para proceder con el despacho."
          },
          {
            type: "text",
            content:
              "Cuando se recibe la autorización, o cuando la orden no requiere aprobación previa, se puede proceder con el despacho. Este proceso puede realizarse de forma manual a través de UPS o de forma automática cuando la integración entre Mintsoft y UPS ya se encuentra configurada."
          },
          {
            type: "button",
            action: "explicacion_ups_tracker",
            content: "Explicación UPS y Tracker"
          },
          {
            type: "text",
            content:
              "Una vez despachada la orden, se debe registrar el Tracking Number en el Tracker y actualizar el estado de la orden para reflejar que el envío ya fue realizado."
          }
        ]
      }
    ],
    docs: ["Packing list de outbound", "Mail con orden original"],
    outputs: ["Órdenes clasificadas y listas para cargar"],
    dependencies: ["Stock disponible (Gestión de Stock)"],
    warehouse:
      "1. El warehouse entiende qué órdenes preparar, qué productos buscar y si deben rearmar cajas o despachar directo.",
    critical: ["Identificar correctamente Cross Dock vs Pick & Pack"],
    phaseVar: "--phase-4",
  },
  {
    id: "ordenes-mintsoft",
    number: 4,
    name: "Órdenes en Mintsoft",
    short: "Carga formal de órdenes",
    objective: "Cargar formalmente las órdenes en Mintsoft para que el warehouse pueda verlas.",
    responsible: "Equipo Outbound",
    inputs: ["Packing list outbound", "Template de Sol"],
    activities: [
      {
        title: "1. Upload New Order",
        items: ["Ruta: Orders → Upload New Order"],
      },
      { title: "2. Selección de cliente" },
      { title: "3. Template de Sol" },
      { title: "4. Channel", items: ["Major", "Boutique"] },
      {
        title: "Estados de órdenes (en el Excel tracker)",
        items: ["Entered", "Packing", "Packed", "Routed", "Shipped"],
      },
    ],
    docs: ["Template de Sol", "Tracker Excel"],
    outputs: ["Orden cargada y visible en Mintsoft"],
    dependencies: ["Outbound (clasificación lista)"],
    warehouse: "La orden aparece en el sistema y el warehouse puede verla y prepararla.",
    phaseVar: "--phase-5",
  },
  {
    id: "stock",
    number: 5,
    name: "Gestión de Stock",
    short: "Validación de inventario real",
    objective: "Verificar que el stock esté correctamente ubicado y alocado en el sistema.",
    responsible: "Equipo Stock + Warehouse (Samu)",
    inputs: ["Orden cargada in Mintsoft"],
    activities: [
      {
        title: "Estado NEW",
        detail: "Stock asignado correctamente — todo listo para preparar.",
        items: ["Los productos ya están ubicados en estanterías", "El sistema puede encontrarlos"],
      },
      {
        title: "Estado ONBACKORDER",
        detail:
          "El stock existe físicamente PERO no está ubicado correctamente — el sistema no puede alocarlo.",
        items: [
          "Acción: contactar warehouse (Samu)",
          "Ubicar cajas físicamente",
          "Registrar posiciones",
          "Hacer Reprocess manual",
        ],
      },
    ],
    docs: ["Reporte de stock por orden"],
    outputs: ["Stock alocado y listo para batch"],
    dependencies: ["Órdenes en Mintsoft"],
    warehouse:
      "Mueven cajas, las registran en picking shelves y actualizan la ubicación para que Mintsoft pueda alocar el stock.",
    critical: ["ONBACKORDER bloquea la preparación hasta hacer Reprocess manual"],
    phaseVar: "--phase-6",
  },
  {
    id: "batches",
    number: 6,
    name: "Batches y Preparación",
    short: "Liberación para armado físico",
    objective:
      "Crear batches significa mandar las órdenes a armar: le decimos al warehouse 'empiecen a preparar, busquen productos y armen físicamente los pedidos'.",
    responsible: "Equipo Outbound + Warehouse",
    inputs: ["Stock en estado NEW"],
    activities: [
      {
        title: "1. Create Batch",
        items: ["Ruta: Orders → Overview → Create Batch"],
      },
      {
        title: "2. Reglas de agrupación",
        items: ["Boutique: máximo 5 órdenes", "Major: 1 orden por batch"],
      },
      {
        title: "3. Picking Types",
        items: ["Bulk Paperless — 1 sola orden", "Multi Tote — múltiples órdenes"],
      },
      {
        title: "4. Print Batch PDF",
        items: ["Packing instructions", "Picking summary"],
      },
      { title: "5. Mail al warehouse", detail: "Envío del PDF operativo." },
      { title: "6. Estado tracker", items: ["Packing"] },
    ],
    docs: ["Batch PDF", "Packing instructions", "Picking summary"],
    outputs: ["Pedidos físicamente armados y etiquetados, listos para shipping"],
    dependencies: ["Gestión de Stock (estado NEW)"],
    warehouse:
      "Los operarios imprimen el batch, buscan productos, arman cajas, etiquetan y dejan pedidos listos para shipping.",
    critical: ["Respetar reglas de agrupación (Boutique 5 / Major 1)"],
    phaseVar: "--phase-7",
  },
  {
    id: "shipping",
    number: 7,
    name: "Shipping y Returns",
    short: "Despacho, freight y devoluciones",
    objective:
      "Despachar las órdenes preparadas mediante el carrier correcto y gestionar devoluciones.",
    responsible: "Equipo Shipping + Warehouse",
    inputs: ["Pedidos armados y etiquetados"],
    activities: [
      {
        title: "A) UPS AUTOMÁTICO",
        detail: "Integración Mintsoft + UPS.",
        items: [
          "Tracking Number",
          "Commercial Invoice",
          "Labels",
          "Total Cost",
          "Warehouse: la etiqueta sale integrada, solo deben pegarla y despachar",
        ],
      },
      {
        title: "B) UPS MANUAL",
        detail: "El warehouse manda foto, dimensiones, peso y commercial invoice.",
        items: [
          "Peso",
          "Dimensiones",
          "Reference 1 = PO",
          "Reference 2 = Marca",
          "Third Party UPS Account",
          "Labels",
          "Tracking Number",
          "Warehouse: espera la label final para pegarla antes del pickup",
        ],
      },
      {
        title: "C) TFORCE FREIGHT (PALLETS)",
        detail: "Para cargas grandes, pallets y freighttttt.",
        items: [
          "BOL Documents",
          "Pallets",
          "Tracking freight",
          "4 copias BOL: 2 pallet + 1 chofer + 1 warehouse",
          "Warehouse: consolida pallets y prepara documentación para camión freight",
        ],
      },
      {
        title: "D) RETURNS",
        detail: "Flujo: invertir direcciones, generar return label, pickup opcional.",
        items: [
          "Ref 1: WH RETURN - Boutique",
          "Ref 2: Marca",
          "Warehouse: reciben retorno, reingresan stock y validan estado físico",
        ],
      },
    ],
    docs: ["UPS Labels", "Commercial Invoice", "BOL Documents", "Return Labels"],
    outputs: ["Pedido despachado / Retorno reingresado"],
    dependencies: ["Batches y Preparación"],
    warehouse:
      "Despachan según carrier o consolidan retornos. Respetan cutoff de pickup y horarios.",
    critical: [
      "Warehouse cierra 5:00 PM",
      "Pickup cutoff 4:00 PM — si no está listo, queda retenido al día siguiente",
      "PACK AND HOLD: preparar y embalar, PERO no despachar hasta autorización final",
    ],
    phaseVar: "--phase-8",
  },
];

const CONTROL_ARRIBO_STAGE = STAGES.find((stage) => stage.id === "control-arribo");

const FAQS = [
  {
    q: "¿Qué es un ASN?",
    a: "Advance Shipping Notice — aviso anticipado cargado en Mintsoft con el detalle de la mercadería que va a llegar. Se carga 1 ASN por cada PO.",
  },
  {
    q: "¿Cuál es el formato del código de un Carton?",
    a: "DOS PALABRAS + últimos 6 dígitos del tracking + número de caja. Ejemplo: POSSE468889-001.",
  },
  {
    q: "¿Cuándo envío las labels al warehouse?",
    a: "Recién cuando confirman por Slack que llegaron las cajas físicamente.",
  },
  {
    q: "¿Cuál es la diferencia entre Cross Dock y Pick & Pack?",
    a: "Cross Dock: la caja entra y sale rápido sin almacenarse. Pick & Pack: el warehouse abre cajas, busca productos y arma nuevas cajas.",
  },
  {
    q: "¿Qué hago si una orden queda en ONBACKORDER?",
    a: "El stock existe pero no está ubicado correctamente. Contactar a Samu, ubicar cajas, registrar posiciones y hacer Reprocess manual.",
  },
  {
    q: "¿Cuántas órdenes puedo agrupar por batch?",
    a: "Boutique: máximo 5 órdenes por batch. Major: 1 orden por batch.",
  },
  {
    q: "Cuáles son los estados de una orden?",
    a: "Entered → Packing → Packed → Routed → Shipped.",
  },
  {
    q: "¿Cuál es el cutoff de pickup?",
    a: "4:00 PM. El warehouse cierra a las 5:00 PM. Si no está listo antes del cutoff, queda retenido para el día siguiente.",
  },
  {
    q: "¿Qué significa Pack and Hold?",
    a: "Preparar y embalar las cajas PERO no despachar todavía. Quedan armadas, etiquetadas y retenidas en custodia hasta recibir autorización final.",
  },
  {
    q: "¿Cuántas copias del BOL se necesitan en TForce Freight?",
    a: "4 copias: 2 para el pallet, 1 para el chofer y 1 para el warehouse.",
  },
];

function Index() {
  const [active, setActive] = useState<string>(STAGES[0].id);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(STAGES.map((s) => [s.id, true])),
  );
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Estado único para controlar la apertura de cualquier contenido multimedia dinámico
  const [activeMediaKey, setActiveMediaKey] = useState<string | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    STAGES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return STAGES;
    const q = query.toLowerCase();
    return STAGES.filter((s) => JSON.stringify(s).toLowerCase().includes(q));
  }, [query]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeIndex = STAGES.findIndex((s) => s.id === active);
  const progress = ((activeIndex + 1) / STAGES.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "var(--gradient-hero)" }}
        />
      </div>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.6 0.2 270 / 0.15), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.7 0.18 50 / 0.12), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          {/* Floating hero image */}
          <img
            src={heroImage}
            alt="Flujo logístico 5411"
            className="pointer-events-none hidden lg:block absolute right-6 top-40 w-[46%] max-w-[640px] h-auto select-none"
            style={{ mixBlendMode: "multiply" }}
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--phase-4)" }} />
            Proceso Operativo Logístico
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Proceso{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              5411
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Guía interactiva de principio a fin: desde el aviso del cliente hasta el despacho y las
            devoluciones.
          </p>
          {/* Inline image for mobile/tablet */}
          <img
            src={heroImage}
            alt="Flujo logístico 5411"
            className="mt-8 block lg:hidden w-full max-w-2xl h-auto select-none"
            style={{ mixBlendMode: "multiply" }}
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo(STAGES[0].id)}
              className="rounded-lg px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
              style={{ background: "var(--gradient-hero)" }}
            >
              Empezar el recorrido →
            </button>
            <a
              href="#faq"
              className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Ver FAQ
            </a>
          </div>

          {/* Phase pills */}
          <div
            className="mt-24 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8"
            style={{ marginTop: "calc(6rem + 100px)" }}
          >
            {STAGES.filter((s) => s.id !== "control-arribo").map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="group rounded-xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
              >
                <div
                  className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ background: `var(${s.phaseVar})` }}
                >
                  {s.number}
                </div>
                <div className="text-xs font-semibold leading-tight">{s.name}</div>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Interactive logistics flow roadmap */}
      <LogisticsFlowMap onJump={scrollTo} />

      {/* Main layout */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <main className="min-w-0">
          {/* Search bar */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar etapa, documento, actividad..."
              className="w-full max-w-md rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2 text-xs">
              <a
                href="#horarios"
                className="rounded-lg border border-border bg-card px-3 py-2 font-medium hover:bg-secondary"
              >
                Horarios
              </a>
              <a
                href="#faq"
                className="rounded-lg border border-border bg-card px-3 py-2 font-medium hover:bg-secondary"
              >
                FAQ
              </a>
            </div>
          </div>

          {/* Flow diagram */}
          <section className="mb-16 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="mb-1 text-xl font-bold">Mapa del proceso</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Flujo end-to-end con dependencias entre etapas
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {STAGES.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => scrollTo(s.id)}
                    className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold text-white"
                      style={{ background: `var(${s.phaseVar})` }}
                    >
                      {s.number}
                    </span>
                    <span className="text-xs font-medium">{s.name}</span>
                  </button>
                  {i < STAGES.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Stages */}
          <div className="space-y-12">
            {filtered.filter((s) => s.id !== "control-arribo").map((s) => {
              const isOpen = expanded[s.id] ?? true;
              return (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-8 rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)]"
                >
                  {/* Header */}
                  <div
                    className="relative p-6 md:p-8"
                    style={{
                      background: `linear-gradient(135deg, var(${s.phaseVar}) 0%, oklch(from var(${s.phaseVar}) calc(l - 0.1) c h) 100%)`,
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 text-white">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                          Etapa {s.number} de {STAGES.length}
                        </div>
                        <h2 className="mt-1 text-3xl font-bold md:text-4xl">{s.name}</h2>
                        <p className="mt-2 text-base opacity-90">{s.short}</p>
                      </div>
                      <button
                        onClick={() => setExpanded((prev) => ({ ...prev, [s.id]: !isOpen }))}
                        className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/30"
                      >
                        {isOpen ? "Contraer −" : "Expandir +"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <StageBody
                      stage={s}
                      onTriggerMedia={(key) => setActiveMediaKey(key)}
                    />
                  )}
                </section>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No se encontraron etapas para "{query}".
              </div>
            )}
          </div>

          {/* Horarios + Pack and Hold */}
          <section id="horarios" className="mt-16 grid gap-6 md:grid-cols-2 scroll-mt-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Horarios operativos
              </div>
              <h3 className="mt-1 text-2xl font-bold">Cutoffs & cierre</h3>
              <div className="mt-6 space-y-3">
                <Stat label="Warehouse closes" value="5:00 PM" />
                <Stat label="Pickup cutoff" value="4:00 PM" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Si no está listo antes del cutoff, queda retenido para el día siguiente.
              </p>
            </div>
            <div
              className="rounded-2xl border border-border p-6 shadow-[var(--shadow-soft)]"
              style={{
                background: "linear-gradient(135deg, oklch(0.96 0.04 60), oklch(0.94 0.06 40))",
              }}
            >
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--phase-7)" }}
              >
                Pack and Hold
              </div>
              <h3 className="mt-1 text-2xl font-bold">Preparar pero no despachar</h3>
              <p className="mt-4 text-sm leading-relaxed">
                Las cajas quedan armadas, etiquetadas y retenidas en custodia hasta recibir
                autorización final del cliente.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mt-16 scroll-mt-8">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                FAQ
              </div>
              <h2 className="mt-1 text-3xl font-bold">Preguntas frecuentes</h2>
            </div>
            <div className="space-y-2">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
                    >
                      <span className="text-sm font-semibold">{f.q}</span>
                      <span className={`text-xl transition-transform ${open ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    {open && (
                      <div className="border-t border-border bg-secondary/20 px-5 py-4 text-sm text-muted-foreground">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <footer className="mt-20 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            Proceso 5411 — Guía interactiva operativa
          </footer>
        </main>
      </div>

      {/* Único modal dinámico e independiente para audios y videos */}
      <MediaModal resourceKey={activeMediaKey} onClose={() => setActiveMediaKey(null)} />
    </div>
  );
}

const WAREHOUSE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  inbound: Truck,
  cartons: PackageOpen,
  "control-arribo": ScanLine,
  outbound: ClipboardCheck,
  "ordenes-mintsoft": ListChecks,
  stock: Boxes,
  batches: Forklift,
  shipping: PackageCheck,
};

function StageBody({
  stage: s,
  onTriggerMedia,
}: {
  stage: Stage;
  onTriggerMedia: (key: string) => void;
}) {
  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Objective banner — common to both areas */}
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Objetivo de la etapa
        </div>
        <p className="mt-2 text-base leading-relaxed">{s.objective}</p>
      </div>

      {/* Two perspectives: Admin vs Warehouse */}
      {s.id === "inbound" && (
        <div
          className="rounded-3xl border-2 p-4 md:p-5"
          style={{
            borderColor: "oklch(0.75 0.08 200 / 0.45)",
            background:
              "linear-gradient(180deg, oklch(0.98 0.015 200) 0%, oklch(1 0 0) 100%)",
          }}
        >
          <div
            className="mb-4 flex items-center gap-2 border-b pb-3"
            style={{ borderColor: "oklch(0.75 0.08 200 / 0.35)" }}
          >
            <ClipboardList
              className="h-5 w-5"
              style={{ color: "oklch(0.45 0.13 200)" }}
            />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Proceso
              </div>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <StageAdminColumn s={s} onTriggerMedia={onTriggerMedia} />
            <StageWarehouseColumn s={s} onTriggerMedia={onTriggerMedia} />
          </div>
        </div>
      )}

      {s.id === "inbound" && CONTROL_ARRIBO_STAGE && (
        <div
          id="control-arribo"
          className="rounded-3xl border-2 p-4 md:p-5"
          style={{
            borderColor: "oklch(0.58 0.08 140 / 0.45)",
            background:
              "linear-gradient(180deg, oklch(0.96 0.04 120) 0%, oklch(0.99 0.02 120) 100%)",
          }}
        >
          <div
            className="mb-4 flex items-center gap-2 border-b pb-3"
            style={{ borderColor: "oklch(0.58 0.08 140 / 0.35)" }}
          >
            <ScanLine className="h-5 w-5" style={{ color: "oklch(0.45 0.12 140)" }} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Proceso
              </div>
              <h3 className="text-base font-bold" style={{ color: "oklch(0.35 0.12 140)" }}>
                Control de Arribo
              </h3>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <StageAdminColumn s={CONTROL_ARRIBO_STAGE} onTriggerMedia={onTriggerMedia} />
            <StageWarehouseColumn s={CONTROL_ARRIBO_STAGE} onTriggerMedia={onTriggerMedia} />
          </div>
        </div>
      )}

      {s.id !== "inbound" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <StageAdminColumn s={s} onTriggerMedia={onTriggerMedia} />
          <StageWarehouseColumn s={s} onTriggerMedia={onTriggerMedia} />
        </div>
      )}
    </div>
  );
}

function StageAdminColumn({
  s,
  onTriggerMedia,
}: {
  s: Stage;
  onTriggerMedia: (key: string) => void;
}) {
  const adminIconBg = s.phaseColor === "green" ? "oklch(0.45 0.12 140)" : "var(--gradient-hero)";
  return (
    <div className="relative rounded-2xl border border-border bg-card/60 p-4">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
          style={{ background: adminIconBg }}
        >
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Perspectiva
          </div>
          <h3 className="text-lg font-bold">Administración</h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Responsable */}
        <div className="flex items-start gap-3 rounded-lg bg-secondary/40 p-3">
          <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Responsable
            </div>
            <div className="text-sm font-medium">{s.responsible}</div>
          </div>
        </div>

        {/* Entradas + Dependencias */}
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniList icon={<Inbox className="h-4 w-4" />} label="Entradas" items={s.inputs} />
          <MiniList
            icon={<Link2 className="h-4 w-4" />}
            label="Dependencias"
            items={s.dependencies}
          />
        </div>

        {/* Actividades */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="h-4 w-4" /> Actividades administrativas
          </div>
          <div className="space-y-2">
            {s.activities.map((a, i) => (
              <Activity key={i} activity={a} phaseVar={s.phaseVar} onTriggerMedia={onTriggerMedia} />
            ))}
          </div>
        </div>

        {/* Críticos */}
        {s.critical && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive">
              <AlertTriangle className="h-4 w-4" /> Puntos críticos / Validaciones
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {s.critical.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-destructive">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StageWarehouseColumn({
  s,
  onTriggerMedia,
}: {
  s: Stage;
  onTriggerMedia: (key: string) => void;
}) {
  const WhIcon = WAREHOUSE_ICONS[s.id] ?? Warehouse;
  const [imageModal, setImageModal] = useState<{ src: string; alt: string } | null>(null);

  const warehouseAccent = s.phaseColor === "green" ? {
    border: "oklch(0.58 0.08 140 / 0.3)",
    background: "linear-gradient(180deg, oklch(0.96 0.04 120) 0%, var(--card) 100%)",
    icon: "linear-gradient(135deg, oklch(0.45 0.12 140), oklch(0.38 0.12 140))",
    label: "oklch(0.35 0.12 140)",
    badge: "oklch(0.95 0.04 120)",
    badgeText: "white",
  } : null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 md:p-6"
      style={{
        borderColor: warehouseAccent?.border ?? `oklch(from var(${s.phaseVar}) l c h / 0.3)`,
        background: warehouseAccent?.background ?? `linear-gradient(180deg, oklch(from var(${s.phaseVar}) 0.97 0.02 h) 0%, var(--card) 100%)`,
      }}
    >
      <WhIcon className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 opacity-[0.07]" />

      <div
        className="mb-5 flex items-center gap-3 border-b pb-4"
        style={{ borderColor: warehouseAccent?.border ?? `oklch(from var(${s.phaseVar}) l c h / 0.2)` }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
          style={{
            background: warehouseAccent?.icon ?? `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
          }}
        >
          <Warehouse className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Perspectiva
          </div>
          <h3 className="text-lg font-bold">Warehouse</h3>
        </div>
      </div>

      <div className="relative space-y-5">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card p-6 text-center shadow-md">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
            }}
          >
            <WhIcon className="h-8 w-8" />
          </div>

          <div
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: warehouseAccent?.label ?? `var(${s.phaseVar})` }}
          >
            Qué pasa físicamente
          </div>

             {s.id === "inbound" && ( //WAREHOUSE ETAPA INBOUND EDITAR ACA
            <div className="w-full mt-3 space-y-4">
              <div className="py-2 text-center text-xl font-extrabold text-blue-600">
                Etapa Camilo
              </div>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">{s.warehouse}</p>
              {/* Video Camilo */}
              <button
                type="button"
                onClick={() => onTriggerMedia("warehouse_camilo")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    warehouseAccent?.icon ??
                    `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Video del Warehouse
              </button>

              {/* Ejemplo Slack */}
              <div className="border-t pt-4">
                <div className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Ejemplo
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setImageModal({
                      src: slackConfirmaLlegadaAsset,
                      alt: "Ejemplo de confirmación en Slack",
                    })
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ScanLine className="h-4 w-4 text-primary" />
                  Ver foto de Slack
                </button>
              </div>

              {/* Audio Camilo Independiente */}
              <div className="border-t pt-4">
                <div className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Audio de Camilo explicando el proceso
                </div>

                <button
                  type="button"
                  onClick={() => onTriggerMedia("audio_camilo")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    🎤
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold">
                      Perspectiva de Camilo
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Explicación del proceso
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    ▶ Audio
                  </span>
                </button>
              </div>

              <div className="my-2 border-t border-border" />

              {/* Samuel Section */}
              <div className="pt-2 text-center text-xl font-extrabold text-green-600">
                Etapa Samuel
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">
                2. De acuerdo con las prioridades, Samuel retira las cajas de RS y las lleva a su mesa de trabajo. Luego imprime las etiquetas (labels), organiza las cajas en el orden correspondiente, coloca las etiquetas y comienza el proceso de escaneo.
              </div>

              {/* Video Samuel Independiente con Estilo Solicitado */}
              <button
                type="button"
                onClick={() => onTriggerMedia("samuel_inbound")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current" />
                Video de Samuel
              </button>
            </div>
          )}
          {s.id === "outbound" && ( //ACA EDITAR OUTBOUND WAREHOUSE
            <div className="w-full mt-3 space-y-4">
              <div className="py-2 text-center text-xl font-extrabold text-blue-600">
                Etapa quien?
              </div>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-justify">{s.warehouse}</p>
              {/* Ejemplo: Si querés disparar un video o audio de esta etapa */}
              <button
                type="button"
                onClick={() => onTriggerMedia("tu_recurso_multimedia_aca")}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: warehouseAccent?.icon ?? `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Ver Video Operativo Outbound
              </button>
            </div>
          )}
        </div>
      </div>
      {imageModal && (
        <ImageModal
          open={true}
          onClose={() => setImageModal(null)}
          src={imageModal.src}
          alt={imageModal.alt}
        />
      )}
    </div>
  );
}

// Componente Core Unificado para Multimedia (Mantiene intacta la UI/UX/Layout original)
function MediaModal({ resourceKey, onClose }: { resourceKey: string | null; onClose: () => void }) {
  if (!resourceKey) return null;

  const resource = MEDIA_RESOURCES[resourceKey];
  if (!resource) return null;

  const isAudio = resource.type === "audio";
  const isImage = resource.type === "image";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      {/* 1. RENDERIZADO EXCLUSIVO PARA IMÁGENES (Aislado para evitar herencia de tamaños de video) */}
      {isImage ? (
        <div
          className="relative w-auto max-w-[95vw] md:max-w-4xl rounded-2xl border border-border bg-card p-3 shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="mb-2 text-sm font-bold px-1 text-muted-foreground">
            {resource.title}
          </div>

          <div className="max-h-[80vh] overflow-auto rounded-xl bg-black/5 flex items-center justify-center">
            <img
              src={resource.src}
              alt={resource.title}
              className="h-auto max-h-[70vh] w-auto max-w-full object-contain block mx-auto rounded-lg shadow-sm"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      ) : (
        /* 2. RENDERIZADO PARA VIDEOS Y AUDIOS (Mantiene intacto tu layout original de la plataforma) */
        <div
          className={`relative w-full ${isAudio ? 'max-w-md' : 'max-w-3xl'} rounded-2xl border border-border bg-card p-4 shadow-2xl transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="mb-2 text-sm font-bold px-1 text-muted-foreground">
            {resource.title}
          </div>

          {isAudio ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-muted/30 p-6 border border-border/40">
              <div className="mb-4 text-4xl animate-pulse">🎤</div>
              <audio
                className="w-full h-12 accent-primary"
                src={resource.src}
                controls
                autoPlay
              />
            </div>
          ) : (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                className="h-full w-full"
                src={resource.src}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniList({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-xs">
            <span className="text-primary">›</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Activity({
  activity,
  phaseVar,
  onTriggerMedia,
}: {
  activity: {
    title: string;
    detail?: string;
    blocks?: { type: string; content?: string; action?: ActionType }[];
    items?: string[];
  };
  phaseVar: string;
  onTriggerMedia: (key: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [imageModal, setImageModal] = useState<{ src: string; alt: string } | null>(null);
  const hasBody = activity.detail || activity.items?.length || activity.blocks?.length;
  const showSlackExample = activity.title === "1. Slack confirma llegada";

  const exampleItems: Record<string, { src: string; alt: string }> = {
    "Llegan por mail": { src: slackConfirmaLlegadaAsset, alt: "Ejemplo de recepción por mail" },
    "Ya las tenes cuando te mandaron el cargamento": { src: slackConfirmaLlegadaAsset, alt: "Ejemplo de envío de cargamento" },
    "Las tenes que buscar en la plataforma que usa la marca": { src: slackConfirmaLlegadaAsset, alt: "Ejemplo de plataforma de la marca" },
  };

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <button
        onClick={() => hasBody && setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
      >
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full" style={{ background: `var(${phaseVar})` }} />
          <span className="text-sm font-semibold">{activity.title}</span>
        </div>
        {hasBody && (
          <span className={`text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}>
            ›
          </span>
        )}
      </button>
      {hasBody && open && (
        <div className="border-t border-border px-4 py-3">
          {activity.detail && (
            <p className="text-sm leading-relaxed text-muted-foreground">{activity.detail}</p>
          )}
          {activity.blocks && (
            <div className="space-y-3">
              {activity.blocks.map((block, idx) => {
                if (block.type === "text") {
                  return (
                    <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
                      {block.content}
                    </p>
                  );
                }
                if (block.type === "button" && block.action) {
                  const currentResource = MEDIA_RESOURCES[block.action];
                  const resourceType = currentResource ? currentResource.type : undefined;
                  const Icon = block.action === "box" ? PackageOpen
                    : resourceType === "image"
                      ? ScanLine
                      : ClipboardList;
                  return (
                    <button
                      key={idx}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => onTriggerMedia(block.action!)}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {block.content}
                    </button>
                  );
                }
                return null;
              })}
            </div>
          )}
          {activity.items && (
            <ul className="mt-2 space-y-1.5">
              {activity.items.map((it, i) => {
                const itemExample = exampleItems[it];
                return (
                  <li key={i} className="flex items-start justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="mt-1 text-primary">•</span>
                      <span className="min-w-0 break-words">{it}</span>
                    </div>
                    {itemExample && (
                      <button
                        type="button"
                        onClick={() => setImageModal(itemExample)}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Ver Ejemplo
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {showSlackExample && (
            <button
              onClick={() =>
                setImageModal({
                  src: slackConfirmaLlegadaAsset,
                  alt: "Ejemplo de confirmación en Slack",
                })
              }
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
            >
              <ScanLine className="h-3.5 w-3.5 text-primary" />
              Ver Ejemplo
            </button>
          )}
        </div>
      )}
      {imageModal && (
        <ImageModal
          open={true}
          onClose={() => setImageModal(null)}
          src={imageModal.src}
          alt={imageModal.alt}
        />
      )}
    </div>
  );
}

function ImageModal({
  open,
  onClose,
  src,
  alt,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground shadow hover:bg-secondary transition-colors"
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="max-h-[85vh] w-full overflow-auto rounded-xl bg-black/5 flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            className="h-auto w-full max-h-[85vh] object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-bold">{value}</span>
    </div>
  );
}

const FLOW_HOTSPOTS: {
  number: number;
  title: string;
  description: string;
  targetId: string;
  phaseVar: string;
}[] = [
    {
      number: 1,
      title: "Llega el camión / avión",
      description:
        "Inbound: DHL, UPS o freight entregan la mercadería. El cliente envió previamente el Packing List y se creó el ASN en Mintsoft.",
      targetId: "inbound",
      phaseVar: "--phase-1",
    },
    {
      number: 2,
      title: "Llega al depósito",
      description:
        "Descarga de cajas en el warehouse 5411. Verificación física de cantidades y comparación contra el ASN cargado.",
      targetId: "inbound",
      phaseVar: "--phase-2",
    },
    {
      number: 3,
      title: "Escanean las cajas",
      description:
        "Escaneo de labels y registro en sistema. Validación de tracking number y SKU contra el catálogo.",
      targetId: "control-arribo",
      phaseVar: "--phase-3",
    },
    {
      number: 4,
      title: "Rearman las cajas",
      description:
        "Pick & Pack: apertura de cajas, búsqueda de productos y armado de nuevas cajas según órdenes Major y Boutique.",
      targetId: "batches",
      phaseVar: "--phase-5",
    },
    {
      number: 5,
      title: "Etiquetan y preparan envío",
      description:
        "Generación de labels, tracking number y commercial invoice. Preparación de las cajas para el pickup del carrier.",
      targetId: "outbound",
      phaseVar: "--phase-6",
    },
    {
      number: 6,
      title: "Despachan las cajas",
      description:
        "Shipping outbound: UPS, TForce Freight u otro carrier retira la mercadería. Salida del warehouse rumbo al cliente final.",
      targetId: "shipping",
      phaseVar: "--phase-8",
    },
  ];

function LogisticsFlowMap({ onJump }: { onJump: (id: string) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const active = hovered ?? 1;
  const activeHotspot = FLOW_HOTSPOTS.find((h) => h.number === active)!;

  return (
    <section className="border-b border-border bg-card/40">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-6 md:py-16">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Roadmap visual
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              5411 Logistics Flow
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Recorrido físico de la mercadería dentro del warehouse, de izquierda a derecha. Pasá
              el mouse o tocá cada etapa para ver el detalle y saltar a la sección operativa.
            </p>
          </div>
          <div className="hidden text-xs text-muted-foreground md:block">
            Inbound → Recepción → Escaneo → Pick &amp; Pack → Etiquetado → Outbound
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-soft)]">
          <img
            src={logisticsFlowAsset}
            alt="Flujo logístico 5411: inbound, recepción, escaneo, pick and pack, etiquetado y outbound"
            className="block w-full select-none"
            draggable={false}
          />

          <div className="absolute inset-0 grid grid-cols-6">
            {FLOW_HOTSPOTS.map((h) => {
              const isActive = active === h.number;
              return (
                <button
                  key={h.number}
                  type="button"
                  onMouseEnter={() => setHovered(h.number)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(h.number)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onJump(h.targetId)}
                  aria-label={`Etapa ${h.number}: ${h.title}. Ir a la sección`}
                  className="group relative cursor-pointer transition-colors"
                  style={{
                    background: isActive
                      ? `linear-gradient(180deg, color-mix(in oklch, var(${h.phaseVar}) 18%, transparent), transparent 70%)`
                      : "transparent",
                  }}
                >
                  {h.number === 4 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setModalOpen(true);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          setModalOpen(true);
                        }
                      }}
                      aria-label="Depende de la Marca. Abrir modal"
                      className="absolute left-1/2 top-60 z-10 -translate-x-1/2 flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-8 py-3 text-sm font-bold text-primary-foreground whitespace-nowrap shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95 cursor-pointer"                    >
                      Depende de la Marca
                    </div>
                  )}
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-px opacity-30"
                    style={{ background: `var(${h.phaseVar})` }}
                  />
                  <span
                    className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    style={{ background: `var(${h.phaseVar})` }}
                  >
                    Ver paso {h.number} →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {modalOpen && (
          <ImageModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            src={DependeMarca}
            alt="Depende de la Marca"
          />
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-[var(--shadow-soft)] transition-colors"
            style={{ background: `var(${activeHotspot.phaseVar})` }}
          >
            {activeHotspot.number}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Etapa {activeHotspot.number} de 6
            </div>
            <div className="text-lg font-semibold">{activeHotspot.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{activeHotspot.description}</p>
          </div>
          <button
            onClick={() => onJump(activeHotspot.targetId)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Ir a la sección →
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FLOW_HOTSPOTS.map((h) => (
            <button
              key={h.number}
              onMouseEnter={() => setHovered(h.number)}
              onFocus={() => setHovered(h.number)}
              onClick={() => onJump(h.targetId)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${active === h.number
                ? "border-transparent text-white shadow-[var(--shadow-soft)]"
                : "border-border bg-card hover:bg-secondary"
                }`}
              style={active === h.number ? { background: `var(${h.phaseVar})` } : undefined}
            >
              <span className="font-bold">{h.number}</span>
              <span>{h.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}