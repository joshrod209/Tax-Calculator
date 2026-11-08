import SwiftUI
import TaxEngine

/// Dollar amount field that updates its binding on every keystroke, so results stay live.
struct CurrencyField: View {
    let title: String
    @Binding var value: Double
    var caption: String?
    var accessibilityID: String?

    @State private var text = ""
    @FocusState private var isFocused: Bool

    private static let formatter: NumberFormatter = {
        let f = NumberFormatter()
        f.locale = Locale(identifier: "en_US")
        f.numberStyle = .decimal
        f.maximumFractionDigits = 2
        return f
    }()

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(title)
                Spacer(minLength: 12)
                HStack(spacing: 2) {
                    Text("$").foregroundStyle(.secondary)
                    TextField("0", text: $text)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .focused($isFocused)
                        .frame(minWidth: 90)
                        .fixedSize(horizontal: true, vertical: false)
                        .accessibilityIdentifier(accessibilityID ?? title)
                        .accessibilityLabel(title)
                }
                .font(.body.monospacedDigit())
            }
            if let caption {
                Text(caption)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture { isFocused = true }
        .onAppear { text = Self.display(value) }
        .onChange(of: text) { _, newText in
            let parsed = Self.parse(newText)
            if parsed != value { value = parsed }
        }
        .onChange(of: value) { _, newValue in
            // Value changed from outside (clamped to a limit, or reset)
            if Self.parse(text) != newValue { text = Self.display(newValue) }
        }
        .onChange(of: isFocused) { _, focused in
            if !focused { text = Self.display(value) }
        }
    }

    static func parse(_ text: String) -> Double {
        let cleaned = text.filter { $0.isNumber || $0 == "." }
        return max(0, Double(cleaned) ?? 0)
    }

    static func display(_ value: Double) -> String {
        value == 0 ? "" : (formatter.string(from: NSNumber(value: value)) ?? "")
    }
}

/// Label + value row used throughout the results.
struct AmountRow: View {
    let label: String
    let value: String
    var emphasized = false
    var valueColor: Color = .primary

    var body: some View {
        HStack {
            Text(label)
                .fontWeight(emphasized ? .semibold : .regular)
                .foregroundStyle(emphasized ? .primary : .secondary)
            Spacer()
            Text(value)
                .fontWeight(emphasized ? .bold : .semibold)
                .foregroundStyle(valueColor)
                .monospacedDigit()
        }
        .accessibilityElement(children: .combine)
    }
}

/// Rounded card container for the results screen.
struct Card<Content: View>: View {
    let title: String
    let systemImage: String
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Label(title, systemImage: systemImage)
                .font(.caption.weight(.bold))
                .textCase(.uppercase)
                .foregroundStyle(.secondary)
            content
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

/// Tinted call-out used for recommendations and tips.
struct Callout<Content: View>: View {
    var tint: Color = .indigo
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 6) { content }
            .font(.subheadline)
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

extension Color {
    static let brand = Color(red: 0.19, green: 0.18, blue: 0.51) // indigo-900, as on the web
}
