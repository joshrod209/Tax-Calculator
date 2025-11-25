'use client'

import { useState, useMemo } from 'react';
import { type TaxYear, type FilingStatus } from '@/lib/data';
import { getCurrentTaxYear, getAvailableYears } from '@/lib/utils';
import { calculateTax, type TaxCalculationResult } from '@/lib/tax-calculations';
import { calculateIRAContributionRecommendations } from '@/lib/ira-calculations';

export interface TaxCalculatorInputs {
    year: TaxYear;
    filingStatus: FilingStatus | '';
    grossIncome: number;
    isAge50Plus: boolean;
    isAge65Plus: boolean;
    numDependents: number;
    retirementContributions: number;
    iraContributions: number;
    hsaCoverageType: 'none' | 'selfOnly' | 'family';
    hsaContributions: number;
    healthInsurancePremiums: number;
    fsaContributions: number;
    studentLoanInterest: number;
    educatorExpenses: number;
    isCoveredByEmployerPlan: boolean;
    isSpouseCoveredByEmployerPlan: boolean;
    spouseIraContributions: number;
    spouseRetirementContributions: number;
    isSpouseAge50Plus: boolean;
    isSpouseAge65Plus: boolean;
    isNonDeductibleIRA: boolean;
    isSpouseNonDeductibleIRA: boolean;
}

export interface TaxCalculatorState {
    inputs: TaxCalculatorInputs;
    results: TaxCalculationResult | null;
    iraRecommendations: ReturnType<typeof calculateIRAContributionRecommendations> | null;
    spouseIraRecommendations: ReturnType<typeof calculateIRAContributionRecommendations> | null;
}

const defaultInputs: TaxCalculatorInputs = {
    year: getCurrentTaxYear(),
    filingStatus: '',
    grossIncome: 0,
    isAge50Plus: false,
    isAge65Plus: false,
    numDependents: 0,
    retirementContributions: 0,
    iraContributions: 0,
    hsaCoverageType: 'none',
    hsaContributions: 0,
    healthInsurancePremiums: 0,
    fsaContributions: 0,
    studentLoanInterest: 0,
    educatorExpenses: 0,
    isCoveredByEmployerPlan: false,
    isSpouseCoveredByEmployerPlan: false,
    spouseIraContributions: 0,
    spouseRetirementContributions: 0,
    isSpouseAge50Plus: false,
    isSpouseAge65Plus: false,
    isNonDeductibleIRA: false,
    isSpouseNonDeductibleIRA: false,
};

export function useTaxCalculator() {
    const [inputs, setInputs] = useState<TaxCalculatorInputs>(defaultInputs);

    const results = useMemo<TaxCalculationResult | null>(() => {
        if (!inputs.filingStatus || inputs.grossIncome === 0) {
            return null;
        }

        try {
            return calculateTax(
                inputs.grossIncome,
                inputs.filingStatus,
                inputs.isAge65Plus,
                inputs.numDependents,
                inputs.retirementContributions,
                inputs.iraContributions,
                inputs.hsaCoverageType,
                inputs.hsaContributions,
                inputs.healthInsurancePremiums,
                inputs.fsaContributions,
                inputs.studentLoanInterest,
                inputs.educatorExpenses,
                inputs.year,
                inputs.isAge50Plus,
                inputs.isCoveredByEmployerPlan,
                inputs.isSpouseCoveredByEmployerPlan,
                inputs.spouseIraContributions,
                inputs.spouseRetirementContributions,
                inputs.isSpouseAge50Plus,
                inputs.isSpouseAge65Plus,
                inputs.isNonDeductibleIRA,
                inputs.isSpouseNonDeductibleIRA
            );
        } catch (error) {
            console.error('Tax calculation error:', error);
            return null;
        }
    }, [inputs]);

    const iraRecommendations = useMemo(() => {
        if (!results || !inputs.filingStatus) return null;

        const isEligibleForCatchUp = inputs.isAge50Plus || inputs.isAge65Plus;
        
        return calculateIRAContributionRecommendations(
            results.magi,
            inputs.filingStatus,
            inputs.isCoveredByEmployerPlan,
            inputs.isSpouseCoveredByEmployerPlan,
            inputs.year,
            isEligibleForCatchUp,
            inputs.iraContributions
        );
    }, [results, inputs]);

    const spouseIraRecommendations = useMemo(() => {
        if (!results || inputs.filingStatus !== 'marriedJointly') return null;

        const isSpouseEligibleForCatchUp = inputs.isSpouseAge50Plus || inputs.isSpouseAge65Plus;
        
        return calculateIRAContributionRecommendations(
            results.magi,
            inputs.filingStatus,
            inputs.isSpouseCoveredByEmployerPlan,
            inputs.isCoveredByEmployerPlan,
            inputs.year,
            isSpouseEligibleForCatchUp,
            inputs.spouseIraContributions
        );
    }, [results, inputs]);

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

