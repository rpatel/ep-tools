<template>
    <b-collapse class="list-group-item" id="resultsCollapse" v-model="resultsReady">
        <p>For <b>{{results.desiredMutations}} {{results.mutationTypesString.toLowerCase()}}</b> mutations to have
            occurred at an amino acid position, with a mutation rate of
            <b-tooltip target="textMutationRate" :disabled="results.generationsPerYear === null">{{results.generationsPerYear}} generations / year</b-tooltip>
            <b id="textMutationRate">{{results.mutationRate}} mutations / bp /
                {{results.generationsPerYear === null ? 'year' : 'generation'}}</b> using a <b>"{{results.codonTableName}}"
                genetic code</b>, the total time span of the tree would need to be &ge;
            <b-tooltip target="textRequiredTime">{{numeral(results.requiredTime).format('0,0.[000]')}} years</b-tooltip>
            <b class="text-primary" id="textRequiredTime">{{numeral(results.requiredTime).format('0.0[00]a')}}yrs</b>
        </p>
    </b-collapse>
</template>

<script>

    import numeral from 'numeral';

    export default {
        props: ['results', 'resultsReady'],

        created() {
            this.numeral = numeral;
        }
    }
</script>