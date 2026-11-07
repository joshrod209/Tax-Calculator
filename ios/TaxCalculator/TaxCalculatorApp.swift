import SwiftUI

@main
struct TaxCalculatorApp: App {
    @State private var model = CalculatorModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(model)
        }
    }
}
