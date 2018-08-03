$(function () {

    // Declare important variables for calculation
    let REQUIRED_CHANGES;
    let MUTATION_RATE_PER_SITE_PER_YEAR;
    let GENERATIONS_PER_YEAR = 1;

    // DEBUG
    $('.advanced-codon-position-row').collapse('toggle');
    $('#resultsCardBody').collapse('toggle');
    $('#perSiteMutationRateText').val('2e-9');

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
    $('#codonModelSelect')
        .append($('<option>', {'value': 'custom'})
            .text('Custom'));

    //// Connect on-events
    // Attach event for mutation rate unit change
    $('#mutationRateUnitSelect').change(function () {
        if (this.value === 'perYear')
            $('#generationsPerYearCollapse').collapse('hide');
        else
            $('#generationsPerYearCollapse').collapse('show');
    });

    // Codon table change
    $('#codonModelSelect').change(function () {
        if ($(this).val() === 'custom')
            return;

        updatePerPositionMutationTypeRates();
    }).change();

    // Selected mutations change
    $('.mutation-type-check').change(() => {
        updatePerPositionMutationRates();

        let matches = _.filter($('.mutation-type-check'), 'checked');
        if (matches.length === 0)
            $('#mutationTypesText').text('None.');
        else
            $('#mutationTypesText').text(
                combineSubjects(_.map(matches, m => m.value), conj = 'or')
            );
    });

    // Rates changed
    $('.codon-rate')
        .on("change keypress paste", () => {
            console.log('here');
            $('#codonModelSelect option[value="custom"]').prop("selected", true);
        })
        .on("focusout", () => updatePerPositionMutationRates());

    // Click calculate
    $('#calculateButton').click((event) => {
        event.preventDefault();
        runCalculation();
    });

    // Set default values, e.g. numRequiredChanges, generationsPerYear
    $('#generationsPerYearText').val(1);
    $('#missenseTypeCheck').prop('checked', true).change();
    $('#requiredMutationsText').val(20);

    //// Finally
    // Show mutation model card body
    $('#mutationModelCardBody').collapse('show');

    // Helpers
    function updatePerPositionMutationRates() {
        let missenseRates = $('.codon-rate-missense');
        let nonsenseRates = $('.codon-rate-nonsense');
        let synonymousRates = $('.codon-rate-synonymous');
        let totalRates = $('.codon-rate-total');

        for (let pos = 0; pos < 3; pos++) {
            let pos_sum = 0.0;

            if ($('#missenseTypeCheck').prop('checked'))
                pos_sum += Number(missenseRates[pos].value);

            if ($('#nonsenseTypeCheck').prop('checked'))
                pos_sum += Number(nonsenseRates[pos].value);

            if ($('#synonymousTypeCheck').prop('checked'))
                pos_sum += Number(synonymousRates[pos].value);

            totalRates[pos].value = _.round(pos_sum, 3);
        }
    }


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

    function combineSubjects(arr, conj = 'and') {
        return arr.slice(0, -2).join(', ') +
            (arr.slice(0, -2).length ? ', ' : '') +
            arr.slice(-2).join(' ' + conj + ' ');
    }

    function runCalculation() {
        // Do validation in here at some point.
        let requiredChanges = Number($('#requiredMutationsText').val());
        let mutationRatePerSiteYear = Number($('#perSiteMutationRateText').val()) *
            ($('#mutationRateUnitSelect').val() === "perGeneration" ? Number($('#generationsPerYearText').val()) : 1);
        let codonPositionMutationProbs = _.map($('.codon-rate-total'), obj => Number(obj.value));

        let prMutation, requiredTime = calculate_required_ets(
            requiredChanges,
            mutationRatePerSiteYear,
            codonPositionMutationProbs
        );

        let resultString =
            'For <b>' + Number(requiredChanges) + ' ' + $('#mutationTypesText').text().toLowerCase() + '</b> mutations to have occurred' +
            ' at a amino acid position with a mutation rate of <b' +
            ($('#mutationRateUnitSelect').val() === "perGeneration" ? ' title="' + $('#generationsPerYearText').val()  + ' generation(s) / year"' : '') + '>' +
            $('#perSiteMutationRateText').val() + ' ' + $('#mutationRateUnitSelect option:selected').text() + '</b>' +
            ' using a "<b>' + $('#codonModelSelect option:selected').text() + '" codon table</b>' +
            ', the total time span of the tree would need to be &ge; <b class="text-primary" title="' + requiredTime + '">' +
            numeral(requiredTime).format('0.0[00]a') + 'yrs</b>.';

        $('#resultsCardBody').empty().append($('<p>').html(resultString));
    }


});