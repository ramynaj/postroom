/**
 * POSTROOM — Inbox Audit
 *
 * Scans your last 90 days of email and logs sender patterns to help
 * you build a label structure that matches your actual inbox.
 *
 * Run this BEFORE editing Config.gs and running setupPostroom().
 *
 * ─────────────────────────────────────────────────────────────────
 * HOW TO USE:
 *   1. Run auditInbox() from the Apps Script editor
 *   2. Click View > Logs to see the results
 *   3. Use the output to decide your label structure
 *   4. Edit Config.gs with your labels
 *   5. Run setupPostroom()
 *
 * For a fully personalised label structure built by AI from your
 * actual inbox, use Option C (Claude Assisted) at ramynaj.substack.com
 * ─────────────────────────────────────────────────────────────────
 */


function auditInbox() {
  Logger.log('POSTROOM INBOX AUDIT');
  Logger.log('Scanning last 90 days of email...');
  Logger.log('─────────────────────────────────');

  const threads = GmailApp.search('in:inbox newer_than:90d', 0, 200);

  if (threads.length === 0) {
    Logger.log('No emails found in the last 90 days.');
    return;
  }

  Logger.log('Found ' + threads.length + ' threads. Analysing...\n');

  // Collect sender domains and full addresses
  const domainCounts  = {};
  const senderSamples = {};

  for (const thread of threads) {
    try {
      const messages = thread.getMessages();
      const latest   = messages[messages.length - 1];
      const from     = latest.getFrom();
      const subject  = latest.getSubject() || '(no subject)';

      // Extract domain from sender address
      const emailMatch = from.match(/[\w.-]+@([\w.-]+)/);
      if (!emailMatch) continue;

      const domain = emailMatch[1].toLowerCase();

      // Count by domain
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;

      // Keep one sample subject per domain
      if (!senderSamples[domain]) {
        senderSamples[domain] = { from: from, subject: subject };
      }

    } catch (e) {
      // Skip threads that error
    }
  }

  // Sort domains by frequency
  const sorted = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1]);

  Logger.log('TOP SENDERS BY DOMAIN');
  Logger.log('─────────────────────────────────');
  Logger.log('Count  Domain                         Sample');
  Logger.log('─────────────────────────────────────────────────────────────');

  for (const [domain, count] of sorted) {
    const sample  = senderSamples[domain];
    const padded  = (count + '').padStart(3) + '    ';
    const domPad  = domain.padEnd(30).slice(0, 30) + '  ';
    const subSnip = sample.subject.slice(0, 50);
    Logger.log(padded + domPad + subSnip);
  }

  Logger.log('\n─────────────────────────────────');
  Logger.log('SUGGESTED NEXT STEPS');
  Logger.log('─────────────────────────────────');
  Logger.log('1. Look at the top senders above.');
  Logger.log('2. Group them into life categories (Work, Finance, Family, etc.)');
  Logger.log('3. Edit Config.gs with your label structure.');
  Logger.log('4. Run setupPostroom() to create the labels and start Postroom.');
  Logger.log('');
  Logger.log('For a fully personalised label structure built from this data,');
  Logger.log('use Option C (Claude Assisted): ramynaj.substack.com');
}
