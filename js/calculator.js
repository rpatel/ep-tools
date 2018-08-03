function calculate_required_ets(
    requiredChanges,
    mutationRatePerSiteYear,
    codonPositionMutationProbs
) {

    let mutationProbability = 1 - Math.exp(-1 * mutationRatePerSiteYear);

    let prNoMissense = 1;
    _.each(_.range(3), (codon_pos) => {
        prNoMissense *=                                                          // Probability of NO expected change due to mutation at codon_pos =
            (1 - mutationProbability) +                                          // Probability of NO mutation at all, OR (+)
            (mutationProbability * (1 - codonPositionMutationProbs[codon_pos]))  // Probability of non-expected mutation (e.g., synonymous)
    });

    let prAtLeastOneMissense = 1 - prNoMissense;
    let requiredTime = requiredChanges / prAtLeastOneMissense;

    return (prAtLeastOneMissense, requiredTime);
}