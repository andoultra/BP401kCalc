document.getElementById('contributionForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    fetch('/.netlify/functions/calculateContribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('preTaxPercentage').textContent = data.preTaxContributionPercentage;
        document.getElementById('afterTaxPercentage').textContent = data.afterTaxContributionPercentage;
        document.getElementById('employerMatch').textContent = data.employerMatchAmount;
        document.getElementById('preTaxAmount').textContent = data.electivePreTaxDeferralAmount;
        document.getElementById('afterTaxAmount').textContent = data.electiveAfterTaxDeferralAmount;
        document.getElementById('totalContribution').textContent = data.total401kContributionAmount;
    })
    .catch(error => console.error('Error:', error));
});
