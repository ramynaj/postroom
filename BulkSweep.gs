/**
 * POSTROOM — Bulk Inbox Sweep
 *
 * Processes ALL unlabelled emails in your inbox — not just recent ones.
 * Use this once after initial setup to label your existing inbox.
 * After this, the daily runPostroom() trigger handles everything going forward.
 *
 * ─────────────────────────────────────────────────────────────────
 * Run previewBulkSweep() first to see how many emails will be processed.
 * Then run bulkSweep() to label them all.
 * ─────────────────────────────────────────────────────────────────
 *
 * Cost estimate: approximately USD $0.00033 per email.
 * 200 emails ≈ USD $0.07 total.
 */


/**
 * Preview — shows how many unlabelled emails are in your inbox.
 * Run this first before bulkSweep().
 */
function previewBulkSweep() {
  const threads = GmailApp.search('in:inbox has:nouserlabels');
  Logger.log('BULK SWEEP PREVIEW');
  Logger.log('Unlabelled emails found: ' + threads.length);
  Logger.log('Estimated cost: USD $' + (threads.length * 0.00033).toFixed(4));
  Logger.log('Estimated time: ~' + Math.ceil(threads.length * 0.4) + ' seconds');
  Logger.log('');
  Logger.log('Run bulkSweep() to proceed.');
}


/**
 * Bulk sweep — labels all unlabelled emails in your inbox.
 * Safe to run multiple times — already-labelled emails are skipped
 * automatically by the has:nouserlabels filter.
 */
function bulkSweep() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');

  if (!apiKey || apiKey === 'sk-ant-your-key-here') {
    Logger.log('ERROR: API key not set. Run saveApiKey() first.');
    return;
  }

  const threads = GmailApp.search('in:inbox has:nouserlabels');

  if (threads.length === 0) {
    Logger.log('No unlabelled emails found. Inbox is fully labelled.');
    return;
  }

  Logger.log('POSTROOM BULK SWEEP');
  Logger.log('Processing ' + threads.length + ' unlabelled emails...');
  Logger.log('─────────────────────────────────────────────');

  let labelled  = 0;
  let reviewed  = 0;
  let errors    = 0;
  const startTime = new Date();

  for (const thread of threads) {
    try {
      // Check time — Apps Script cuts off at 6 minutes
      // Stop at 5 minutes and log progress so user can re-run
      const elapsed = (new Date() - startTime) / 1000;
      if (elapsed > 300) {
        Logger.log('─────────────────────────────────────────────');
        Logger.log('5 minute safety limit reached.');
        Logger.log('Progress: labelled ' + labelled + ', REVIEW ' + reviewed + ', errors ' + errors);
        Logger.log('Run bulkSweep() again to continue — already-labelled emails will be skipped.');
        return;
      }

      const messages = thread.getMessages();
      const latest   = messages[messages.length - 1];
      const sender   = latest.getFrom();
      const subject  = latest.getSubject() || '(no subject)';

      const result = classifyEmail(sender, subject, apiKey);

      if (result && result !== 'REVIEW') {
        const label = GmailApp.getUserLabelByName(result);
        if (label) {
          thread.addLabel(label);
          labelled++;
          Logger.log('✓  ' + result + ' ← "' + subject + '"');
        } else {
          applyReviewLabel_(thread);
          reviewed++;
          Logger.log('→  REVIEW (label not found: ' + result + ') ← "' + subject + '"');
        }
      } else {
        applyReviewLabel_(thread);
        reviewed++;
        Logger.log('→  REVIEW ← "' + subject + '"');
      }

      Utilities.sleep(300);

    } catch (e) {
      errors++;
      Logger.log('ERROR: ' + e.message);
    }
  }

  const elapsed = Math.round((new Date() - startTime) / 1000);

  Logger.log('─────────────────────────────────────────────');
  Logger.log('Bulk sweep complete.');
  Logger.log('Labelled:       ' + labelled);
  Logger.log('Sent to REVIEW: ' + reviewed);
  Logger.log('Errors:         ' + errors);
  Logger.log('Time taken:     ' + elapsed + ' seconds');
}
