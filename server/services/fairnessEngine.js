/**
 * Fairness Audit Engine (Admin Decision-Support Only)
 * Analyzes selection rates and distribution metrics across cohorts
 * to flag unintended systemic disparities.
 */

const runFairnessAudit = async (ApplicationModel, CourseModel) => {
  const applications = await ApplicationModel.find()
    .populate('studentId', 'name email role')
    .populate('courseId', 'name department code');

  const total = applications.length;
  if (total === 0) {
    return {
      evaluatedCount: 0,
      disparities: [],
      cohortAnalysis: {},
      summary: 'No applications found to evaluate.'
    };
  }

  // 1. Group by Stream / Background
  const streamStats = {};
  applications.forEach(app => {
    const stream = app.academicSnapshot?.stream || 'Other';
    if (!streamStats[stream]) {
      streamStats[stream] = { total: 0, approved: 0, waitlisted: 0, rejected: 0 };
    }
    streamStats[stream].total += 1;
    if (app.status === 'APPROVED' || app.status === 'ENROLLED') {
      streamStats[stream].approved += 1;
    } else if (app.status === 'WAITLISTED') {
      streamStats[stream].waitlisted += 1;
    } else if (app.status === 'REJECTED') {
      streamStats[stream].rejected += 1;
    }
  });

  const streamMetrics = Object.keys(streamStats).map(stream => {
    const stat = streamStats[stream];
    const selectionRate = stat.total > 0 ? ((stat.approved / stat.total) * 100).toFixed(1) : 0;
    return {
      group: stream,
      total: stat.total,
      approved: stat.approved,
      selectionRate: Number(selectionRate)
    };
  });

  // Calculate selection rate disparity vs highest cohort
  const maxSelectionRate = Math.max(...streamMetrics.map(m => m.selectionRate), 1);
  const flags = [];

  streamMetrics.forEach(m => {
    const disparityRatio = Number((m.selectionRate / maxSelectionRate).toFixed(2));
    m.disparityRatio = disparityRatio;
    m.flagged = disparityRatio < 0.75 && m.total >= 3;
    if (m.flagged) {
      flags.push({
        group: m.group,
        issue: `Disparity ratio of ${disparityRatio} is below the 0.75 parity threshold compared to top cohort (${maxSelectionRate}%).`,
        recommendation: 'Manual review of admission criteria recommended to check for unintended bias.'
      });
    }
  });

  // 2. Score Band Distribution
  const scoreBands = { '90-100%': 0, '80-89%': 0, '70-79%': 0, '< 70%': 0 };
  applications.forEach(app => {
    const pct = app.academicSnapshot?.twelfthPercentage || 0;
    if (pct >= 90) scoreBands['90-100%']++;
    else if (pct >= 80) scoreBands['80-89%']++;
    else if (pct >= 70) scoreBands['70-79%']++;
    else scoreBands['< 70%']++;
  });

  return {
    evaluatedCount: total,
    evaluationTimestamp: new Date(),
    overallApprovalRate: Number(((applications.filter(a => ['APPROVED', 'ENROLLED'].includes(a.status)).length / total) * 100).toFixed(1)),
    streamMetrics,
    scoreBands: Object.entries(scoreBands).map(([band, count]) => ({ band, count })),
    flags,
    disclaimer: 'FAIRNESS AUDIT DECISION-SUPPORT: Sensitive demographic attributes are never direct criteria. Final decisions remain strictly human-controlled.'
  };
};

module.exports = { runFairnessAudit };
