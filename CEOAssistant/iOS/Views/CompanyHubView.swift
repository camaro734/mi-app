import SwiftUI

/// "Empresa": centro de datos de Nexus con tres vistas — Agenda (citas),
/// Partes de trabajo y Finanzas (KPIs). Sustituye a la antigua pestaña Agenda.
struct CompanyHubView: View {
    @EnvironmentObject var store: AssistantStore
    @State private var segment = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("", selection: $segment) {
                    Text("Agenda").tag(0)
                    Text("Partes").tag(1)
                    Text("Finanzas").tag(2)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.top, 8)

                if !store.nexusConnected {
                    Spacer()
                    ContentUnavailableView("Conecta con Nexus",
                        systemImage: "link",
                        description: Text("Inicia sesión en Nexus desde Ajustes para ver la agenda, los partes y las finanzas de la empresa."))
                    Spacer()
                } else {
                    switch segment {
                    case 1: PartesList()
                    case 2: FinanceView()
                    default: AgendaList()
                    }
                }
            }
            .navigationTitle("Empresa")
            .toolbar {
                Button {
                    Task { await store.refreshCalendar(); await store.loadCompanyData() }
                } label: { Image(systemName: "arrow.clockwise") }
            }
            .task { await store.refreshCalendar(); await store.loadCompanyData() }
        }
    }
}

// MARK: - Agenda (citas de Nexus)

struct AgendaList: View {
    @EnvironmentObject var store: AssistantStore

    private var grouped: [(day: Date, items: [Appointment])] {
        let cal = Calendar.current
        let dict = Dictionary(grouping: store.appointments) { cal.startOfDay(for: $0.startDate) }
        return dict.keys.sorted().map { ($0, dict[$0]!.sorted { $0.startDate < $1.startDate }) }
    }

    var body: some View {
        List {
            if store.appointments.isEmpty {
                ContentUnavailableView("Sin citas próximas",
                    systemImage: "calendar",
                    description: Text("No hay citas en los próximos 7 días en Nexus."))
            }
            ForEach(grouped, id: \.day) { group in
                Section(group.day.formatted(.dateTime.weekday(.wide).day().month())) {
                    ForEach(group.items) { AppointmentRow(appointment: $0) }
                }
            }
        }
        .refreshable { await store.refreshCalendar() }
    }
}

struct AppointmentRow: View {
    let appointment: Appointment
    var body: some View {
        HStack(spacing: 12) {
            VStack {
                Text(appointment.startDate, style: .time).font(.subheadline.bold())
                Text(appointment.endDate, style: .time).font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(width: 56)
            Rectangle().fill(Color.indigo).frame(width: 3).cornerRadius(2)
            VStack(alignment: .leading, spacing: 2) {
                Text(appointment.title).font(.headline)
                if let loc = appointment.location, !loc.isEmpty {
                    Label(loc, systemImage: "mappin").font(.caption)
                        .foregroundStyle(.secondary)
                }
                if !appointment.attendees.isEmpty {
                    Text(appointment.attendees.joined(separator: ", "))
                        .font(.caption2).foregroundStyle(.secondary).lineLimit(1)
                }
            }
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Partes de trabajo

struct PartesList: View {
    @EnvironmentObject var store: AssistantStore

    var body: some View {
        List {
            if store.workOrders.isEmpty {
                ContentUnavailableView("Sin partes activos",
                    systemImage: "wrench.and.screwdriver",
                    description: Text("No hay partes de trabajo abiertos en Nexus."))
            }
            ForEach(store.workOrders) { wo in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(wo.orderNumber ?? "—").font(.headline)
                        Spacer()
                        if let s = wo.status, !s.isEmpty { PartStatusBadge(text: s) }
                    }
                    if let c = wo.customerName, !c.isEmpty {
                        Text(c).font(.subheadline)
                    }
                    HStack(spacing: 10) {
                        if let p = wo.vehiclePlate, !p.isEmpty {
                            Label(p, systemImage: "car").font(.caption).foregroundStyle(.secondary)
                        }
                        if let t = wo.total, t > 0 {
                            Label(AssistantStore.eur(t), systemImage: "eurosign")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    if let d = wo.workDescription, !d.isEmpty {
                        Text(d).font(.caption).foregroundStyle(.secondary).lineLimit(2)
                    }
                }
                .padding(.vertical, 2)
            }
        }
        .refreshable { await store.loadCompanyData() }
    }
}

struct PartStatusBadge: View {
    let text: String
    var body: some View {
        Text(text.replacingOccurrences(of: "_", with: " ").capitalized)
            .font(.caption2.bold())
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(color.opacity(0.15), in: Capsule())
            .foregroundStyle(color)
    }
    private var color: Color {
        switch text {
        case "en_trabajo", "validado", "facturado": return .green
        case "pausado_material", "pendiente_firma", "pendiente_validacion": return .orange
        case "cancelado": return .red
        default: return .indigo
        }
    }
}

// MARK: - Finanzas (KPIs)

struct FinanceView: View {
    @EnvironmentObject var store: AssistantStore

    private let cols = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        ScrollView {
            if let k = store.kpis {
                VStack(alignment: .leading, spacing: 14) {
                    Text("Resumen \(String(k.anio))").font(.title3.bold())
                    LazyVGrid(columns: cols, spacing: 12) {
                        KPICard(title: "Ventas", value: AssistantStore.eur(k.ventas),
                                sub: "\(arrow(k.crecimientoPct)) \(fmt(k.crecimientoPct))% vs año ant.",
                                color: .green)
                        KPICard(title: "Beneficio", value: AssistantStore.eur(k.beneficio),
                                sub: "margen \(fmt(k.margenPct))%", color: .indigo)
                        KPICard(title: "Compras", value: AssistantStore.eur(k.compras), sub: nil, color: .orange)
                        KPICard(title: "Nóminas", value: AssistantStore.eur(k.nominas), sub: nil, color: .orange)
                        KPICard(title: "Pendiente de cobro", value: AssistantStore.eur(k.porCobrar), sub: nil, color: .blue)
                        KPICard(title: "Pendiente de pago", value: AssistantStore.eur(k.porPagar), sub: nil, color: .red)
                    }
                }
                .padding()
            } else {
                ContentUnavailableView("Sin datos financieros",
                    systemImage: "eurosign.circle",
                    description: Text("Si tu usuario de Nexus es de dirección, desliza hacia abajo para actualizar. Si no, tu usuario no tiene permiso para ver las finanzas."))
                    .padding(.top, 40)
            }
        }
        .refreshable { await store.loadCompanyData() }
    }

    private func fmt(_ v: Double) -> String { String(format: "%.1f", v) }
    private func arrow(_ v: Double) -> String { v >= 0 ? "▲" : "▼" }
}

struct KPICard: View {
    let title: String
    let value: String
    let sub: String?
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.caption).foregroundStyle(.secondary)
            Text(value).font(.title3.bold()).foregroundStyle(color).lineLimit(1).minimumScaleFactor(0.7)
            if let sub { Text(sub).font(.caption2).foregroundStyle(.secondary) }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14))
    }
}
