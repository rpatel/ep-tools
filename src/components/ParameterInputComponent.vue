<template>
    <b-collapse v-model="doneLoading" id="collapseParameters">
        <b-list-group-item>
            <b-form-group id="formGroupDesiredMutations"
                          horizontal
                          :label-cols="3"
                          breakpoint="md"
                          label="Desired number of mutations"
                          label-for="inputDesiredMutations">
                <b-form-input id="inputDesiredMutations"
                              v-model.number="$v.desiredMutations.$model"
                              placeholder=">0"
                              min="0"
                              :state="($v.desiredMutations.$invalid && $v.desiredMutations.$dirty) ? false : null"/>
                <b-form-invalid-feedback>Must be a number >0</b-form-invalid-feedback>

            </b-form-group>

            <b-form-group id="formGroupMutationRate"
                          horizontal
                          :label-cols="3"
                          breakpoint="md"
                          label="Point Mutation Rate"
                          label-for="inputMutationRate">
                <b-input-group>
                    <b-form-input id="inputMutationRate"
                                  v-model.number="$v.mutationRate.$model"
                                  placeholder="e.g., 2.5e-9, 0.0000314"
                                  :state="($v.mutationRate.$invalid && $v.mutationRate.$dirty) ? false : null"/>
                    <b-form-select v-model="isRatePerGeneration" style="max-width: 250px"
                                   @change="!isRatePerGeneration ? $v.generationsPerYear.$reset() : null">
                        <option :value="false">mutations / bp / year</option>
                        <option :value="true">mutations / bp / generation</option>
                    </b-form-select>
                    <b-form-invalid-feedback>Must be number >0</b-form-invalid-feedback>

                </b-input-group>
            </b-form-group>

            <b-collapse v-model="isRatePerGeneration" id="collapseGenerationsPerYear">
                <b-form-group id="formGroupGenerationsPerYear"
                              horizontal
                              :label-cols="3"
                              breakpoint="md"
                              label="Generations / year"
                              label-for="inputGenerationsPerYear">
                    <b-form-input id="inputGenerationsPerYear"
                                  v-model="$v.generationsPerYear.$model"
                                  :state="($v.generationsPerYear.$invalid && $v.generationsPerYear.$dirty) ? false : null"/>
                    <b-form-invalid-feedback>Must be number >0</b-form-invalid-feedback>
                </b-form-group>
            </b-collapse>

            <b-form-group id="formGroupGeneticCode"
                          horizontal
                          :label-cols="3"
                          breakpoint="md"
                          label="Genetic Code"
                          label-form="selectGeneticCode">
                <b-form-select v-model="codonTableIndex" :options="codonTableOptions">
                    <option value="custom">Custom</option>
                </b-form-select>
            </b-form-group>

            <b-row class="table-responsive-md mx-0 px-0">
                <table class="table">
                    <thead>
                    <tr>
                        <th>
                            <b-button size="sm" variant="outline-warning"
                                      v-b-tooltip.hover
                                      title="Customize per-site mutation probabilities"
                                      @click="showAdvanced = !showAdvanced">
                                Advanced
                            </b-button>
                        </th>
                        <th scope="col">Codon Position 1</th>
                        <th scope="col">Codon Position 2</th>
                        <th scope="col">Codon Position 3</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th scope="row" class="align-middle">
                            Fraction of Expected Mutations<br/>
                            <small>{{mutationTypesString}}</small>
                        </th>
                        <td v-for="codonPosition in [0,1,2]">
                            <b-form-input v-model="$v.totalRates.$model[codonPosition]"
                                          v-b-tooltip.hover
                                          :title="totalRates[codonPosition] !== '--' ? numeral(totalRates[codonPosition]).format('0.[000]%') : ''"
                                          readonly
                                          :state="$v.totalRates.$each[codonPosition].$invalid ? false : null"/>
                            <b-form-invalid-feedback>Must be between 0 and 1.</b-form-invalid-feedback>
                        </td>

                    </tr>
                    </tbody>
                    <tbody v-show="showAdvanced">
                    <tr v-for="mutationType in ['missense', 'nonsense', 'synonymous']">
                        <td class="align-middle">
                            <b-form-checkbox
                                    v-model="$data[mutationType + 'Checked']">
                                {{mutationType | capitalize}} Rate
                            </b-form-checkbox>
                        </td>
                        <td v-for="codonPosition in [0,1,2]">
                            <b-form-input
                                    type="text"
                                    min="0"
                                    v-model.number="$v[mutationType+'RatePerPosition'].$model[codonPosition]"
                                    @change="codonTableIndex='custom'"
                                    :state="($v[mutationType+'RatePerPosition'].$each[codonPosition].$invalid || false) ? false : null"/>
                            <b-form-invalid-feedback>Must be between 0 and 1.</b-form-invalid-feedback>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </b-row>
            <div class="row float-right">
                <span v-b-tooltip.hover
                      :disabled="!$v.$invalid"
                      title="Please check that all parameter values are valid.">
                <b-button :variant="$v.$invalid ? 'outline-success' : 'success'"
                          @click="() => $v.$invalid ? $v.$touch() : null">Calculate
                </b-button>
                </span>
            </div>
        </b-list-group-item>
    </b-collapse>
</template>

<script>
    import {debounce, forEach, range, round, sortBy} from 'lodash';
    import numeral from 'numeral';

    import {validationMixin} from 'vuelidate';
    import {between, decimal, required} from 'vuelidate/lib/validators';

    import {CodonTablesData} from '../data/codon-tables-data';


    export default {
        data: function () {
            return {
                doneLoading: false,
                showAdvanced: false,

                isRatePerGeneration: false,
                desiredMutations: null,
                mutationRate: null,
                generationsPerYear: 1,

                missenseChecked: true,
                nonsenseChecked: false,
                synonymousChecked: false,

                codonTableIndex: -1,
                codonTableOptions: [],

                totalRates: ['--', '--', '--'],
                missenseRatePerPosition: [null, null, null],
                nonsenseRatePerPosition: [null, null, null],
                synonymousRatePerPosition: [null, null, null]
            }
        },

        mixins: [validationMixin],

        validations() {
            let validations = {
                desiredMutations: {
                    required,
                    decimal,
                    greaterThan: (value) => value > 0
                },
                mutationRate: {
                    required,
                    greaterThan: (value) => value > 0
                },
                totalRates: {
                    $each: {
                        between: between(0, 1)
                    }
                },
            };

            if (this.isRatePerGeneration)
                validations.generationsPerYear = {
                    required,
                    greaterThan: (value) => value > 0
                };
            else
                validations.generationsPerYear = {blank: () => true};

            ['missense', 'nonsense', 'synonymous'].forEach(function (mutationType) {
                if (this[mutationType + 'Checked'])
                    validations[mutationType + 'RatePerPosition'] = {
                        $each: {
                            required,
                            decimal,
                            between: between(0, 1)
                        }
                    };
                else
                    validations[mutationType + 'RatePerPosition'] = {$each: {blank: () => true}};
            }.bind(this));

            return validations;
        },

        computed: {
            mutationTypesString: function () {
                let mutationTypes = [
                    this.missenseChecked ? 'Missense' : null,
                    this.nonsenseChecked ? 'Nonsense' : null,
                    this.synonymousChecked ? 'Synonymous' : null
                ].filter(mutationType => mutationType !== null);

                return mutationTypes.slice(0, -2).join(', ') +
                    (mutationTypes.slice(0, -2).length ? ', ' : '') +
                    mutationTypes.slice(-2).join(' or ');
            }
        },

        watch: {
            codonTableIndex: function (newCodonTableIndex, oldCodonTableIndex) {
                if (this.codonTableIndex === 'custom')
                    return;

                let codonTable = this.sortedCodonArray[newCodonTableIndex];

                this.missenseRatePerPosition = codonTable.rates.missense
                    .map(val => round(val, 3));
                this.nonsenseRatePerPosition = codonTable.rates.nonsense
                    .map(val => round(val, 3));
                this.synonymousRatePerPosition = codonTable.rates.synonymous
                    .map(val => round(val, 3));
            },

            missenseRatePerPosition: function (newVal, oldVal) {
                this.debounceCalculateTotalRate()
            },
            nonsenseRatePerPosition: function (newVal, oldVal) {
                this.debounceCalculateTotalRate()
            },
            synonymousRatePerPosition: function (newVal, oldVal) {
                this.debounceCalculateTotalRate()
            },

            nonsenseChecked: function (newVal, oldVal) {
                this.calculateTotalRate()
            },
            missenseChecked: function (newVal, oldVal) {
                this.calculateTotalRate()
            },
            synonymousChecked: function (newVal, oldVal) {
                this.calculateTotalRate()
            },
        },

        methods: {
            loadCodonTables: function () {
                forEach(this.sortedCodonArray, (codonTable, ix) => {
                    this.codonTableOptions.push({
                        value: ix,
                        text: codonTable.table_name
                    })
                });

                this.codonTableIndex = 0;
                this.calculateTotalRate();

                setTimeout(() => {
                    this.doneLoading = true
                }, 500);
            },

            calculateTotalRate: function () {
                let totalRates = [];
                try {
                    forEach(range(3), (codonPosition) => {
                        let sum = 0;
                        if (this.missenseChecked)
                            sum += this.missenseRatePerPosition[codonPosition];
                        if (this.nonsenseChecked)
                            sum += this.nonsenseRatePerPosition[codonPosition];
                        if (this.synonymousChecked)
                            sum += this.synonymousRatePerPosition[codonPosition];
                        totalRates.push(round(sum, 3));
                    });
                } catch (err) {
                    totalRates = ['--', '--', '--'];
                }
                this.totalRates = totalRates;
            },
        }
        ,

        created: function () {
            // Set default values (e.g. if debug)
            this.desiredMutations = 20;
            // this.mutationRate = '2e-9';
            //

            this.numeral = numeral;

            this.debounceCalculateTotalRate = debounce(this.calculateTotalRate, 500);

            this.sortedCodonArray = sortBy(CodonTablesData, ['table_id', 'table_name']);

            this.loadCodonTables();
        }
        ,

        filters: {
            capitalize: function (value) {
                if (!value) return ''
                value = value.toString()
                return value.charAt(0).toUpperCase() + value.slice(1)
            }
        }
    }
</script>