// 📍 Ruta: src/features/admin/printing/ticket-printing.ts

import type { AdminOrder } from "../orders/admin-orders.types";
import {
  defaultAdminSettings,
  readCachedBusinessSettings,
} from "../settings/admin-settings.service";

export type TicketType = "customer" | "kitchen";
export type TicketLanguage = "es" | "en";
export type TicketPaperSize = "58mm" | "80mm";

const ticketText: Record<
  TicketLanguage,
  {
    customerTitle: string;
    kitchenTitle: string;
    customerCopy: string;
    kitchenCopy: string;
    order: string;
    customer: string;
    phone: string;
    date: string;
    payment: string;
    cash: string;
    card: string;
    pending: string;
    subtotal: string;
    fee: string;
    total: string;
    notes: string;
    itemNotes: string;
    thankYou: string;
    customerFooter: string;
    kitchenFooter: string;
    noCustomer: string;
    items: string;
    qty: string;
    paid: string;
    notPaid: string;
    website: string;
    socials: string;
  }
> = {
  es: {
    customerTitle: "Ticket de cliente",
    kitchenTitle: "Ticket de cocina",
    customerCopy: "Copia cliente",
    kitchenCopy: "Cocina",
    order: "Orden",
    customer: "Cliente",
    phone: "Teléfono",
    date: "Fecha",
    payment: "Pago",
    cash: "Efectivo",
    card: "Tarjeta",
    pending: "Pendiente",
    subtotal: "Subtotal",
    fee: "Cargo tarjeta",
    total: "Total",
    notes: "Notas de la orden",
    itemNotes: "Indicaciones",
    thankYou: "Gracias por tu preferencia.",
    customerFooter: "Síguenos y vuelve pronto.",
    kitchenFooter: "Preparar exactamente como se indica.",
    noCustomer: "Cliente POS",
    items: "Productos",
    qty: "Cant.",
    paid: "Pagado",
    notPaid: "Pendiente",
    website: "velasquezfoodtruck.com",
    socials: "Facebook • Instagram • TikTok",
  },
  en: {
    customerTitle: "Customer receipt",
    kitchenTitle: "Kitchen ticket",
    customerCopy: "Customer copy",
    kitchenCopy: "Kitchen",
    order: "Order",
    customer: "Customer",
    phone: "Phone",
    date: "Date",
    payment: "Payment",
    cash: "Cash",
    card: "Card",
    pending: "Pending",
    subtotal: "Subtotal",
    fee: "Card fee",
    total: "Total",
    notes: "Order notes",
    itemNotes: "Instructions",
    thankYou: "Thank you for your preference.",
    customerFooter: "Follow us and come back soon.",
    kitchenFooter: "Prepare exactly as requested.",
    noCustomer: "POS Customer",
    items: "Items",
    qty: "Qty",
    paid: "Paid",
    notPaid: "Pending",
    website: "velasquezfoodtruck.com",
    socials: "Facebook • Instagram • TikTok",
  },
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string, language: TicketLanguage) {
  return new Intl.DateTimeFormat(language === "es" ? "es-US" : "en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getPaymentLabel(order: AdminOrder, language: TicketLanguage) {
  const text = ticketText[language];

  if (order.payment_status === "pending") return text.pending;
  if (order.payment_method === "card") return text.card;
  return text.cash;
}

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildTicketHtml({
  order,
  type,
  language,
  paperSize,
}: {
  order: AdminOrder;
  type: TicketType;
  language: TicketLanguage;
  paperSize: TicketPaperSize;
}) {
  const text = ticketText[language];
  const businessSettings = readCachedBusinessSettings() ?? defaultAdminSettings;
  const footerMessage =
    language === "es"
      ? businessSettings.print_footer_message_es
      : businessSettings.print_footer_message_en;
  const websiteLabel = businessSettings.website_url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const isKitchen = type === "kitchen";
  const width = paperSize === "58mm" ? "58mm" : "80mm";
  const logoUrl = `${window.location.origin}/images/velasquez-logo.png`;
  const title = isKitchen ? text.kitchenTitle : text.customerTitle;
  const copyLabel = isKitchen ? text.kitchenCopy : text.customerCopy;
  const paidLabel =
    order.payment_status === "pending" ? text.notPaid : text.paid;

  const visibleItems = order.items
    .map((item) => {
      const notes =
        item.notes && item.notes !== item.product_name ? item.notes : "";
      return `
        <article class="item">
          <div class="item-main">
            <div class="item-left">
              <span class="qty">${item.quantity}x</span>
              <span class="name">${escapeHtml(item.product_name ?? "Producto")}</span>
            </div>
            ${!isKitchen ? `<span class="price">${formatMoney(item.total_price)}</span>` : ""}
          </div>
          ${
            notes
              ? `<div class="item-notes"><span class="note-label">${text.itemNotes}:</span> ${escapeHtml(notes)}</div>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)} #${escapeHtml(order.order_number)}</title>
    <style>
      @page { size: ${width} auto; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #ffffff;
        color: #000000;
        font-family: Arial, Helvetica, sans-serif;
        font-size: ${paperSize === "58mm" ? "10.5px" : "12px"};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .ticket {
        width: ${width};
        padding: ${paperSize === "58mm" ? "7px" : "10px"};
      }
      .center { text-align: center; }
      .header {
        display: flex;
        align-items: center;
        gap: ${paperSize === "58mm" ? "6px" : "8px"};
        padding-bottom: 7px;
        border-bottom: 2px solid #000;
      }
      .logo {
        width: ${paperSize === "58mm" ? "34px" : "44px"};
        height: ${paperSize === "58mm" ? "34px" : "44px"};
        object-fit: contain;
        flex: 0 0 auto;
      }
      .brand-block { flex: 1; min-width: 0; }
      .brand {
        font-size: ${paperSize === "58mm" ? "13px" : "17px"};
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0.2px;
      }
      .website {
        margin-top: 3px;
        font-size: ${paperSize === "58mm" ? "8.5px" : "10px"};
        font-weight: 700;
        letter-spacing: 0.2px;
      }
      .copy-pill {
        display: inline-block;
        margin-top: 8px;
        padding: 4px 8px;
        border: 1px solid #000;
        border-radius: 999px;
        font-size: ${paperSize === "58mm" ? "9px" : "10px"};
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.7px;
      }
      .order-number {
        margin-top: 7px;
        font-size: ${paperSize === "58mm" ? "20px" : "26px"};
        font-weight: 900;
        line-height: 1;
      }
      .divider { border-top: 1px dashed #000; margin: 8px 0; }
      .solid-divider { border-top: 2px solid #000; margin: 9px 0; }
      .meta-box {
        border: 1px solid #000;
        border-radius: 8px;
        padding: 6px;
        margin-top: 8px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin: 3px 0;
        line-height: 1.2;
      }
      .label { font-weight: 900; }
      .value { text-align: right; font-weight: 700; }
      .status {
        margin-top: 6px;
        padding: 5px;
        border: 1px solid #000;
        border-radius: 6px;
        text-align: center;
        font-weight: 900;
        text-transform: uppercase;
      }
      .section-title {
        margin: 8px 0 4px;
        font-size: ${paperSize === "58mm" ? "10px" : "11px"};
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
      .items { margin-top: 6px; }
      .item {
        padding: ${isKitchen ? "9px 0" : "7px 0"};
        border-bottom: 1px dashed #777;
      }
      .item-main {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: flex-start;
      }
      .item-left {
        display: flex;
        gap: 5px;
        min-width: 0;
      }
      .qty {
        font-weight: 900;
        white-space: nowrap;
      }
      .name {
        font-weight: 900;
        line-height: 1.15;
      }
      .price {
        font-weight: 900;
        text-align: right;
        white-space: nowrap;
      }
      .item-notes {
        margin-top: 5px;
        padding: 5px 6px;
        border-left: 3px solid #000;
        background: #f3f3f3;
        font-size: ${paperSize === "58mm" ? "9.5px" : "10.5px"};
        line-height: 1.25;
        font-weight: 700;
      }
      .note-label {
        font-weight: 900;
        text-transform: uppercase;
      }
      .notes {
        margin-top: 9px;
        padding: 7px;
        border: 2px solid #000;
        border-radius: 8px;
        font-weight: 800;
        line-height: 1.25;
      }
      .notes-title {
        margin-bottom: 3px;
        font-size: ${paperSize === "58mm" ? "9px" : "10px"};
        text-transform: uppercase;
        letter-spacing: 0.7px;
      }
      .total-box {
        margin-top: 8px;
        padding: 7px;
        border: 2px solid #000;
        border-radius: 8px;
      }
      .total-row {
        margin-top: 5px;
        padding-top: 6px;
        border-top: 2px solid #000;
        font-size: ${paperSize === "58mm" ? "15px" : "18px"};
        font-weight: 900;
      }
      .footer {
        margin-top: 10px;
        font-weight: 900;
        line-height: 1.25;
      }
      .footer-small {
        margin-top: 4px;
        font-size: ${paperSize === "58mm" ? "9px" : "10px"};
        font-weight: 700;
      }
      .kitchen .copy-pill {
        border-width: 2px;
      }
      .kitchen .order-number {
        font-size: ${paperSize === "58mm" ? "24px" : "32px"};
      }
      .kitchen .name {
        font-size: ${paperSize === "58mm" ? "16px" : "19px"};
      }
      .kitchen .qty {
        font-size: ${paperSize === "58mm" ? "16px" : "19px"};
      }
      .kitchen .item-notes {
        font-size: ${paperSize === "58mm" ? "11px" : "12px"};
        background: #eeeeee;
      }
      .kitchen-alert {
        margin-top: 10px;
        padding: 8px;
        border: 2px solid #000;
        border-radius: 8px;
        text-align: center;
        font-weight: 900;
        text-transform: uppercase;
        line-height: 1.2;
      }
      @media print {
        body { width: ${width}; }
        .ticket { width: ${width}; }
      }
    </style>
  </head>
  <body>
    <main class="ticket ${isKitchen ? "kitchen" : "customer"}">
      <header class="header">
        <img class="logo" src="${logoUrl}" alt="Velasquez Food Truck" />
        <div class="brand-block">
          <div class="brand">VELASQUEZ FOOD TRUCK</div>
          <div class="website">${text.website}</div>
        </div>
      </header>

      <div class="center">
        <div class="copy-pill">${escapeHtml(copyLabel)}</div>
        <div class="order-number">#${escapeHtml(order.order_number)}</div>
      </div>

      <section class="meta-box">
        <div class="row"><span class="label">${text.date}</span><span class="value">${escapeHtml(formatDate(order.created_at, language))}</span></div>
        <div class="row"><span class="label">${text.customer}</span><span class="value">${escapeHtml(order.customer?.name || text.noCustomer)}</span></div>
        ${order.customer?.phone ? `<div class="row"><span class="label">${text.phone}</span><span class="value">${escapeHtml(order.customer.phone)}</span></div>` : ""}
        ${!isKitchen ? `<div class="row"><span class="label">${text.payment}</span><span class="value">${escapeHtml(getPaymentLabel(order, language))}</span></div>` : ""}
        ${!isKitchen ? `<div class="status">${escapeHtml(paidLabel)}</div>` : ""}
      </section>

      <div class="section-title">${text.items}</div>
      <section class="items">
        ${visibleItems}
      </section>

      ${
        order.notes
          ? `<section class="notes"><div class="notes-title">${text.notes}</div><div>${escapeHtml(order.notes)}</div></section>`
          : ""
      }

      ${
        !isKitchen
          ? `<section class="total-box">
            <div class="row"><span>${text.subtotal}</span><span>${formatMoney(order.subtotal)}</span></div>
            ${order.fee_amount > 0 ? `<div class="row"><span>${text.fee}</span><span>${formatMoney(order.fee_amount)}</span></div>` : ""}
            <div class="row total-row"><span>${text.total}</span><span>${formatMoney(order.total)}</span></div>
          </section>`
          : `<div class="kitchen-alert">${escapeHtml(text.kitchenFooter)}</div>`
      }

      <div class="solid-divider"></div>
      <div class="center footer">${escapeHtml(isKitchen ? "VELASQUEZ" : footerMessage || text.thankYou)}</div>
      ${!isKitchen ? `<div class="center footer-small">${escapeHtml(text.customerFooter)}</div>` : ""}
      <div class="solid-divider"></div>
      ${
        businessSettings.print_show_website && websiteLabel
          ? `<div class="center footer-small">${escapeHtml(websiteLabel)}</div>`
          : ""
      }
      ${
        businessSettings.print_show_phone && businessSettings.phone
          ? `<div class="center footer-small">${escapeHtml(businessSettings.phone)}</div>`
          : ""
      }
      ${
        businessSettings.print_show_address && businessSettings.address
          ? `<div class="center footer-small">${escapeHtml(businessSettings.address)}</div>`
          : ""
      }
      ${
        businessSettings.print_show_socials
          ? `<div class="center footer-small">${escapeHtml(text.socials)}</div>`
          : ""
      }
    </main>
    <script>
      window.addEventListener('load', function () {
        window.focus();
        setTimeout(function () { window.print(); }, 350);
      });
    </script>
  </body>
</html>`;
}

export function printOrderTicket({
  order,
  type,
  language = "es",
  paperSize,
}: {
  order: AdminOrder;
  type: TicketType;
  language?: TicketLanguage;
  paperSize?: TicketPaperSize;
}) {
  const businessSettings = readCachedBusinessSettings() ?? defaultAdminSettings;

  if (!businessSettings.printing_enabled) {
    window.alert(
      language === "es"
        ? "La impresión está desactivada en Ajustes."
        : "Printing is disabled in Settings.",
    );
    return;
  }

  if (type === "customer" && !businessSettings.print_customer_ticket_enabled) {
    window.alert(
      language === "es"
        ? "El ticket de cliente está desactivado en Ajustes."
        : "Customer receipts are disabled in Settings.",
    );
    return;
  }

  if (type === "kitchen" && !businessSettings.print_kitchen_ticket_enabled) {
    window.alert(
      language === "es"
        ? "El ticket de cocina está desactivado en Ajustes."
        : "Kitchen tickets are disabled in Settings.",
    );
    return;
  }

  const resolvedPaperSize = paperSize ?? businessSettings.print_paper_size ?? "80mm";
  const printWindow = window.open("", "_blank", "width=420,height=720");

  if (!printWindow) {
    window.alert(
      language === "es"
        ? "No se pudo abrir la ventana de impresión. Revisa si el navegador bloqueó las ventanas emergentes."
        : "The print window could not be opened. Check if the browser blocked pop-ups.",
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(
    buildTicketHtml({ order, type, language, paperSize: resolvedPaperSize }),
  );
  printWindow.document.close();
}
