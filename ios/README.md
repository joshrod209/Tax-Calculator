# Tax Calculator for iOS

A native SwiftUI app (iOS 17+) that gives the same federal (and California) tax estimate as the web app.

- `TaxEngine/` is a Swift package that ports `lib/` (`data.ts`, `utils.ts`, `ira-calculations.ts`, `tax-calculations.ts` and `state-tax.ts`). It uses `Double` and does the arithmetic in the same order as the TypeScript, so both engines give the same results down to the float.
- `TaxCalculator/` holds the app: an input form with a live summary bar, and a Results tab that shows take-home pay, the breakdown, credits, IRA eligibility and savings tips.
- `project.yml` is the XcodeGen spec. `TaxCalculator.xcodeproj` is generated from it, so run `xcodegen generate` after you add or remove files.

## Keeping the two engines in sync

`fixtures/tax-cases.json` at the repo root lists shared cases. Both test suites read it:

```bash
npm test                               # TypeScript engine
cd ios/TaxEngine && swift test         # Swift engine (macOS host)
```

To change a tax figure, edit `lib/data.ts` **and** `TaxEngine/Sources/TaxEngine/TaxYearData.swift` (state figures: `lib/state-tax.ts` and `StateTax.swift`), then add or adjust a fixture case.

California's 2026 exemption-credit phase-out thresholds are estimates until FTB publishes them in late December 2026 (they only matter above about $260k income); replace them in both files then.

## Build and run

```bash
cd ios
xcodegen generate
xcodebuild -project TaxCalculator.xcodeproj -scheme TaxCalculator \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test
```

Debug builds accept two launch arguments that make screenshots reproducible:

```bash
xcrun simctl launch booted com.joshrod209.TaxCalculator \
  -prefillInputs '{"year":2026,"filingStatus":"marriedJointly","grossIncome":150000,"numChildren":2}' \
  -initialTab results
```
