<template>
    <b-container class="my-2">
        <b-card no-body>
            <h6 slot="header" class="mb-0">Mutation Parameters</h6>
            <b-list-group flush>
                    <parameter-input-component/>
                    <results-output-component/>
            </b-list-group>
        </b-card>
    </b-container>
</template>

<script>
    import ParameterInputComponent from './ParameterInputComponent.vue';
    import ResultsOutputComponent from './ResultsOutputComponent.vue';

    export default {
        components: {
            ParameterInputComponent,
            ResultsOutputComponent
        },
    }
</script>