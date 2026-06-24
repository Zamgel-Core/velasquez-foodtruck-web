// 📍 Ruta: src/features/admin/reports/AdminReportsPage.tsx

import React from "react";
import ExcelJS from "exceljs";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  DollarSign,
  Package,
  ReceiptText,
  RefreshCw,
  TrendingUp,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import {
  getCashSessionOrders,
  getRecentCashSessions,
  getReportDateRange,
  getReportsSummary,
  getTopProducts,
  type CashRegisterReport,
  type ReportDateFilter,
  type ReportOrder,
  type ReportRange,
  type TopProductReport,
} from "./admin-reports.service";

const rangeOptions: { value: ReportRange; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "all", label: "Todo" },
  { value: "custom", label: "Personalizado" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}


async function assetToDataUri(path: string) {
  try {
    const response = await fetch(path);
    if (!response.ok) return "";
    const blob = await response.blob();

    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function safeFileDate(value = new Date()) {
  return value.toISOString().slice(0, 16).replace(/[-:T]/g, "");
}

function getTodayInputValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSessionExpectedCash(session: CashRegisterReport) {
  return Number(
    session.expected_cash ??
      Number(session.starting_cash || 0) + Number(session.cash_sales || 0)
  );
}

function getSessionDifference(session: CashRegisterReport) {
  if (session.cash_difference !== null && session.cash_difference !== undefined) {
    return Number(session.cash_difference || 0);
  }

  if (session.ending_cash === null || session.ending_cash === undefined) {
    return 0;
  }

  return Number(session.ending_cash || 0) - getSessionExpectedCash(session);
}

export default function AdminReportsPage() {
  const [range, setRange] = React.useState<ReportRange>("today");
  const [customFrom, setCustomFrom] = React.useState(getTodayInputValue());
  const [customTo, setCustomTo] = React.useState(getTodayInputValue());
  const [exporting, setExporting] = React.useState(false);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [summary, setSummary] = React.useState({
    rangeLabel: "Hoy",
    totalSales: 0,
    cashSales: 0,
    cardSales: 0,
    ordersCount: 0,
    cancelledCount: 0,
    averageTicket: 0,
    deliveredOrders: [] as ReportOrder[],
    cancelledOrders: [] as ReportOrder[],
  });

  const [topProducts, setTopProducts] = React.useState<TopProductReport[]>([]);
  const [sessions, setSessions] = React.useState<CashRegisterReport[]>([]);
  const [selectedSession, setSelectedSession] =
    React.useState<CashRegisterReport | null>(null);
  const [selectedSessionOrders, setSelectedSessionOrders] = React.useState<
    ReportOrder[]
  >([]);

  const [loading, setLoading] = React.useState(true);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const reportFilter = React.useMemo<ReportDateFilter>(() => ({
    range,
    from: range === "custom" ? customFrom : undefined,
    to: range === "custom" ? customTo : undefined,
  }), [customFrom, customTo, range]);

  const loadReports = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (reportFilter.range === "custom" && reportFilter.from && reportFilter.to && reportFilter.from > reportFilter.to) {
        setError("La fecha inicial no puede ser mayor que la fecha final.");
        return;
      }

      const [summaryData, productsData, sessionsData] = await Promise.all([
        getReportsSummary(reportFilter),
        getTopProducts(reportFilter),
        getRecentCashSessions(reportFilter),
      ]);

      setSummary(summaryData);
      setTopProducts(productsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }, [reportFilter]);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function openSessionDetails(session: CashRegisterReport) {
    try {
      setSelectedSession(session);
      setDetailsLoading(true);

      const orders = await getCashSessionOrders(session.id);
      setSelectedSessionOrders(orders);
    } catch (err) {
      console.error(err);
      setSelectedSessionOrders([]);
    } finally {
      setDetailsLoading(false);
    }
  }

  function styleHeaderRow(row: ExcelJS.Row, color = "FFEF4444") {
    row.font = { bold: true, color: { argb: "FFFFFFFF" } };
    row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    row.alignment = { vertical: "middle" };
  }

  function applyWorkbookBorders(workbook: ExcelJS.Workbook) {
    for (const worksheet of workbook.worksheets) {
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFD9DEE8" } },
            left: { style: "thin", color: { argb: "FFD9DEE8" } },
            bottom: { style: "thin", color: { argb: "FFD9DEE8" } },
            right: { style: "thin", color: { argb: "FFD9DEE8" } },
          };
          cell.alignment = { vertical: "middle", wrapText: true };
        });
      });
      worksheet.views = [{ state: "frozen", ySplit: 1 }];
    }
  }

  function getDailyBreakdown(orders: ReportOrder[]) {
    const map = new Map<
      string,
      { date: string; cash: number; card: number; pending: number; subtotal: number; tax: number; total: number; orders: number }
    >();

    for (const order of orders) {
      const key = new Date(order.created_at).toISOString().slice(0, 10);
      const current = map.get(key) ?? {
        date: formatDate(order.created_at),
        cash: 0,
        card: 0,
        pending: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        orders: 0,
      };
      const total = Number(order.total || 0);
      current.subtotal += Number(order.subtotal || 0);
      current.tax += Number(order.tax || 0);
      current.total += total;
      current.orders += 1;
      if (order.payment_method === "cash") current.cash += total;
      else if (order.payment_method === "card") current.card += total;
      else current.pending += total;
      map.set(key, current);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, value]) => value);
  }

  async function exportSalesReport() {
    try {
      setExporting(true);
      setError("");

      const generatedDate = new Date();
      const [velasquezLogo, zamgelLogo] = await Promise.all([
        assetToDataUri("/images/velasquez-logo.png"),
        assetToDataUri("/images/zamgelcore-zc-logo.png"),
      ]);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Zamgel Core";
      workbook.lastModifiedBy = "Zamgel Core";
      workbook.created = generatedDate;
      workbook.modified = generatedDate;
      workbook.title = `Reporte de ventas Velasquez - ${summary.rangeLabel}`;
      workbook.company = "Velasquez Food Truck";
      workbook.subject = "Reporte de ventas para control administrativo y taxes";

      const rangeDates = getReportDateRange(reportFilter);
      const generatedAt = formatDateTime(generatedDate.toISOString());
      const totalPending = summary.deliveredOrders
        .filter((order) => order.payment_method === "pending" || order.payment_status === "pending")
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
      const dailyBreakdown = getDailyBreakdown(summary.deliveredOrders);

      const sheet = workbook.addWorksheet("Resumen", {
        properties: { tabColor: { argb: "FFEF4444" } },
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
      });

      sheet.columns = [
        { width: 24 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
      ];

      for (let rowIndex = 1; rowIndex <= 6; rowIndex += 1) {
        sheet.getRow(rowIndex).height = 24;
        for (let colIndex = 1; colIndex <= 8; colIndex += 1) {
          sheet.getCell(rowIndex, colIndex).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF090909" } };
        }
      }

      if (velasquezLogo) {
        const imageId = workbook.addImage({ base64: velasquezLogo, extension: "png" });
        sheet.addImage(imageId, {
          tl: { col: 0.25, row: 0.45 },
          br: { col: 1.65, row: 5.35 },
          editAs: "oneCell",
        });
      }

      if (zamgelLogo) {
        const imageId = workbook.addImage({ base64: zamgelLogo, extension: "png" });
        sheet.addImage(imageId, {
          tl: { col: 6.35, row: 0.75 },
          br: { col: 7.85, row: 3.45 },
          editAs: "oneCell",
        });
      }

      sheet.mergeCells("C1:F1");
      sheet.getCell("C1").value = "VELASQUEZ FOOD TRUCK";
      sheet.getCell("C1").font = { bold: true, size: 22, color: { argb: "FFFFFFFF" } };
      sheet.getCell("C1").alignment = { horizontal: "center", vertical: "middle" };

      sheet.mergeCells("C2:F2");
      sheet.getCell("C2").value = "REPORTE PROFESIONAL DE VENTAS";
      sheet.getCell("C2").font = { bold: true, size: 14, color: { argb: "FFFB923C" } };
      sheet.getCell("C2").alignment = { horizontal: "center", vertical: "middle" };

      sheet.mergeCells("C3:F3");
      sheet.getCell("C3").value = `Rango: ${summary.rangeLabel}`;
      sheet.getCell("C3").font = { bold: true, size: 11, color: { argb: "FFE5E7EB" } };
      sheet.getCell("C3").alignment = { horizontal: "center", vertical: "middle" };

      sheet.mergeCells("C4:F4");
      sheet.getCell("C4").value = `Desde: ${rangeDates.from ? formatDate(rangeDates.from) : "Inicio"}  |  Hasta: ${rangeDates.to ? formatDate(rangeDates.to) : "Actual"}`;
      sheet.getCell("C4").font = { size: 10, color: { argb: "FFD1D5DB" } };
      sheet.getCell("C4").alignment = { horizontal: "center", vertical: "middle" };

      sheet.mergeCells("C5:F5");
      sheet.getCell("C5").value = `Generado el: ${generatedAt}  |  Generado por: Zamgel Admin`;
      sheet.getCell("C5").font = { size: 10, color: { argb: "FFD1D5DB" } };
      sheet.getCell("C5").alignment = { horizontal: "center", vertical: "middle" };

      sheet.mergeCells("G5:H5");
      sheet.getCell("G5").value = "Zamgel Core (ZC)";
      sheet.getCell("G5").font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      sheet.getCell("G5").alignment = { horizontal: "center", vertical: "middle" };

      sheet.addRow([]);
      sheet.addRow(["Resumen fiscal / contable", "Valor", "Notas", "", "Resumen de pagos", "Valor", "Notas", ""]);
      styleHeaderRow(sheet.getRow(8), "FFEF4444");

      const summaryPairs: Array<[string, number, string]> = [
        ["Ventas totales", summary.totalSales, "Órdenes entregadas únicamente"],
        ["Subtotal antes de tax", summary.subtotalSales, "Base de venta antes de impuestos"],
        ["Tax cobrado", summary.taxTotal, "Total de impuestos cobrados"],
        ["Cash", summary.cashSales, `${cashPercent.toFixed(0)}% del total`],
        ["Card", summary.cardSales, `${cardPercent.toFixed(0)}% del total`],
        ["Pendiente / otro", totalPending, "Revisar si aplica"],
        ["Órdenes entregadas", summary.ordersCount, "Base de ventas"],
        ["Órdenes canceladas", summary.cancelledCount, "No suman a ventas"],
        ["Ticket promedio", summary.averageTicket, "Ventas / órdenes entregadas"],
      ];

      summaryPairs.forEach(([label, value, note], index) => {
        const paymentIndex = index - 3;
        const row = sheet.addRow([label, value, note, "", paymentIndex >= 0 && paymentIndex < 4 ? ["Cash", "Card", "Pendiente / otro", "Total"][paymentIndex] : "", paymentIndex >= 0 && paymentIndex < 4 ? [summary.cashSales, summary.cardSales, totalPending, summary.totalSales][paymentIndex] : "", paymentIndex >= 0 && paymentIndex < 4 ? "Método de pago" : "", ""]);
        row.getCell(1).font = { bold: true };
        row.getCell(2).numFmt = (label.includes("Ventas") || label.includes("Subtotal") || label.includes("Tax") || label.includes("Cash") || label.includes("Card") || label.includes("Pendiente") || label === "Ticket promedio") ? "$#,##0.00" : "0";
        row.getCell(6).numFmt = "$#,##0.00";
      });

      sheet.addRow([]);
      sheet.addRow(["Control para taxes", "", "", "", "", "", "", ""]);
      sheet.mergeCells(`A${sheet.lastRow?.number}:H${sheet.lastRow?.number}`);
      const taxTitleRow = sheet.getRow(sheet.lastRow?.number ?? 14);
      styleHeaderRow(taxTitleRow, "FF111827");
      sheet.addRow(["Campo", "Valor", "Uso sugerido", "", "", "", "", ""]);
      styleHeaderRow(sheet.getRow(sheet.lastRow?.number ?? 15), "FFEF4444");
      const taxRows: Array<[string, number, string]> = [
        ["Total bruto registrado", summary.totalSales, "Total de ventas entregadas en el rango"],
        ["Subtotal antes de tax", summary.subtotalSales, "Base antes de impuestos"],
        ["Tax cobrado", summary.taxTotal, "Impuesto registrado en órdenes entregadas"],
        ["Efectivo registrado", summary.cashSales, "Conciliar con cortes de caja"],
        ["Tarjeta registrado", summary.cardSales, "Conciliar con procesador / banco"],
        ["Cancelaciones", summary.cancelledCount, "Revisar hoja de canceladas"],
      ];
      taxRows.forEach(([label, value, note]) => {
        const row = sheet.addRow([label, value, note]);
        if (typeof value === "number" && label !== "Cancelaciones") row.getCell(2).numFmt = "$#,##0.00";
      });

      const dailySheet = workbook.addWorksheet("Resumen diario", { properties: { tabColor: { argb: "FFDC2626" } } });
      dailySheet.columns = [
        { width: 18 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 12 },
        { width: 14 },
      ];
      dailySheet.addRow(["Fecha", "Cash", "Card", "Pendiente", "Subtotal", "Tax", "Total", "Órdenes", "Ticket promedio"]);
      styleHeaderRow(dailySheet.getRow(1), "FFDC2626");
      dailyBreakdown.forEach((day) => {
        const row = dailySheet.addRow([day.date, day.cash, day.card, day.pending, day.subtotal, day.tax, day.total, day.orders, day.orders ? day.total / day.orders : 0]);
        [2, 3, 4, 5, 6, 7, 9].forEach((cell) => row.getCell(cell).numFmt = "$#,##0.00");
      });

      const topSheet = workbook.addWorksheet("Productos top", { properties: { tabColor: { argb: "FFF97316" } } });
      topSheet.columns = [{ width: 8 }, { width: 34 }, { width: 14 }, { width: 16 }, { width: 18 }];
      topSheet.addRow(["#", "Producto", "Cantidad", "Total vendido", "% de ventas"]);
      styleHeaderRow(topSheet.getRow(1), "FFF97316");
      topProducts.forEach((product, index) => {
        const row = topSheet.addRow([index + 1, product.productName, product.quantity, product.total, summary.totalSales ? product.total / summary.totalSales : 0]);
        row.getCell(4).numFmt = "$#,##0.00";
        row.getCell(5).numFmt = "0.00%";
      });

      const ordersSheet = workbook.addWorksheet("Ordenes entregadas", { properties: { tabColor: { argb: "FF22C55E" } } });
      ordersSheet.columns = [
        { width: 18 },
        { width: 24 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 20 },
      ];
      ordersSheet.addRow(["Orden", "Fecha", "Pago", "Subtotal", "Tax", "Total", "Estado pago", "Estado", "Corte / caja"]);
      styleHeaderRow(ordersSheet.getRow(1), "FF22C55E");
      summary.deliveredOrders.forEach((order) => {
        const row = ordersSheet.addRow([
          `#${order.order_number}`,
          formatDateTime(order.created_at),
          order.payment_method,
          Number(order.subtotal || 0),
          Number(order.tax || 0),
          Number(order.total || 0),
          order.payment_status,
          order.status,
          order.register_session_id ? "Ligada a corte" : "Sin corte",
        ]);
        [4, 5, 6].forEach((cell) => row.getCell(cell).numFmt = "$#,##0.00");
      });

      const cancelledSheet = workbook.addWorksheet("Ordenes canceladas", { properties: { tabColor: { argb: "FF991B1B" } } });
      cancelledSheet.columns = [
        { width: 18 },
        { width: 24 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
      ];
      cancelledSheet.addRow(["Orden", "Fecha", "Pago", "Subtotal", "Tax", "Total", "Estado pago", "Estado"]);
      styleHeaderRow(cancelledSheet.getRow(1), "FF991B1B");
      summary.cancelledOrders.forEach((order) => {
        const row = cancelledSheet.addRow([
          `#${order.order_number}`,
          formatDateTime(order.created_at),
          order.payment_method,
          Number(order.subtotal || 0),
          Number(order.tax || 0),
          Number(order.total || 0),
          order.payment_status,
          order.status,
        ]);
        [4, 5, 6].forEach((cell) => row.getCell(cell).numFmt = "$#,##0.00");
      });

      const cutsSheet = workbook.addWorksheet("Cortes de caja", { properties: { tabColor: { argb: "FF3B82F6" } } });
      cutsSheet.columns = [
        { width: 24 },
        { width: 24 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
        { width: 14 },
        { width: 12 },
        { width: 14 },
        { width: 28 },
      ];
      cutsSheet.addRow(["Apertura", "Cierre", "Cash", "Card", "Total", "Efectivo esperado", "Efectivo contado", "Diferencia", "Órdenes", "Estado", "Notas"]);
      styleHeaderRow(cutsSheet.getRow(1), "FF3B82F6");
      sessions.forEach((session) => {
        const row = cutsSheet.addRow([
          formatDateTime(session.opened_at),
          formatDateTime(session.closed_at),
          Number(session.cash_sales || 0),
          Number(session.card_sales || 0),
          Number(session.total_sales || 0),
          getSessionExpectedCash(session),
          session.ending_cash === null || session.ending_cash === undefined ? null : Number(session.ending_cash || 0),
          getSessionDifference(session),
          session.order_count,
          session.status,
          session.notes ?? "",
        ]);
        [3, 4, 5, 6, 7, 8].forEach((cell) => {
          row.getCell(cell).numFmt = "$#,##0.00";
        });
      });

      applyWorkbookBorders(workbook);
      sheet.views = [{ state: "frozen", ySplit: 8 }];
      sheet.pageSetup.printTitlesRow = "1:8";
      sheet.headerFooter.oddFooter = "Reporte generado por Zamgel Core (ZC)";

      const buffer = await workbook.xlsx.writeBuffer();
      downloadBlob(
        new Blob([buffer as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `reporte_ventas_velasquez_${safeFileDate()}.xlsx`,
      );
      setExportModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo exportar el reporte Excel.");
    } finally {
      setExporting(false);
    }
  }

  const topProduct = topProducts[0];
  const cashPercent =
    summary.totalSales > 0 ? (summary.cashSales / summary.totalSales) * 100 : 0;
  const cardPercent =
    summary.totalSales > 0 ? (summary.cardSales / summary.totalSales) * 100 : 0;

  return (
    <>
      <AdminTopbar />

      <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                  <BarChart3 className="h-4 w-4" />
                  Reportes
                </div>

                <h1 className="text-3xl font-black sm:text-4xl">
                  Reportes <span className="text-orange-500">Velasquez</span>
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  Ventas, cortes, productos top y resumen operativo.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-2">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRange(option.value)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
                        range === option.value
                          ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "border-white/10 bg-black/20 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {range === "custom" && (
                  <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/25 p-2 sm:flex-row">
                    <label className="text-xs font-black text-white/50">
                      Desde
                      <input
                        value={customFrom}
                        onChange={(event) => setCustomFrom(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-red-500"
                        type="date"
                      />
                    </label>
                    <label className="text-xs font-black text-white/50">
                      Hasta
                      <input
                        value={customTo}
                        onChange={(event) => setCustomTo(event.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-red-500"
                        type="date"
                      />
                    </label>
                  </div>
                )}

                <button
                  onClick={loadReports}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-black transition hover:bg-white/[0.10]"
                  type="button"
                >
                  <RefreshCw className="h-5 w-5" />
                  Actualizar
                </button>

                <button
                  onClick={() => setExportModalOpen(true)}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                >
                  <Download className="h-5 w-5" />
                  Descargar Excel
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/50">
              Cargando reportes...
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ReportCard
                  icon={DollarSign}
                  label={`Ventas ${summary.rangeLabel}`}
                  value={formatMoney(summary.totalSales)}
                  tone="orange"
                />

                <ReportCard
                  icon={WalletCards}
                  label="Cash"
                  value={formatMoney(summary.cashSales)}
                  sub={`${cashPercent.toFixed(0)}% del total`}
                  tone="green"
                />

                <ReportCard
                  icon={CreditCard}
                  label="Card"
                  value={formatMoney(summary.cardSales)}
                  sub={`${cardPercent.toFixed(0)}% del total`}
                  tone="blue"
                />

                <ReportCard
                  icon={ReceiptText}
                  label="Órdenes"
                  value={String(summary.ordersCount)}
                  sub={`Canceladas: ${summary.cancelledCount}`}
                  tone="white"
                />
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <ReportCard
                  icon={TrendingUp}
                  label="Ticket promedio"
                  value={formatMoney(summary.averageTicket)}
                  tone="blue"
                />

                <ReportCard
                  icon={Package}
                  label="Producto #1"
                  value={topProduct ? topProduct.productName : "—"}
                  sub={
                    topProduct
                      ? `${topProduct.quantity} vendidos · ${formatMoney(topProduct.total)}`
                      : "Sin ventas"
                  }
                  tone="orange"
                />

                <ReportCard
                  icon={CalendarDays}
                  label="Rango activo"
                  value={summary.rangeLabel}
                  sub="Filtro aplicado"
                  tone="green"
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <Package className="h-6 w-6 text-orange-300" />
                    <h2 className="text-2xl font-black">
                      Productos top {summary.rangeLabel.toLowerCase()}
                    </h2>
                  </div>

                  {topProducts.length === 0 ? (
                    <p className="text-sm font-bold text-white/40">
                      No hay productos entregados en este rango.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.map((product, index) => (
                        <div
                          key={product.productName}
                          className="rounded-2xl border border-white/10 bg-black/25 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-black">
                                #{index + 1} {product.productName}
                              </p>
                              <p className="text-xs font-bold text-white/45">
                                Cantidad: {product.quantity}
                              </p>
                            </div>

                            <p className="text-lg font-black text-orange-300">
                              {formatMoney(product.total)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <WalletCards className="h-6 w-6 text-green-300" />
                    <h2 className="text-2xl font-black">Cortes recientes</h2>
                  </div>

                  {sessions.length === 0 ? (
                    <p className="text-sm font-bold text-white/40">
                      No hay cortes registrados en este rango.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => {
                        const diff = getSessionDifference(session);

                        return (
                          <button
                            key={session.id}
                            onClick={() => openSessionDetails(session)}
                            className="w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-orange-500/40 hover:bg-orange-500/[0.06]"
                            type="button"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-black">
                                  {formatDateTime(session.opened_at)}
                                </p>

                                <p className="text-xs font-bold text-white/45">
                                  Cierre: {formatDateTime(session.closed_at)}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-xl font-black text-orange-300">
                                  {formatMoney(Number(session.total_sales))}
                                </p>

                                <p
                                  className={`text-xs font-black ${
                                    session.status === "open"
                                      ? "text-green-300"
                                      : "text-white/45"
                                  }`}
                                >
                                  {session.status === "open" ? "ABIERTA" : "CERRADA"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 grid gap-2 text-xs font-bold text-white/50 sm:grid-cols-5">
                              <span>Cash: {formatMoney(Number(session.cash_sales))}</span>
                              <span>Card: {formatMoney(Number(session.card_sales))}</span>
                              <span>Órdenes: {session.order_count}</span>
                              <span
                                className={
                                  diff < 0
                                    ? "text-red-300"
                                    : diff > 0
                                      ? "text-yellow-300"
                                      : "text-green-300"
                                }
                              >
                                Dif: {formatMoney(diff)}
                              </span>
                              <span className="text-red-300">
                                Canceladas: {session.cancelled_count}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        {exportModalOpen && (
          <SalesExportModal
            rangeLabel={summary.rangeLabel}
            totalSales={summary.totalSales}
            cashSales={summary.cashSales}
            cardSales={summary.cardSales}
            ordersCount={summary.ordersCount}
            cancelledCount={summary.cancelledCount}
            topProduct={topProduct}
            rangeFrom={getReportDateRange(reportFilter).from}
            rangeTo={getReportDateRange(reportFilter).to}
            generatedAt={formatDateTime(new Date().toISOString())}
            exporting={exporting}
            onExport={exportSalesReport}
            onClose={() => setExportModalOpen(false)}
          />
        )}

        {selectedSession && (
          <SessionDetailsModal
            session={selectedSession}
            orders={selectedSessionOrders}
            loading={detailsLoading}
            onClose={() => {
              setSelectedSession(null);
              setSelectedSessionOrders([]);
            }}
          />
        )}
      </main>
    </>
  );
}


function SalesExportModal({
  rangeLabel,
  totalSales,
  cashSales,
  cardSales,
  ordersCount,
  cancelledCount,
  topProduct,
  rangeFrom,
  rangeTo,
  generatedAt,
  exporting,
  onExport,
  onClose,
}: {
  rangeLabel: string;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  ordersCount: number;
  cancelledCount: number;
  topProduct?: TopProductReport;
  rangeFrom: string | null;
  rangeTo: string | null;
  generatedAt: string;
  exporting: boolean;
  onExport: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101010] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Exportar reporte de ventas</h2>
            <p className="mt-1 text-sm font-semibold text-white/55">
              Reporte profesional para control de ventas, cortes de caja y soporte para taxes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-orange-500/25 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.24),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5">
              <div className="flex items-center justify-between gap-4">
                <img
                  src="/images/velasquez-logo.png"
                  alt="Velasquez Food Truck"
                  className="h-24 w-24 object-contain"
                />
                <div className="text-center">
                  <p className="text-xl font-black uppercase tracking-wide">
                    Velasquez Food Truck
                  </p>
                  <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-orange-200">
                    Reporte de ventas
                  </p>
                  <p className="mt-3 text-xs text-white/55">
                    Rango: {rangeLabel}
                  </p>
                  <p className="text-xs text-white/55">
                    Desde: {rangeFrom ? formatDate(rangeFrom) : "Inicio"} · Hasta: {rangeTo ? formatDate(rangeTo) : "Actual"}
                  </p>
                  <p className="text-xs text-white/55">
                    Generado el: {generatedAt}
                  </p>
                  <p className="text-xs text-white/55">
                    Generado por: Zamgel Admin
                  </p>
                </div>
                <img
                  src="/images/zamgelcore-zc-logo.png"
                  alt="Zamgel Core"
                  className="h-20 w-20 object-contain"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniMetric label="Ventas" value={formatMoney(totalSales)} tone="green" />
              <MiniMetric label="Cash" value={formatMoney(cashSales)} tone="white" />
              <MiniMetric label="Card" value={formatMoney(cardSales)} tone="white" />
              <MiniMetric label="Órdenes" value={String(ordersCount)} tone="white" />
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <p className="font-black">El archivo incluirá</p>
              <div className="mt-3 space-y-2 text-sm font-semibold text-white/65">
                {[
                  "Encabezado con identidad de marca y logos",
                  "Fechas del reporte visibles antes de descargar",
                  "Resumen fiscal / contable del rango seleccionado",
                  "Separación de ventas en cash, card y pendiente",
                  "Resumen diario para revisar ventas por fecha",
                  "Productos top, órdenes entregadas, canceladas y cortes",
                  "Formato compatible con Excel para imprimir o enviar al contador",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Vista previa</p>
                <p className="text-sm font-semibold text-white/50">Formato .xlsx compatible con Excel</p>
              </div>
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-black text-green-300">Excel</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-black shadow-xl">
              <div className="bg-[#0b0b0b] p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <img
                    src="/images/velasquez-logo.png"
                    alt=""
                    className="h-16 w-16 object-contain"
                  />
                  <div className="text-center">
                    <p className="text-lg font-black uppercase">VELASQUEZ FOOD TRUCK</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">Reporte profesional de ventas</p>
                    <p className="mt-1 text-[11px] text-white/60">{formatDate(rangeFrom)} - {formatDate(rangeTo)} </p>
                  </div>
                  <img
                    src="/images/zamgelcore-zc-logo.png"
                    alt=""
                    className="h-14 w-14 object-contain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 border-b border-zinc-200 text-center">
                <PreviewMetric label="Ventas" value={formatMoney(totalSales)} />
                <PreviewMetric label="Cash" value={formatMoney(cashSales)} />
                <PreviewMetric label="Card" value={formatMoney(cardSales)} />
                <PreviewMetric label="Órdenes" value={String(ordersCount)} />
              </div>

              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] bg-red-600 px-3 py-2 text-xs font-black text-white">
                <span>Sección</span>
                <span>Cash</span>
                <span>Card</span>
                <span>Total</span>
              </div>
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] px-3 py-2 text-xs font-semibold text-zinc-700">
                <span>Resumen fiscal</span>
                <span>{formatMoney(cashSales)}</span>
                <span>{formatMoney(cardSales)}</span>
                <span>{formatMoney(totalSales)}</span>
              </div>
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700">
                <span>Producto #1</span>
                <span className="col-span-2">{topProduct?.productName ?? "Sin ventas"}</span>
                <span>{topProduct ? formatMoney(topProduct.total) : "$0.00"}</span>
              </div>
              <div className="px-3 py-3 text-center text-xs font-semibold text-zinc-500">
                Canceladas: {cancelledCount} · Hojas: Resumen, Resumen diario, Productos top, Órdenes entregadas, Órdenes canceladas y Cortes de caja.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black transition hover:bg-white/10"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onExport}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
          >
            <Download className="h-5 w-5" />
            {exporting ? "Generando reporte..." : "Descargar reporte Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-zinc-200 px-2 py-3 last:border-r-0">
      <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-black text-zinc-950">{value}</p>
    </div>
  );
}

function SessionDetailsModal({
  session,
  orders,
  loading,
  onClose,
}: {
  session: CashRegisterReport;
  orders: ReportOrder[];
  loading: boolean;
  onClose: () => void;
}) {
  const expectedCash = getSessionExpectedCash(session);
  const diff = getSessionDifference(session);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-black text-green-300">
              <WalletCards className="h-4 w-4" />
              Detalle de corte
            </div>

            <h2 className="text-3xl font-black">
              Corte {session.status === "open" ? "abierto" : "cerrado"}
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Apertura: {formatDateTime(session.opened_at)}
            </p>
            <p className="text-sm text-white/50">
              Cierre: {formatDateTime(session.closed_at)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <MiniMetric label="Total" value={formatMoney(Number(session.total_sales))} />
          <MiniMetric label="Cash" value={formatMoney(Number(session.cash_sales))} />
          <MiniMetric label="Card" value={formatMoney(Number(session.card_sales))} />
          <MiniMetric label="Órdenes" value={String(session.order_count)} />
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <MiniMetric
            label="Efectivo inicial"
            value={formatMoney(Number(session.starting_cash))}
          />
          <MiniMetric label="Efectivo esperado" value={formatMoney(expectedCash)} />
          <MiniMetric
            label="Efectivo contado"
            value={
              session.ending_cash === null || session.ending_cash === undefined
                ? "—"
                : formatMoney(Number(session.ending_cash))
            }
          />
          <MiniMetric
            label="Diferencia"
            value={formatMoney(diff)}
            tone={diff < 0 ? "red" : diff > 0 ? "yellow" : "green"}
          />
        </div>

        {session.notes && (
          <div className="mb-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-orange-300">
              Notas
            </p>
            <p className="mt-1 text-sm font-bold text-white/80">{session.notes}</p>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-xl font-black">Órdenes del corte</h3>

          {loading ? (
            <p className="mt-3 text-sm font-bold text-white/40">
              Cargando órdenes...
            </p>
          ) : orders.length === 0 ? (
            <p className="mt-3 text-sm font-bold text-white/40">
              No hay órdenes ligadas a este corte.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black">Orden #{order.order_number}</p>
                    <p className="text-xs font-bold text-white/45">
                      {formatDateTime(order.created_at)} · {order.status}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-black text-orange-300">
                      {formatMoney(Number(order.total))}
                    </p>
                    <p className="text-xs font-bold text-white/45">
                      {order.payment_method}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone = "white",
}: {
  label: string;
  value: string;
  tone?: "white" | "green" | "yellow" | "red";
}) {
  const toneClass = {
    white: "text-white",
    green: "text-green-300",
    yellow: "text-yellow-300",
    red: "text-red-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className={`mt-1 text-xl font-black ${toneClass[tone]}`}>{value}</p>
    </div>
  );
}

function ReportCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone: "orange" | "green" | "blue" | "white";
}) {
  const styles = {
    orange: "border-orange-500/20 bg-orange-500/[0.06] text-orange-300",
    green: "border-green-500/20 bg-green-500/[0.06] text-green-300",
    blue: "border-blue-500/20 bg-blue-500/[0.06] text-blue-300",
    white: "border-white/10 bg-white/[0.04] text-white/60",
  };

  return (
    <div className={`rounded-3xl border p-5 ${styles[tone]}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <p className="text-xs font-black uppercase tracking-wide">{label}</p>
      </div>

      <p className="text-3xl font-black text-white">{value}</p>

      {sub && (
        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-white/45">
          {sub.includes("Canceladas") && <XCircle className="h-4 w-4 text-red-300" />}
          {sub}
        </p>
      )}
    </div>
  );
}