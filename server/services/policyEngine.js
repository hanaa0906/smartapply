/**
 * Admission Policy Simulator Engine
 * Models what-if committee decisions: seat capacity changes, cutoff tweaks, deadline extensions.
 */

const simulatePolicyScenario = async (CourseModel, ApplicationModel, { courseId, simulatedSeats, simulatedCutoff, deadlineExtensionDays }) => {
  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const existingApplications = await ApplicationModel.find({ courseId });
  const currentTotalSeats = course.totalSeats;
  const currentCutoff = course.eligibilityCriteria?.minTwelfthPercentage || 60;

  const targetSeats = Number(simulatedSeats || currentTotalSeats);
  const targetCutoff = Number(simulatedCutoff || currentCutoff);
  const extensionDays = Number(deadlineExtensionDays || 0);

  // Filter eligible applications under current vs simulated criteria
  const currentlyEligible = existingApplications.filter(a => (a.academicSnapshot?.twelfthPercentage || 0) >= currentCutoff);
  const simulatedEligible = existingApplications.filter(a => (a.academicSnapshot?.twelfthPercentage || 0) >= targetCutoff);

  // Project additional demand based on cutoff drop or deadline extension
  const cutoffDiff = currentCutoff - targetCutoff;
  const demandMultiplier = 1 + (cutoffDiff > 0 ? (cutoffDiff * 0.04) : (cutoffDiff * 0.03)) + (extensionDays * 0.015);
  const projectedApplicants = Math.round(existingApplications.length * demandMultiplier);

  const projectedEligibleCount = Math.round(simulatedEligible.length * (demandMultiplier > 1 ? demandMultiplier : 1));
  const projectedAdmits = Math.min(targetSeats, projectedEligibleCount);
  const projectedWaitlist = Math.max(0, projectedEligibleCount - targetSeats);
  const capacityUtilization = targetSeats > 0 ? Math.min(100, Math.round((projectedAdmits / targetSeats) * 100)) : 0;
  const competitionIndex = targetSeats > 0 ? Number((projectedApplicants / targetSeats).toFixed(2)) : 0;

  return {
    courseName: course.name,
    baseline: {
      totalSeats: currentTotalSeats,
      cutoff: currentCutoff,
      currentApplications: existingApplications.length,
      currentEligible: currentlyEligible.length
    },
    simulated: {
      totalSeats: targetSeats,
      cutoff: targetCutoff,
      deadlineExtensionDays: extensionDays,
      projectedApplicants,
      projectedAdmits,
      projectedWaitlist,
      capacityUtilization,
      competitionIndex
    },
    insights: [
      cutoffDiff > 0
        ? `Lowering cutoff by ${cutoffDiff}% expands qualified pool by ~${Math.round(cutoffDiff * 4)}%.`
        : cutoffDiff < 0
        ? `Raising cutoff by ${Math.abs(cutoffDiff)}% increases academic selectivity and reduces pool.`
        : 'Cutoff remained unchanged.',
      targetSeats > currentTotalSeats
        ? `Adding ${targetSeats - currentTotalSeats} seats reduces waitlist pressure.`
        : targetSeats < currentTotalSeats
        ? `Seat reduction increases competition index to ${competitionIndex}x.`
        : 'Seat capacity remained unchanged.',
      extensionDays > 0 ? `Deadline extension of ${extensionDays} days is estimated to yield ${(extensionDays * 1.5).toFixed(1)}% more inquiries.` : 'No deadline change.'
    ],
    disclaimer: 'ESTIMATED PROJECTIONS: Policy simulations represent probabilistic models, not deterministic outcomes.'
  };
};

module.exports = { simulatePolicyScenario };
