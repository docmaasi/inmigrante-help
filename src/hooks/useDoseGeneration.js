import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Parse a frequency string into a number of daily doses.
 * Returns 0 for "as needed" (no auto-generation).
 */
function parseDoseCount(frequency) {
  if (!frequency) return 1;
  const f = frequency.toLowerCase().trim();
  if (f.includes('as needed') || f.includes('prn')) return 0;
  if (f.includes('three') || f === 'tid') return 3;
  if (f.includes('twice') || f === 'bid') return 2;
  return 1;
}

/**
 * Parse time_of_day into label array.
 * "Morning, Evening" → ["Morning", "Evening"]
 * Falls back to numbered labels if not enough labels.
 */
function parseDoseLabels(timeOfDay, count) {
  const defaults = ['Morning', 'Afternoon', 'Evening'];
  if (!timeOfDay) return defaults.slice(0, count);

  const labels = timeOfDay
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  while (labels.length < count) {
    labels.push(`Dose ${labels.length + 1}`);
  }
  return labels.slice(0, count);
}

/**
 * Hook: auto-generates pending dose entries for today
 * and marks past pending entries as missed.
 *
 * Call with active medications array. Runs once per page load.
 */
export function useDoseGeneration(medications) {
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!medications || medications.length === 0) return;
    if (hasRun.current) return;
    hasRun.current = true;

    generateDoses(medications, queryClient);
  }, [medications, queryClient]);
}

async function generateDoses(medications, queryClient) {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Fetch recent logs (last 200) to check existing entries
    const allLogs = await base44.entities.MedicationLog.list(
      '-date_taken',
      200
    );

    let madeChanges = false;

    // --- Part A: Mark past pending entries as missed ---
    const pastPending = allLogs.filter(
      log => log.status === 'pending' && log.date_taken < today
    );

    for (const log of pastPending) {
      await base44.entities.MedicationLog.update(log.id, {
        status: 'missed'
      });
      madeChanges = true;
    }

    // --- Part B: Generate today's pending doses ---
    for (const med of medications) {
      const doseCount = parseDoseCount(med.frequency);
      if (doseCount === 0) continue; // as-needed, skip

      const labels = parseDoseLabels(med.time_of_day, doseCount);

      // Find today's existing logs for this medication
      const todayLogs = allLogs.filter(
        log =>
          log.medication_id === med.id && log.date_taken === today
      );

      // Only create if fewer entries exist than expected
      if (todayLogs.length >= doseCount) continue;

      // Figure out which dose numbers already exist
      const existingNumbers = new Set(
        todayLogs.map(log => log.dose_number).filter(Boolean)
      );

      for (let i = 1; i <= doseCount; i++) {
        if (existingNumbers.has(i)) continue;

        // Also skip if a log without dose_number exists
        // (legacy manual entry) and we only expect 1 dose
        if (doseCount === 1 && todayLogs.length > 0) continue;

        await base44.entities.MedicationLog.create({
          medication_id: med.id,
          care_recipient_id: med.care_recipient_id,
          medication_name: med.medication_name,
          dosage: med.dosage,
          date_taken: today,
          status: 'pending',
          dose_number: i,
          dose_label: labels[i - 1],
          generated_by: 'system'
        });
        madeChanges = true;
      }
    }

    // Refresh the UI if we created or updated anything
    if (madeChanges) {
      queryClient.invalidateQueries({ queryKey: ['medicationLogs'] });
    }
  } catch (err) {
    console.error('Dose generation error:', err);
  }
}
