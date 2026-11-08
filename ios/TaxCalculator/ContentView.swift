import SwiftUI
import TaxEngine

struct ContentView: View {
    enum Tab: Hashable { case inputs, results }

    @Environment(CalculatorModel.self) private var model
    @State private var tab: Tab = {
        #if DEBUG
        // Screenshot helper: `-initialTab results`
        if UserDefaults.standard.string(forKey: "initialTab") == "results" { return .results }
        #endif
        return .inputs
    }()

    var body: some View {
        TabView(selection: $tab) {
            NavigationStack {
                InputFormView()
                    .navigationTitle("Tax Calculator")
                    .safeAreaInset(edge: .bottom) {
                        if let result = model.result {
                            LiveSummaryBar(result: result) { tab = .results }
                        }
                    }
                    .toolbar {
                        ToolbarItemGroup(placement: .keyboard) {
                            Spacer()
                            Button("Done") {
                                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                            }
                        }
                    }
            }
            .tabItem { Label("Calculator", systemImage: "square.and.pencil") }
            .tag(Tab.inputs)

            NavigationStack {
                ResultsView()
                    .navigationTitle("Results")
            }
            .tabItem { Label("Results", systemImage: "chart.pie") }
            .tag(Tab.results)
        }
    }
}

/// Pinned above the tab bar while editing, so the estimate is visible as you type.
struct LiveSummaryBar: View {
    let result: TaxCalculationResult
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Take-Home").font(.caption).foregroundStyle(.white.opacity(0.75))
                    Text(formatMoney(result.takeHomePay)).font(.headline).monospacedDigit()
                        .contentTransition(.numericText())
                        .accessibilityIdentifier("summaryTakeHome")
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(result.netIncomeTax < 0 ? "Refund" : "Income Tax").font(.caption).foregroundStyle(.white.opacity(0.75))
                    Text(formatMoney(abs(result.netIncomeTax))).font(.headline).monospacedDigit()
                        .contentTransition(.numericText())
                        .accessibilityIdentifier("summaryTax")
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text("Effective").font(.caption).foregroundStyle(.white.opacity(0.75))
                    Text(formatPercentage(result.effectiveRate)).font(.headline).monospacedDigit()
                }
                Spacer()
                Image(systemName: "chevron.right").font(.subheadline.bold())
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 18)
            .padding(.vertical, 12)
            .background(Color.brand, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .padding(.horizontal)
            .padding(.bottom, 6)
            .animation(.snappy, value: result.takeHomePay)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Take-home \(formatMoney(result.takeHomePay)), income tax \(result.netIncomeTax < 0 ? "refund" : "owed") \(formatMoney(abs(result.netIncomeTax))). Show results.")
    }
}

#Preview {
    ContentView().environment(CalculatorModel())
}
