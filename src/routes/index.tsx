import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import logisticsFlowAsset from "@/assets/logistics-flow.png.asset.json";
import heroFlowAsset from "@/assets/hero-flow-v2.png.asset.json";
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
      { name: "description", content: "Guía interactiva del proceso operativo logístico 5411: inbound, outbound, shipping y returns paso a paso." },
      { property: "og:title", content: "Proceso 5411 — Guía Interactiva" },
      { property: "og:description", content: "Explorá el proceso 5411 fase por fase: roadmap, diagramas, responsables y documentación." },
    ],
  }),
  component: Index,
});

type Stage = {
  id: string;
  number: number;
  name: string;
  short: string;
  objective: string;
  responsible: string;
  inputs: string[];
  activities: { title: string; detail?: string; items?: string[] }[];
  docs: string[];
  outputs: string[];
  dependencies: string[];
  warehouse: string;
  critical?: string[];
  phaseVar: string;
};

const STAGES: Stage[] = [
  {
    id: "inbound",
    number: 1,
    name: "Inbound",
    short: "Entrada de mercadería al warehouse",
    objective:
      "El cliente avisa que viene mercadería en camino y se prepara el sistema para recibirla correctamente en el warehouse.",
    responsible: "Equipo Inbound / Operaciones",
    inputs: ["Mail del cliente con Tracking", "Excel o PDF con Packing List"],
    activities: [
      {
        title: "1. Recepción del Packing List",
        detail:
          "El cliente envía mail con Tracking + Excel/PDF + Packing List. Se crea o abre el tracker de la marca (Excel que reúne todos los cargamentos y órdenes).",
        items: [
          "Cada orden puede incluir varias cajas de ropa",
          "El tracker muestra etapa de cada orden (ingresada, autorización, salida)",
          "Incluye valor de la orden, cantidad de unidades y tipo",
          "Se actualiza continuamente a medida que la orden avanza",
        ],
      },
      {
        title: "2. Conversión PDF → Excel",
        detail: "Si el cliente manda PDF se convierte usando:",
        items: ["Claude", "Gemini", "iLovePDF", "o conversión manual"],
      },
      {
        title: "3. Adaptación al ASN Template",
        items: ["Se usa template ASN", "1 ASN por cada PO", "Validación SKU"],
      },
      {
        title: "4. Upload ASN en Mintsoft",
        detail: "Estados posibles del ASN:",
        items: ["New", "Awaiting Delivery", "Booked In", "Complete / Awaiting Putaway"],
      },
    ],
    docs: ["Packing List", "ASN Template", "Tracker de la marca"],
    outputs: ["ASN cargado en Mintsoft", "Tracker actualizado"],
    dependencies: ["Aviso previo del cliente"],
    warehouse:
      "El warehouse ve el ASN cargado en el sistema y ya sabe que la mercadería está en camino.",
    critical: ["Validar SKU contra el catálogo", "1 ASN por PO — no mezclar"],
    phaseVar: "--phase-1",
  },
  {
    id: "cartons",
    number: 2,
    name: "Creación de Cartons",
    short: "Registro anticipado de cajas físicas",
    objective:
      "Con el packing list registramos cuántas cajas van a venir antes de que lleguen físicamente al warehouse.",
    responsible: "Equipo Inbound",
    inputs: ["Packing List confirmado", "Tracking number"],
    activities: [
      {
        title: "1. Create New Carton",
        detail: "Ruta en Mintsoft:",
        items: ["Cartons → Cartons & Pallets → Create New Carton"],
      },
      {
        title: "2. Configuración",
        items: ["Storage = Stock", "Location = RS In Transit"],
      },
      {
        title: "3. Código del Carton",
        detail: "Formato: DOS PALABRAS + últimos 6 del tracking + número de caja",
        items: ["Ejemplo: POSSE468889-001"],
      },
      {
        title: "4. Print Labels PDF",
        items: ["Se imprimen labels", "Se genera PDF de etiquetas"],
      },
      {
        title: "5. Mail al inbound team",
        detail:
          "Se envían labels al warehouse. Enviarlas cuando confirman por Slack que llegaron las cajas.",
      },
    ],
    docs: ["PDF de etiquetas", "Códigos de carton"],
    outputs: ["Cartons pre-registrados en Mintsoft", "Labels listas para escaneo"],
    dependencies: ["Inbound (ASN creado)"],
    warehouse:
      "Cuando llegan las cajas físicas: escanean etiquetas, las reconocen automáticamente, validan ingreso más rápido y saben exactamente cuántas cajas deberían llegar.",
    critical: ["Enviar labels solo tras confirmación por Slack"],
    phaseVar: "--phase-2",
  },
  {
    id: "control-arribo",
    number: 3,
    name: "Control de Arribo",
    short: "Confirmación física de llegada",
    objective: "Validar físicamente que la mercadería que llegó coincide con el ASN cargado.",
    responsible: "Warehouse + Equipo Inbound",
    inputs: ["ASN cargado", "Cajas físicas en warehouse"],
    activities: [
      {
        title: "1. Slack confirma llegada",
        items: ["Ejemplo: Llegaron 35/50", "Ejemplo: Llegaron 50/50"],
      },
      {
        title: "2. Validación Tracking vs ASN",
        detail: "Se compara el tracking físico contra el ASN cargado en el sistema.",
      },
      {
        title: "3. Investigación de cajas faltantes",
        items: ["Slack thread interno", "Escalación con cliente si hace falta"],
      },
      {
        title: "4. Confirmación final al cliente",
        items: [
          "Todo OK (si el cliente no pide confirmación expresa)",
          "o reporte de faltantes detectados",
        ],
      },
    ],
    docs: ["Slack thread", "Reporte de faltantes (si aplica)"],
    outputs: ["Validación completa de arribo", "Confirmación al cliente"],
    dependencies: ["Creación de cartons", "ASN en Mintsoft"],
    warehouse:
      "Reciben el camión, cuentan cajas y validan que coincidan con el ASN cargado.",
    critical: ["Detectar faltantes antes de confirmar al cliente"],
    phaseVar: "--phase-3",
  },
  {
    id: "outbound",
    number: 4,
    name: "Outbound",
    short: "Preparación de órdenes de salida",
    objective:
      "Procesar los pedidos que van a salir del warehouse hacia boutiques o majors. Una orden es un pedido de productos a preparar y enviar.",
    responsible: "Equipo Outbound",
    inputs: ["Órdenes recibidas por mail", "Stock validado"],
    activities: [
      { title: "1. Recepción de órdenes", detail: "Llegan por mail." },
      {
        title: "2. Clasificación",
        items: ["Major", "Boutique"],
      },
      {
        title: "3. Tipo operativo",
        items: [
          "Cross Dock — la caja entra y sale rápido sin almacenarse",
          "Pick & Pack — el warehouse abre cajas, busca productos y arma nuevas cajas",
        ],
      },
      { title: "4. Transformación de datos", detail: "Armamos la packing list." },
      { title: "5. Verificación SKU en Mintsoft" },
    ],
    docs: ["Packing list de outbound", "Mail con orden original"],
    outputs: ["Órdenes clasificadas y listas para cargar"],
    dependencies: ["Stock disponible (Gestión de Stock)"],
    warehouse:
      "El warehouse entiende qué órdenes preparar, qué productos buscar y si deben rearmar cajas o despachar directo.",
    critical: ["Identificar correctamente Cross Dock vs Pick & Pack"],
    phaseVar: "--phase-4",
  },
  {
    id: "ordenes-mintsoft",
    number: 5,
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
    number: 6,
    name: "Gestión de Stock",
    short: "Validación de inventario real",
    objective: "Verificar que el stock esté correctamente ubicado y alocado en el sistema.",
    responsible: "Equipo Stock + Warehouse (Samu)",
    inputs: ["Orden cargada en Mintsoft"],
    activities: [
      {
        title: "Estado NEW",
        detail: "Stock asignado correctamente — todo listo para preparar.",
        items: [
          "Los productos ya están ubicados en estanterías",
          "El sistema puede encontrarlos",
        ],
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
    number: 7,
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
        items: [
          "Bulk Paperless — 1 sola orden",
          "Multi Tote — múltiples órdenes",
        ],
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
    number: 8,
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
        detail: "Para cargas grandes, pallets y freight.",
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
    q: "¿Cuáles son los estados de una orden?",
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
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.6 0.2 270 / 0.15), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.7 0.18 50 / 0.12), transparent 50%)"
        }} />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          {/* Hero illustration - absolutely positioned on desktop, doesn't affect step grid */}
          <div className="mb-10 flex justify-center lg:absolute lg:right-6 lg:top-8 lg:mb-0 lg:w-[42%] lg:max-w-[560px]">
            <img
              src={heroFlowAsset.url}
              alt="Flujo logístico 5411 y triángulo de comunicación"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
          <div className="min-w-0 lg:max-w-[55%]">
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
            Guía interactiva de principio a fin: desde el aviso del cliente hasta el despacho y
            las devoluciones. Navegá por las 8 etapas del flujo operativo.
          </p>
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
          <div className="mt-14 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {STAGES.map((s) => (
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
              <a href="#horarios" className="rounded-lg border border-border bg-card px-3 py-2 font-medium hover:bg-secondary">Horarios</a>
              <a href="#faq" className="rounded-lg border border-border bg-card px-3 py-2 font-medium hover:bg-secondary">FAQ</a>
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
                    {i < STAGES.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Stages */}
            <div className="space-y-12">
              {filtered.map((s) => {
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
                          onClick={() =>
                            setExpanded((prev) => ({ ...prev, [s.id]: !isOpen }))
                          }
                          className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/30"
                        >
                          {isOpen ? "Contraer −" : "Expandir +"}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <StageBody stage={s} />
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
              <div className="rounded-2xl border border-border p-6 shadow-[var(--shadow-soft)]" style={{ background: "linear-gradient(135deg, oklch(0.96 0.04 60), oklch(0.94 0.06 40))" }}>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--phase-7)" }}>
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
    </div>
  );
}

function MetaCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-primary">›</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
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

function StageBody({ stage: s }: { stage: Stage }) {
  const WhIcon = WAREHOUSE_ICONS[s.id] ?? Warehouse;
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — Administración */}
        <div
          className="relative rounded-2xl border border-border bg-background p-5 md:p-6"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.98 0.01 250) 0%, var(--card) 100%)",
          }}
        >
          <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
              style={{ background: "var(--gradient-hero)" }}
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

          <div className="space-y-5">
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
              <MiniList
                icon={<Inbox className="h-4 w-4" />}
                label="Entradas"
                items={s.inputs}
              />
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
                  <Activity key={i} activity={a} phaseVar={s.phaseVar} />
                ))}
              </div>
            </div>

            {/* Documentación + Salidas */}
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniList
                icon={<FileText className="h-4 w-4" />}
                label="Documentación"
                items={s.docs}
              />
              <MiniList
                icon={<PackageCheck className="h-4 w-4" />}
                label="Salidas"
                items={s.outputs}
              />
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

        {/* RIGHT — Warehouse */}
        <div
          className="relative overflow-hidden rounded-2xl border p-5 md:p-6"
          style={{
            borderColor: `oklch(from var(${s.phaseVar}) l c h / 0.3)`,
            background: `linear-gradient(180deg, oklch(from var(${s.phaseVar}) 0.97 0.02 h) 0%, var(--card) 100%)`,
          }}
        >
          {/* Decorative big icon */}
          <WhIcon
            className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 opacity-[0.07]"
          />

          <div className="mb-5 flex items-center gap-3 border-b pb-4" style={{ borderColor: `oklch(from var(${s.phaseVar}) l c h / 0.2)` }}>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
              style={{
                background: `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.1) c h))`,
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
            {/* Hero icon + warehouse statement */}
            <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-5 text-center shadow-sm">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
                style={{
                  background: `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))`,
                }}
              >
                <WhIcon className="h-8 w-8" />
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: `var(${s.phaseVar})` }}
              >
                Qué pasa físicamente
              </div>
              <p className="text-sm leading-relaxed">{s.warehouse}</p>
            </div>

            {/* Metric chips for visual balance */}
            <div className="grid grid-cols-3 gap-2">
              <Chip
                phaseVar={s.phaseVar}
                value={s.activities.length}
                label="Pasos op."
              />
              <Chip
                phaseVar={s.phaseVar}
                value={s.docs.length}
                label="Documentos"
              />
              <Chip
                phaseVar={s.phaseVar}
                value={s.inputs.length}
                label="Entradas"
              />
            </div>

            {/* Visual flow strip */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Flujo físico
              </div>
              <div className="flex items-center justify-between gap-2">
                <FlowStep icon={<Truck className="h-4 w-4" />} label="Recepción" active={s.number <= 3} phaseVar={s.phaseVar} />
                <Dash phaseVar={s.phaseVar} />
                <FlowStep icon={<Boxes className="h-4 w-4" />} label="Almacén" active={s.number >= 2 && s.number <= 6} phaseVar={s.phaseVar} />
                <Dash phaseVar={s.phaseVar} />
                <FlowStep icon={<PackageOpen className="h-4 w-4" />} label="Picking" active={s.number >= 6 && s.number <= 7} phaseVar={s.phaseVar} />
                <Dash phaseVar={s.phaseVar} />
                <FlowStep icon={<Truck className="h-4 w-4" />} label="Despacho" active={s.number >= 7} phaseVar={s.phaseVar} />
              </div>
            </div>

            {/* Etapa badge */}
            <div
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Etapa operativa
              </span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: `var(${s.phaseVar})` }}
              >
                {s.number}
              </span>
            </div>

            {/* Ver Video */}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, var(${s.phaseVar}), oklch(from var(${s.phaseVar}) calc(l - 0.12) c h))` }}
              onClick={() => alert(`Video de la etapa: ${s.name}`)}
            >
              <Play className="h-4 w-4 fill-current" />
              Ver Video
            </button>
          </div>
        </div>
      </div>
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

function Chip({
  phaseVar,
  value,
  label,
}: {
  phaseVar: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <div
        className="text-2xl font-bold"
        style={{ color: `var(${phaseVar})` }}
      >
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function FlowStep({
  icon,
  label,
  active,
  phaseVar,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  phaseVar: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
        style={{
          background: active ? `var(${phaseVar})` : "var(--secondary)",
          color: active ? "white" : "var(--muted-foreground)",
          boxShadow: active ? "var(--shadow-soft)" : undefined,
        }}
      >
        {icon}
      </div>
      <div
        className="text-[9px] font-semibold uppercase tracking-wider"
        style={{ color: active ? `var(${phaseVar})` : "var(--muted-foreground)" }}
      >
        {label}
      </div>
    </div>
  );
}

function Dash({ phaseVar }: { phaseVar: string }) {
  return (
    <div
      className="h-px flex-1"
      style={{ background: `oklch(from var(${phaseVar}) l c h / 0.3)` }}
    />
  );
}

function Activity({
  activity,
  phaseVar,
}: {
  activity: { title: string; detail?: string; items?: string[] };
  phaseVar: string;
}) {
  const [open, setOpen] = useState(true);
  const hasBody = activity.detail || activity.items?.length;
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <button
        onClick={() => hasBody && setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
      >
        <div className="flex items-center gap-3">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: `var(${phaseVar})` }}
          />
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
          {activity.items && (
            <ul className="mt-2 space-y-1.5">
              {activity.items.map((it, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
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
    targetId: "cartons",
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
              Recorrido físico de la mercadería dentro del warehouse, de izquierda a derecha.
              Pasá el mouse o tocá cada etapa para ver el detalle y saltar a la sección operativa.
            </p>
          </div>
          <div className="hidden text-xs text-muted-foreground md:block">
            Inbound → Recepción → Escaneo → Pick &amp; Pack → Etiquetado → Outbound
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-soft)]">
          <img
            src={logisticsFlowAsset.url}
            alt="Flujo logístico 5411: inbound, recepción, escaneo, pick and pack, etiquetado y outbound"
            className="block w-full select-none"
            draggable={false}
          />

          {/* 6 hotspot columns overlayed */}
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
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-px opacity-30"
                    style={{ background: `var(${h.phaseVar})` }}
                  />
                  <span
                    className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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

        {/* Stage detail panel under image */}
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

        {/* Mobile-friendly chip nav */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FLOW_HOTSPOTS.map((h) => (
            <button
              key={h.number}
              onMouseEnter={() => setHovered(h.number)}
              onFocus={() => setHovered(h.number)}
              onClick={() => onJump(h.targetId)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                active === h.number
                  ? "border-transparent text-white shadow-[var(--shadow-soft)]"
                  : "border-border bg-card hover:bg-secondary"
              }`}
              style={
                active === h.number
                  ? { background: `var(${h.phaseVar})` }
                  : undefined
              }
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
