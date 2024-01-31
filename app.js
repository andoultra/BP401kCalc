document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('contributionForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission behavior

        // Collecting form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Sending the data to the Netlify function
        fetch('/.netlify/functions/calculateContribution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Displaying the calculated results
            displayResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').textContent = 'Error calculating contributions. Please try again.';
        });
    });

    function displayResults(data) {
        // Assuming the server returns an object with the calculation results
        const resultsDiv = document.getElementById('result');
        resultsDiv.innerHTML = `
            <p>Pre-Tax Contribution Percentage: ${data.preTaxContributionPercentage}%</p>
            <p>After-Tax Contribution Percentage: ${data.afterTaxContributionPercentage}%</p>
            <p>Employer Match Amount: $${data.employerMatchAmount}</p>
            <p>Elective Pre-Tax Deferral Amount: $${data.electivePreTaxDeferralAmount}</p>
            <p>Elective After-Tax Deferral Amount: $${data.electiveAfterTaxDeferralAmount}</p>
            <p>Total 401(k) Contribution Amount: $${data.total401kContributionAmount}</p>
        `;
    }
});
