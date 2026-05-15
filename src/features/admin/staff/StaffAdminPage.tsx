// 📍 Ruta: src/features/admin/staff/StaffAdminPage.tsx

import React from "react";
import { Plus, RefreshCw, Search, Shield, UserCog, X } from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import {
  createStaffMember,
  getStaffMembers,
  updateStaffMember,
  type StaffMember,
} from "./admin-staff.service";
import type { StaffRole } from "../auth/useStaffAuth";
import { useStaffAuth } from "../auth/useStaffAuth";

const roles: StaffRole[] = ["super_admin", "admin", "employee", "cashier", "kitchen"];
const roleFilters: Array<"all" | StaffRole | "inactive"> = [
  "all",
  "super_admin",
  "admin",
  "employee",
  "cashier",
  "kitchen",
  "inactive",
];

function getRoleLabel(role: "all" | StaffRole | "inactive") {
  if (role === "all") return "Todos";
  if (role === "inactive") return "Inactivos";

  return role.toUpperCase();
}

export default function StaffAdminPage() {
  const { role } = useStaffAuth();
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<
    "all" | StaffRole | "inactive"
  >("all");
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const [newStaff, setNewStaff] = React.useState({
    user_id: "",
    email: "",
    full_name: "",
    role: "employee" as StaffRole,
  });

  const activeCount = staff.filter((member) => member.is_active).length;
  const adminCount = staff.filter(
    (member) => member.role === "admin" && member.is_active
  ).length;
  const employeeCount = staff.filter(
    (member) => member.role !== "admin" && member.is_active
  ).length;

  const loadStaff = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setStaff(await getStaffMembers());
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los empleados.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const filteredStaff = staff.filter((member) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !query ||
      member.full_name.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.user_id.toLowerCase().includes(query);

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "inactive" && !member.is_active) ||
      member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  async function handleCreateStaff(event: React.FormEvent) {
    event.preventDefault();

    const userId = newStaff.user_id.trim();
    const email = newStaff.email.trim();
    const fullName = newStaff.full_name.trim();

    if (!userId || !email || !fullName) {
      setError("Completa UID, email y nombre del empleado.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const created = await createStaffMember({
        user_id: userId,
        email,
        full_name: fullName,
        role: newStaff.role,
        is_active: true,
      });

      setStaff((current) => [created, ...current]);
      setNewStaff({
        user_id: "",
        email: "",
        full_name: "",
        role: "employee",
      });
      setShowCreateForm(false);
      setSuccess("Empleado creado correctamente.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el empleado."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(
    member: StaffMember,
    changes: Partial<
      Pick<StaffMember, "full_name" | "email" | "role" | "is_active">
    >
  ) {
    try {
      setSavingId(member.id);
      setError("");
      setSuccess("");

      const updated = await updateStaffMember(member.id, changes);

      setStaff((current) =>
        current.map((item) => (item.id === member.id ? updated : item))
      );

      setSuccess("Empleado actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el empleado.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <>
      <AdminTopbar />

      <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-10">
        <section className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                  <Shield className="h-4 w-4" />
                  Control de acceso
                </div>

                <h1 className="text-3xl font-black sm:text-4xl">
                  Staff <span className="text-orange-500">Velasquez</span>
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  Administra empleados, roles y accesos del sistema.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-200">
                    {activeCount} activos
                  </span>
                  <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-orange-200">
                    {adminCount} admin
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
                    {employeeCount} staff
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={loadStaff}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-black transition hover:bg-white/[0.10]"
                  type="button"
                >
                  <RefreshCw className="h-5 w-5" />
                  Actualizar
                </button>

                <button
                  onClick={() => setShowCreateForm((value) => !value)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500"
                  type="button"
                >
                  {showCreateForm ? (
                    <>
                      <X className="h-5 w-5" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Nuevo empleado
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-200">
              {success}
            </div>
          )}

          {showCreateForm && (
            <form
              onSubmit={handleCreateStaff}
              className="mb-6 rounded-3xl border border-orange-500/20 bg-orange-500/[0.06] p-5"
            >
              <div className="mb-4">
                <h2 className="text-xl font-black">Nuevo empleado</h2>
                <p className="mt-1 text-sm font-semibold text-white/50">
                  Primero crea el usuario en Supabase Auth, copia su User UID y
                  después regístralo aquí.
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr_180px]">
                <input
                  value={newStaff.user_id}
                  onChange={(event) =>
                    setNewStaff((current) => ({
                      ...current,
                      user_id: event.target.value,
                    }))
                  }
                  placeholder="User UID de Supabase Auth"
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500/60"
                />

                <input
                  value={newStaff.email}
                  onChange={(event) =>
                    setNewStaff((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Email"
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500/60"
                />

                <input
                  value={newStaff.full_name}
                  onChange={(event) =>
                    setNewStaff((current) => ({
                      ...current,
                      full_name: event.target.value,
                    }))
                  }
                  placeholder="Nombre"
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500/60"
                />

                <select
                  value={newStaff.role}
                  onChange={(event) =>
                    setNewStaff((current) => ({
                      ...current,
                      role: event.target.value as StaffRole,
                    }))
                  }
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-black outline-none focus:border-orange-500/60"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={creating}
                className="mt-4 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                type="submit"
              >
                {creating ? "Creando..." : "Crear empleado"}
              </button>
            </form>
          )}

          <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nombre, email o UID..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-12 pr-4 font-semibold outline-none transition placeholder:text-white/30 focus:border-orange-500/60"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {roleFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setRoleFilter(filter)}
                    className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                      roleFilter === filter
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
                    }`}
                    type="button"
                  >
                    {getRoleLabel(filter)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/50">
              Cargando empleados...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/50">
              No hay empleados para mostrar.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px_160px] lg:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-200">
                        <UserCog className="h-6 w-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <input
                          value={member.full_name}
                          onChange={(event) =>
                            setStaff((current) =>
                              current.map((item) =>
                                item.id === member.id
                                  ? { ...item, full_name: event.target.value }
                                  : item
                              )
                            )
                          }
                          onBlur={() =>
                            handleUpdate(member, {
                              full_name: member.full_name.trim(),
                            })
                          }
                          className="w-full bg-transparent text-lg font-black outline-none"
                        />

                        <p className="break-all text-xs font-bold text-white/40">
                          {member.email || "Sin email"} · {member.user_id}
                        </p>
                      </div>
                    </div>

                    <input
                      value={member.email ?? ""}
                      onChange={(event) =>
                        setStaff((current) =>
                          current.map((item) =>
                            item.id === member.id
                              ? { ...item, email: event.target.value }
                              : item
                          )
                        )
                      }
                      onBlur={() =>
                        handleUpdate(member, {
                          email: member.email?.trim() || null,
                        })
                      }
                      placeholder="Email"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500/60"
                    />

                    <select
  value={member.role}
  disabled={
    member.role === "super_admin" &&
    role !== "super_admin"
  }
  onChange={(event) =>
    handleUpdate(member, {
      role: event.target.value as StaffRole,
    })
  }
  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-black outline-none focus:border-orange-500/60"
>
  {roles.map((role) => (
    <option key={role} value={role}>
      {role.toUpperCase()}
    </option>
  ))}
</select>

<button
  onClick={() =>
    handleUpdate(member, {
      is_active: !member.is_active,
    })
  }
  disabled={
    savingId === member.id ||
    (
      member.role === "super_admin" &&
      role !== "super_admin"
    )
  }
  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
    member.is_active
      ? "border border-green-500/30 bg-green-500/10 text-green-200 hover:bg-green-500/20"
      : "border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
  }`}
  type="button"
>
  {savingId === member.id
    ? "Guardando..."
    : member.is_active
      ? "Activo"
      : "Inactivo"}
</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}