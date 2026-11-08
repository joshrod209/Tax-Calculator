'use client'

import { useState, useMemo } from 'react';
import { type FilingStatus } from '@/lib/data';
import { getCurrentTaxYear, getAvailableYears } from '@/lib/utils';
import {
    calculateTax,
    estimateTaxSavings,
    type TaxCalculationResult,
    type TaxInputs
} from '@/lib/tax-calculations';
import { calculateIRAContributionRecommendations } from '@/lib/ira-calculations';

export interface TaxCalculatorInputs extends Omit<TaxInputs, 'filingStatus'> {
    filingStatus: FilingStatus | '';
}

type IRARecommendation = ReturnType<typeof calculateIRAContributionRecommendations> & {
    /** Tax saved by putting recommendedTrad in a Traditional IRA instead of nothing */
    estimatedTaxSavings: number;
};

export interface TaxCalculatorState {
    inputs: TaxCalculatorInputs;
    results: TaxCalculationResult | null;
    iraRecommendations: IRARecommendation | null;
    spouseIraRecommendations: IRARecommendation | null;
}

const defaultInputs: TaxCalculatorInputs = {
    year: getCurrentTaxYear(),
    filingStatus: '',
    grossIncome: 0,
    spouseWages: 0,
    isAge50Plus: false,
    isAge65Plus: false,
    isSpouseAge50Plus: false,
    isSpouseAge65Plus: false,
    numChildren: 0,
    numOtherDependents: 0,
    retirementContributions: 0,
    spouseRetirementContributions: 0,
    iraContributions: 0,
    spouseIraContributions: 0,
    isNonDeductibleIRA: false,
    isSpouseNonDeductibleIRA: false,
    hsaCoverageType: 'none',
    hsaContributions: 0,
    healthInsurancePremiums: 0,
    fsaContributions: 0,
    studentLoanInterest: 0,
    educatorExpenses: 0,
    isCoveredByEmployerPlan: false,
    isSpouseCoveredByEmployerPlan: false,
};

export function useTaxCalculator() {
    const [inputs, setInputs] = useState<TaxCalculatorInputs>(defaultInputs);

    const taxInputs = useMemo<TaxInputs | null>(() => {
        if (!inputs.filingStatus || inputs.grossIncome === 0) return null;
        return { ...inputs, filingStatus: inputs.filingStatus };
    }, [inputs]);

    const results = useMemo<TaxCalculationResult | null>(() => {
        if (!taxInputs) return null;
        try {
            return calculateTax(taxInputs);
        } catch (error) {
            console.error('Tax calculation error:', error);
            return null;
        }
    }, [taxInputs]);

    const iraRecommendations = useMemo<IRARecommendation | null>(() => {
        if (!results || !taxInputs) return null;

        const rec = calculateIRAContributionRecommendations(
            results.magi,
            taxInputs.filingStatus,
            taxInputs.isCoveredByEmployerPlan,
            taxInputs.isSpouseCoveredByEmployerPlan,
            taxInputs.year,
            taxInputs.isAge50Plus || taxInputs.isAge65Plus,
            taxInputs.iraContributions
        );
        const savings = estimateTaxSavings({ ...taxInputs, iraContributions: 0 }, 0, rec.recommendedTrad);
        return { ...rec, estimatedTaxSavings: savings.taxSavings };
    }, [results, taxInputs]);

    const spouseIraRecommendations = useMemo<IRARecommendation | null>(() => {
        if (!results || !taxInputs || taxInputs.filingStatus !== 'marriedJointly') return null;

        const rec = calculateIRAContributionRecommendations(
            results.magi,
            taxInputs.filingStatus,
            taxInputs.isSpouseCoveredByEmployerPlan,
            taxInputs.isCoveredByEmployerPlan,
            taxInputs.year,
            taxInputs.isSpouseAge50Plus || taxInputs.isSpouseAge65Plus,
            taxInputs.spouseIraContributions
        );
        const savings = estimateTaxSavings({ ...taxInputs, spouseIraContributions: 0 }, 0, 0, rec.recommendedTrad);
        return { ...rec, estimatedTaxSavings: savings.taxSavings };
    }, [results, taxInputs]);

    const updateInput = <K extends keyof TaxCalculatorInputs>(
        key: K,
        value: TaxCalculatorInputs[K]
    ) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const resetInputs = () => {
        setInputs(defaultInputs);
    };

    return {
        inputs,
        results,
        iraRecommendations,
        spouseIraRecommendations,
        updateInput,
        resetInputs,
        availableYears: getAvailableYears(),
    };
}
