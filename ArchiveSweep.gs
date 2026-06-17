/**
 * POSTROOM — One-Time Archive Sweep
 *
 * Run this ONCE manually after using Postroom for 1-2 weeks and confirming
 * the labels are landing correctly.
 *
 * What it does: moves all labelled emails older than 6 months out of your inbox
 * into their label folders. Your inbox resets to recent, relevant mail only.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RECOMMENDED SEQUENCE:
 *   1. Run previewArchiveSweep() first — see what would be archived
 *   2. If it looks correct, run archiveOldEmails() to proceed
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * WARNING: This cannot be easily undone in bulk. Only run when you are confident
 * in your label structure.
 */


/**
 * Preview — shows what would be archived without changing anything.
 * Run this first.
 */
function previewArchiveSweep() {
  Logger.log('PREVIEW MODE — nothing will be changed.');
  Logger.log('Searching for labelled emails older than 6 months in inbox...');

  const threads = GmailApp.search('in:inbox older_than:6m has:userlabels');

  if (threads.length === 0) {
    Logger.log('No emails found matching criteria.');
    return;
  }

  Logger.log(threads.length + ' threads would be archived. Sample below:');

  const sample = Math.min(threads.length, 25);
  for (let i = 0; i < sample; i++) {
    const messages = threads[i].getMessages();
    const latest   = messages[messages.length - 1];
    Logger.log('  • ' + latest.getSubject() + '  (' + latest.getFrom() + ')');
  }

  if (threads.length > sample) {
    Logger.log('  ... and ' + (threads.length - sample) + ' more.');
  }

  Logger.log('Run archiveOldEmails() to proceed with archiving.');
}


/**
 * Archive sweep — moves all labelled emails older than 6 months out of inbox.
 * Run previewArchiveSweep() first to confirm what will be moved.
 */
function archiveOldEmails() {
  Logger.log('Starting archive sweep...');

  const threads = GmailApp.search('in:inbox older_than:6m has:userlabels');

  if (threads.length === 0) {
    Logger.log('No emails found matching criteria. Nothing to archive.');
    return;
  }

  Logger.log('Archiving ' + threads.length + ' threads...');

  let count = 0;

  for (const thread of threads) {
    thread.moveToArchive();
    count++;

    if (count % 50 === 0) {
      Logger.log('Archived ' + count + ' threads...');
      Utilities.sleep(1000); // Pause to stay within Gmail quota
    }
  }

  Logger.log('Archive sweep complete. ' + count + ' threads archived.');
}
