/**
 * POSTROOM v1.0
 * Gmail labelling system powered by Claude Haiku 4.5
 *
 * Built by Ramy Najmeddine
 * From the Index · Entry 01
 * github.com/ramynaj/postroom
 * ramynaj.substack.com
 *
 * ─────────────────────────────────────────────
 * SETUP (run once in this order):
 *   1. Open this script in Google Apps Script
 *   2. Edit saveApiKey() — paste your Anthropic API key
 *   3. Run saveApiKey()
 *   4. Run setupPostroom()
 *   5. Authorise when Google prompts you
 * ─────────────────────────────────────────────
 */


/**
 * STEP 1 — Save your Anthropic API key.
 * Paste your key below, run this function once, then delete the key from the code.
 * The key is stored securely in Apps Script Properties — never in the code or GitHub.
 */
function saveApiKey() {
  const key = 'sk-ant-your-key-here'; // PASTE YOUR KEY HERE, THEN RUN
  PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', key);
  Logger.log('API key saved to Properties Service. Delete the key from the code now.');
}


/**
 * STEP 2 — Set up Postroom.
 * Creates all labels with colours. Sets up the daily 7:00am trigger.
 * Run once after saveApiKey().
 */
function setupPostroom() {
  Logger.log('Setting up Postroom...');

  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey || apiKey === 'sk-ant-your-key-here') {
    Logger.log('ERROR: Run saveApiKey() first with your actual Anthropic API key.');
    return;
  }

  // Create all labels with colours
  createAllLabels();

  // Remove any existing Postroom triggers to avoid duplicates
  removeExistingTriggers_();

  // Set up daily trigger at 7:00am
  ScriptApp.newTrigger('runPostroom')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();

  // Set up monthly label audit trigger
  setupMonthlyAuditTrigger();

  Logger.log('Postroom is set up. It will run automatically every day at 7:00am.');
  Logger.log('Monthly label audit runs on the 1st of every month at 8:00am.');
  Logger.log('You can also run runPostroom() or auditLabels() manually at any time.');
}


/**
 * MAIN FUNCTION — processes new unlabelled emails.
 * Called automatically by the daily trigger.
 * Can also be run manually at any time.
 */
function runPostroom() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');

  if (!apiKey || apiKey === 'sk-ant-your-key-here') {
    Logger.log('ERROR: Anthropic API key not set. Run saveApiKey() first.');
    return;
  }

  // Find unlabelled emails from the last 2 days
  // newer_than:2d gives a safety buffer in case a run was missed
  const threads = GmailApp.search('in:inbox has:nouserlabels newer_than:2d');

  if (threads.length === 0) {
    Logger.log('No unlabelled emails found. All done.');
    return;
  }

  Logger.log('Processing ' + threads.length + ' threads...');

  let labelled  = 0;
  let reviewed  = 0;
  let errors    = 0;

  for (const thread of threads) {
    try {
      const messages = thread.getMessages();
      const latest   = messages[messages.length - 1];

      const sender  = latest.getFrom();
      const subject = latest.getSubject() || '(no subject)';

      // Send sender + subject to Claude Haiku for classification
      const result = classifyEmail(sender, subject, apiKey);

      if (result && result !== 'REVIEW') {
        const label = GmailApp.getUserLabelByName(result);
        if (label) {
          thread.addLabel(label);
          labelled++;
          Logger.log('✓  ' + result + ' ← "' + subject + '"');
        } else {
          // Haiku returned a label name that doesn't exist — send to REVIEW
          applyReviewLabel_(thread);
          reviewed++;
          Logger.log('→  REVIEW (label not found: ' + result + ') ← "' + subject + '"');
        }
      } else {
        // Haiku returned REVIEW or could not classify
        applyReviewLabel_(thread);
        reviewed++;
        Logger.log('→  REVIEW ← "' + subject + '"');
      }

      // Brief pause between API calls to stay within rate limits
      Utilities.sleep(300);

    } catch (e) {
      errors++;
      Logger.log('ERROR: ' + e.message);
    }
  }

  Logger.log('─────────────────────────');
  Logger.log('Done.');
  Logger.log('Labelled:       ' + labelled);
  Logger.log('Sent to REVIEW: ' + reviewed);
  Logger.log('Errors:         ' + errors);
}


// ─── Internal helpers ───────────────────────────────────────────────────────

function applyReviewLabel_(thread) {
  const label = GmailApp.getUserLabelByName('REVIEW');
  if (label) thread.addLabel(label);
}

function removeExistingTriggers_() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'runPostroom')
    .forEach(t => ScriptApp.deleteTrigger(t));
}
