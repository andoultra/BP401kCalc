exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const data = JSON.parse(event.body);
    const { dob, salary, bonus, currentPreTax, currentAfterTax } = data; // Added current contributions
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(dob).getFullYear();
    const age = currentYear - birthYear;

    // Constants (consider moving these to environment variables or a config file)
    const IRS_LIMIT = 345000;
    const PRE_TAX_CONTRIBUTION_LIMIT = 23000;
    const CATCH_UP_CONTRIBUTION_LIMIT = 7500;
    const AFTER_TAX_CONTRIBUTION_LIMIT = 21850;
    const EMPLOYER_MATCH = 0.07;

    const bonusAmount = salary * (bonus / 100);
    const totalCompensation = salary + bonusAmount;
    const compensationForCalculation = Math.min(totalCompensation, IRS_LIMIT);

    let adjustedPreTaxContributionLimit = PRE_TAX_CONTRIBUTION_LIMIT + (age >= 50 ? CATCH_UP_CONTRIBUTION_LIMIT : 0);

    // Deduct current contributions from the limits
    adjustedPreTaxContributionLimit -= currentPreTax;
    const adjustedAfterTaxContributionLimit = AFTER_TAX_CONTRIBUTION_LIMIT - currentAfterTax;

    // Ensure limits are not negative after deduction
    adjustedPreTaxContributionLimit = Math.max(0, adjustedPreTaxContributionLimit);
    const remainingAfterTaxContributionLimit = Math.max(0, adjustedAfterTaxContributionLimit);

    const employerMatchAmount = compensationForCalculation * EMPLOYER_MATCH;

    // Adjust calculations to only consider remaining allowable contributions
    const electivePreTaxDeferralAmount = Math.min(compensationForCalculation * (adjustedPreTaxContributionLimit / compensationForCalculation), adjustedPreTaxContributionLimit);
    const electiveAfterTaxDeferralAmount = Math.min(compensationForCalculation * (remainingAfterTaxContributionLimit / compensationForCalculation), remainingAfterTaxContributionLimit);

    // Calculate total 401(k) contribution amount considering current contributions
    const total401kContributionAmount = employerMatchAmount + currentPreTax + currentAfterTax + electivePreTaxDeferralAmount + electiveAfterTaxDeferralAmount;

    return {
        statusCode: 200,
        body: JSON.stringify({
            preTaxContributionPercentage: ((electivePreTaxDeferralAmount / compensationForCalculation) * 100).toFixed(2),
            afterTaxContributionPercentage: ((electiveAfterTaxDeferralAmount / compensationForCalculation) * 100).toFixed(2),
            employerMatchAmount: employerMatchAmount.toFixed(2),
            electivePreTaxDeferralAmount: electivePreTaxDeferralAmount.toFixed(2),
            electiveAfterTaxDeferralAmount: electiveAfterTaxDeferralAmount.toFixed(2),
            total401kContributionAmount: total401kContributionAmount.toFixed(2),
            // Include current contributions in the response for completeness
            currentPreTaxContribution: currentPreTax,
            currentAfterTaxContribution: currentAfterTax
        }),
    };
};
