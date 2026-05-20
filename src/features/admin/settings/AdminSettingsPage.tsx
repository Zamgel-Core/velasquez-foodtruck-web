// 📍 Ruta: src/features/admin/settings/AdminSettingsPage.tsx

import React from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BellRing,
  Building2,
  Clock,
  ExternalLink,
  Eye,
  MapPin,
  MessageSquareText,
  Palette,
  Power,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Tv,
  Video,
  Volume2,
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import {
  defaultAdminSettings,
  getAdminSettings,
  saveAdminSettings,
  type AdminSettings,
  type BusinessHoursDay,
} from "./admin-settings.service";

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-200 shadow-lg shadow-orange-500/10">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-white/45">
            {description}
          </p>
        </div>
      </div>

      {children}
    </motion.section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold leading-relaxed text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
      />
    </label>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-orange-500/30 hover:bg-orange-500/[0.06]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-orange-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-black text-white">{title}</div>
          <div className="mt-1 text-xs font-semibold leading-relaxed text-white/45">
            {description}
          </div>
        </div>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-orange-500"
      />
    </label>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<AdminSettings>(
    defaultAdminSettings,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const loadSettings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage("");
      const data = await getAdminSettings();
      setSettings(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateBusinessHour = (
    dayKey: string,
    key: keyof BusinessHoursDay,
    value: string | boolean,
  ) => {
    setSettings((current) => ({
      ...current,
      business_hours: current.business_hours.map((day) =>
        day.key === dayKey ? { ...day, [key]: value } : day,
      ),
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage("");
      await saveAdminSettings(settings);
      setMessage("Ajustes guardados correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres restaurar los ajustes base de Velasquez Food Truck?",
    );

    if (!confirmed) return;

    setSettings(defaultAdminSettings);
    setMessage("Ajustes base cargados. Presiona Guardar para aplicarlos.");
  };

  const openTvMenu = (recordingMode = false) => {
    const url = recordingMode ? "/tv-menu?recording=1" : "/tv-menu";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AdminTopbar />

      <section className="mx-auto w-full max-w-[1600px] px-4 pb-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/50 transition hover:text-orange-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al portal
            </a>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-200">
              <Settings className="h-4 w-4" />
              Ajustes generales
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Centro de configuración
            </h1>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-white/55 sm:text-base">
              Controla la información del negocio, horarios, sonidos, módulos visibles y mensajes base sin duplicar productos agotados ni tiempos de preparación.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadSettings}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
            >
              <Sparkles className="h-4 w-4" />
              Restaurar base
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar ajustes"}
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-bold text-orange-100">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-sm font-bold text-white/45">
            Cargando ajustes...
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <SettingsCard
                icon={Building2}
                title="Información del negocio"
                description="Datos principales para página, tickets, mensajes y futuras integraciones."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nombre del negocio" value={settings.business_name} onChange={(value) => updateSetting("business_name", value)} />
                  <Field label="Teléfono" value={settings.phone} onChange={(value) => updateSetting("phone", value)} />
                  <Field label="WhatsApp" value={settings.whatsapp} onChange={(value) => updateSetting("whatsapp", value)} />
                  <Field label="Página web" value={settings.website_url} onChange={(value) => updateSetting("website_url", value)} />
                  <div className="md:col-span-2">
                    <Field label="Dirección" value={settings.address} onChange={(value) => updateSetting("address", value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Google Maps URL" value={settings.google_maps_url} onChange={(value) => updateSetting("google_maps_url", value)} placeholder="https://maps.google.com/..." />
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard
                icon={Clock}
                title="Horarios"
                description="Horario operativo oficial. Domingo queda cerrado por defecto."
              >
                <div className="space-y-3">
                  {settings.business_hours.map((day) => (
                    <div key={day.key} className="grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-[1fr_130px_130px_110px] md:items-center">
                      <div className="font-black text-white">{day.label}</div>
                      <Field label="Abre" type="time" value={day.open_time} onChange={(value) => updateBusinessHour(day.key, "open_time", value)} />
                      <Field label="Cierra" type="time" value={day.close_time} onChange={(value) => updateBusinessHour(day.key, "close_time", value)} />
                      <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/70">
                        Abierto
                        <input type="checkbox" checked={day.is_open} onChange={(event) => updateBusinessHour(day.key, "is_open", event.target.checked)} className="h-5 w-5 accent-orange-500" />
                      </label>
                    </div>
                  ))}
                </div>
              </SettingsCard>
            </div>

            <div className="space-y-6">
              <SettingsCard
                icon={Power}
                title="Módulos y experiencia"
                description="Interruptores globales para dejar lista la base de control sin romper secciones actuales."
              >
                <div className="space-y-3">
                  <ToggleRow icon={Volume2} title="Sonidos generales" description="Base para activar o desactivar sonidos del portal." checked={settings.sound_enabled} onChange={(value) => updateSetting("sound_enabled", value)} />
                  <ToggleRow icon={BellRing} title="Alerta sonora de órdenes" description="Controla futuras alertas de nuevos pedidos en admin." checked={settings.order_alert_sound_enabled} onChange={(value) => updateSetting("order_alert_sound_enabled", value)} />
                  <ToggleRow icon={Eye} title="TikTok feed en Home" description="Preparado para conectar el encendido/apagado del feed público." checked={settings.tiktok_feed_enabled} onChange={(value) => updateSetting("tiktok_feed_enabled", value)} />
                  <ToggleRow icon={Tv} title="TV Menu" description="Permite mantener control del menú para pantalla." checked={settings.tv_menu_enabled} onChange={(value) => updateSetting("tv_menu_enabled", value)} />
                  <ToggleRow icon={MapPin} title="Página de tracking" description="Base para activar o pausar Mi Pedido cuando sea necesario." checked={settings.tracking_page_enabled} onChange={(value) => updateSetting("tracking_page_enabled", value)} />
                </div>
              </SettingsCard>

              <SettingsCard
                icon={Tv}
                title="Pantalla / TV Menu"
                description="Accesos rápidos para abrir el menú digital público o una versión limpia para grabar contenido."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openTvMenu(false)}
                    className="group rounded-2xl border border-white/10 bg-black/35 p-4 text-left transition hover:border-orange-500/45 hover:bg-orange-500/[0.08]"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-200">
                      <Tv className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">Abrir TV Menu</p>
                        <p className="mt-1 text-xs font-semibold leading-relaxed text-white/45">
                          Abre la pantalla completa del menú digital para TV.
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-white/35 transition group-hover:text-orange-200" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => openTvMenu(true)}
                    className="group rounded-2xl border border-orange-500/25 bg-orange-500/[0.07] p-4 text-left transition hover:border-orange-500/60 hover:bg-orange-500/[0.12]"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/35 bg-orange-500/15 text-orange-200">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">Modo grabación</p>
                        <p className="mt-1 text-xs font-semibold leading-relaxed text-white/45">
                          Abre /tv-menu?recording=1 con vista limpia para capturar promos.
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-white/35 transition group-hover:text-orange-200" />
                    </div>
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/[0.06] px-4 py-3 text-xs font-bold leading-relaxed text-orange-100/80">
                  Tip: para grabar, abre el modo grabación en una pestaña nueva y usa pantalla completa del navegador.
                </div>
              </SettingsCard>

              <SettingsCard
                icon={MessageSquareText}
                title="Mensajes automáticos"
                description="Textos base para confirmaciones, pedido listo y respuestas fuera de horario."
              >
                <div className="mb-4">
                  <ToggleRow icon={Power} title="Mensajes automáticos" description="Base visual/configurable. La automatización real se conectará después." checked={settings.auto_whatsapp_enabled} onChange={(value) => updateSetting("auto_whatsapp_enabled", value)} />
                </div>
                <div className="space-y-4">
                  <TextArea label="Mensaje al confirmar pedido" value={settings.auto_order_confirmation_message} onChange={(value) => updateSetting("auto_order_confirmation_message", value)} />
                  <TextArea label="Mensaje pedido listo" value={settings.auto_ready_message} onChange={(value) => updateSetting("auto_ready_message", value)} />
                  <TextArea label="Mensaje fuera de horario" value={settings.auto_closed_message} onChange={(value) => updateSetting("auto_closed_message", value)} />
                </div>
              </SettingsCard>

              <SettingsCard
                icon={Palette}
                title="Branding futuro"
                description="Configuración preparada para futuras pantallas, tickets, menús y módulos."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Color principal" value={settings.brand_primary_color} onChange={(value) => updateSetting("brand_primary_color", value)} />
                  <Field label="Color acento" value={settings.brand_accent_color} onChange={(value) => updateSetting("brand_accent_color", value)} />
                  <div className="md:col-span-2">
                    <TextArea label="Notas de estilo" value={settings.brand_notes} onChange={(value) => updateSetting("brand_notes", value)} />
                  </div>
                </div>
              </SettingsCard>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
