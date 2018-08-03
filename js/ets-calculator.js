$(function () {

    // Declare important variables for calculation
    let REQUIRED_CHANGES;
    let MUTATION_RATE_PER_SITE_PER_YEAR;
    let GENERATIONS_PER_YEAR = 1;

    // DEBUG
    $('.advanced-codon-position-row').collapse('toggle');

    //// Initialize
    // Bootstrap requirements, e.g. tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip({'trigger': 'hover'})
    })

    // Load codon tables
    let sortedCodonArray = _.sortBy(codonTableData, ['table_id', 'table_name']);
    $.each(sortedCodonArray, (ix, codonTable) => {
        $('#codonModelSelect')
            .append($('<option>', {'value': ix})
                .text(codonTable.table_name));
    });
    updatePerPositionMutationRates();

    // Set default values, e.g. numRequiredChanges, generationsPerYear
    $('#generationsPerYear').val(1);

    //// Connect on-events
    // Attach event for mutation rate unit change
    $('#mutationRateUnitSelect').change(function () {
        if (this.value === 'perYear')
            $('#generationsPerYearCollapse').collapse('hide');
        else
            $('#generationsPerYearCollapse').collapse('show');
    });

    //// Finally
    // Show mutation model card body
    $('#mutationModelCardBody').collapse('show');
    function updatePerPositionMutationRates() {

    }

    // Helpers
    function updatePerPositionMutationTypeRates() {
        let codonTable = sortedCodonArray[$('#codonModelSelect').val()];

        // Missense
        $.each($('.codon-rate-missense'), (ix, obj) => {
            obj.value = _.round(codonTable.rates.missense[ix], 3);
        });

        // Nonsense
        $.each($('.codon-rate-nonsense'), (ix, obj) => {
            obj.value = _.round(codonTable.rates.nonsense[ix], 3);
        });

        // Missense
        $.each($('.codon-rate-synonymous'), (ix, obj) => {
            obj.value = _.round(codonTable.rates.synonymous[ix], 3);
        });

        updatePerPositionMutationRates();
    }


});