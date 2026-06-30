import SwiftUI

/// Pantalla "Hoy": briefing matinal con saludo, agenda, prioridades y próxima cita.
struct HomeBriefingView: View {
    @EnvironmentObject var store: AssistantStore
    @Binding var selection: Int
    @State private var showSettings = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    QuickActions(selection: $selection)

                    if let next = store.nextAppointment {
                        NextAppointmentCard(appointment: next)
                    }

                    if let b = store.todayBriefing,
                       Calendar.current.isDateInToday(b.date) {
                        BriefingContent(briefing: b)
                    } else {
                        emptyBriefing
                    }
                }
                .padding()
            }
            .navigationTitle("Hoy")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    NavigationLink {
                        NotesView()
                    } label: { Image(systemName: "note.text") }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await store.generateBriefing() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(store.isBusy)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showSettings = true } label: { Image(systemName: "gearshape") }
                }
            }
            .overlay { if store.isBusy { ProgressView().controlSize(.large) } }
            .sheet(isPresented: $showSettings) { SettingsView() }
        }
    }

    private struct QuickActions: View {
        @Binding var selection: Int
        private let cols = Array(repeating: GridItem(.flexible(), spacing: 10), count: 4)

        var body: some View {
            LazyVGrid(columns: cols, spacing: 10) {
                tile("Grabar", "mic.fill", .red, 3)
                tile("Correo", "envelope.fill", .blue, 1)
                tile("Asesor", "brain.head.profile", .indigo, 2)
                tile("Empresa", "building.2.fill", .teal, 4)
            }
        }

        private func tile(_ title: String, _ icon: String, _ color: Color, _ tab: Int) -> some View {
            Button { selection = tab } label: {
                VStack(spacing: 6) {
                    Image(systemName: icon).font(.title2).foregroundStyle(color)
                    Text(title).font(.caption2).foregroundStyle(.primary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14))
            }
            .buttonStyle(.plain)
        }
    }

    private var emptyBriefing: some View {
        VStack(spacing: 12) {
            Image(systemName: "sunrise.fill").font(.largeTitle).foregroundStyle(.orange)
            Text("Tu briefing de hoy aún no está listo").font(.headline)
            Text("Atlas reunirá tu agenda y tus acciones pendientes en un resumen.")
                .font(.subheadline).foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Generar briefing") { Task { await store.generateBriefing() } }
                .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
}

private struct BriefingContent: View {
    let briefing: DailyBriefing
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(briefing.greeting).font(.title2.bold())
            Text(briefing.agendaSummary).foregroundStyle(.secondary)

            Section {
                ForEach(Array(briefing.priorities.enumerated()), id: \.offset) { i, p in
                    Label(p, systemImage: "\(i + 1).circle.fill")
                }
            } header: { sectionHeader("Prioridades de hoy") }

            if !briefing.openActionItems.isEmpty {
                Section {
                    ForEach(briefing.openActionItems, id: \.self) { a in
                        Label(a, systemImage: "checkmark.circle")
                    }
                } header: { sectionHeader("Acciones pendientes") }
            }

            if let note = briefing.marketOrStrategicNote, !note.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    sectionHeader("Apunte estratégico")
                    Text(note).font(.callout)
                }
                .padding()
                .background(Color.indigo.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    private func sectionHeader(_ t: String) -> some View {
        Text(t).font(.headline).padding(.top, 4)
    }
}

struct NextAppointmentCard: View {
    let appointment: Appointment
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Próxima cita", systemImage: "clock.fill")
                .font(.caption).foregroundStyle(.white.opacity(0.85))
            Text(appointment.title).font(.title3.bold()).foregroundStyle(.white)
            HStack {
                Text(appointment.startDate, style: .time)
                if appointment.minutesUntilStart < 120 {
                    Text("· en \(appointment.minutesUntilStart) min")
                }
            }
            .font(.subheadline).foregroundStyle(.white.opacity(0.9))
            if let loc = appointment.location {
                Label(loc, systemImage: "mappin.and.ellipse")
                    .font(.caption).foregroundStyle(.white.opacity(0.85))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(
            LinearGradient(colors: [.indigo, .purple],
                           startPoint: .topLeading, endPoint: .bottomTrailing),
            in: RoundedRectangle(cornerRadius: 16))
    }
}
