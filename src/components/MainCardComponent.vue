<template>
    <b-container class="my-2">
        <b-card no-body>
            <h6 slot="header" class="mb-0">Mutation Parameters</h6>
            <b-list-group flush>
                <parameter-input-component @result-ready="updateResults"/>
                <results-output-component :resultsReady="resultsReady" :results="results"/>
            </b-list-group>
        </b-card>
    </b-container>
</template>

<script>
    import ParameterInputComponent from './ParameterInputComponent.vue';
    import ResultsOutputComponent from './ResultsOutputComponent.vue';

    export default {
        data: function () {
            return {
                resultsReady: false,
                results: {
                    desiredMutations: null,
                    mutationRate: null,
                    generationsPerYear: null,
                    codonTableName: null,
                    requiredTime: null,
                    mutationTypesString: null,
                }
            }
        },

        components: {
            ParameterInputComponent,
            ResultsOutputComponent
        },

        methods: {
            updateResults(results) {
                this.results = results;
                this.resultsReady = true;
            }
        },
    }
</script>