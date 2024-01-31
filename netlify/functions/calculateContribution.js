exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { dob, salary, bonus, currentContributions } = JSON.parse(event.body);
        const currentYear = new Date().getFullYear();
        const birthYear = new Date(dob).getFullYear();
        const age = currentYear - birthYear;

        // Constants for IRS limits and BP specific limits for 2024
        const IRS_LIMIT = 345000; // 401(a) compensation limit
        const PRE_TAX_CONTRIBUTION_LIMIT = 23000; // Pre-tax contribution limit for 2024
        const CATCH_UP_CONTRIBUTION_LIMIT = 7500; // Catch-up contribution for those 50 and older
        const AFTER_TAX_CONTRIBUTION_LIMIT = 21850; // After-tax contribution limit for BP employees
        const EMPLOYER_MATCH = 0.07; // BP's 7% match

        const bonusAmount = salary * (bonus / 100);
        const totalCompensation = salary + bonusAmount;
        const compensationForCalculation = Math.min(totalCompensation, IRS_LIMIT);

        // Adjust for catch-up contributions if over 50
        const totalPreTaxLimit = age >= 50 ? PRE_TAX_CONTRIBUTION_LIMIT + CATCH_UP_CONTRIBUTION_LIMIT : PRE_TAX_CONTRIBUTION_LIMIT;

        // Calculate how much more can be contributed
        const remainingPreTaxContributionLimit = Math.max(0, totalPreTaxLimit - currentContributions);
        const remainingAfterTaxContributionLimit = Math.max(0, AFTER_TAX_CONTRIBUTION_LIMIT - currentContributions);

        // Employer match calculation (not exceeding the compensation limit)
        const employerMatchAmount = Math.min(compensationForCalculation * EMPLOYER_MATCH, IRS_LIMIT);

        // Prepare response
        return {
            statusCode: 200,
            body: JSON.stringify({
                preTaxContributionLimit: remainingPreTaxContributionLimit,
                afterTaxContributionLimit: remainingAfterTaxContributionLimit,
                employerMatchAmount: employerMatchAmount,
                message: "Calculation completed successfully."
            }),
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to process the request" }) };
    }
};
