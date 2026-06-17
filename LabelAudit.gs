/**
 * POSTROOM — Monthly Label Audit
 *
 * Runs on the first of every month via a time-based trigger.
 * Compares Config.gs taxonomy against what actually exists in Gmail.
 * Creates any missing labels with correct colours and nesting.
 *
 * What it does:
 *   - Checks every label in Config.gs exists in Gmail
 *   - Creates any that are missing (new labels you added to Config.gs)
 *   - Logs a summary of what was found and what was created
 *
 * What it does NOT do:
 *   - Invent new labels on its own
 *   - Delete any labels
 *   - Move emails
 *   - Update Config.gs itself
 *
 * Config.gs is always the source of truth.
 * This function just keeps Gmail in sync with it automatically.
 *
 * ─────────────────────────────────────────────────────────────────
 * To add a new label: edit Config.gs, then either:
 *   a) Wait for the monthly audit to create it automatically, OR
 *   b) Run auditLabels() manually right now
 * ─────────────────────────────────────────────────────────────────
 */


function auditLabels() {
  Logger.log('POSTROOM MONTHLY LABEL AUDIT');
  Logger.log('Checking Gmail labels against Config.gs taxonomy...');
  Logger.log('─────────────────────────────────────────────');

  const taxonomy  = getLabelTaxonomy();
  const colours   = getLabelColours();

  // Build colour lookup by parent name
  const colourMap = {};
  for (const c of colours) {
    colourMap[c.name] = { bg: c.bg, text: c.text };
  }

  // Get all existing Gmail label names
  const existingLabels = GmailApp.getUserLabels().map(l => l.getName());
  const existingSet    = new Set(existingLabels);

  const missing  = [];
  const present  = [];

  for (const labelPath of taxonomy) {
    if (existingSet.has(labelPath)) {
      present.push(labelPath);
    } else {
      missing.push(labelPath);
    }
  }

  Logger.log('Labels in Config.gs:  ' + taxonomy.length);
  Logger.log('Already in Gmail:     ' + present.length);
  Logger.log('Missing from Gmail:   ' + missing.length);
  Logger.log('');

  if (missing.length === 0) {
    Logger.log('✓  All labels are present. Nothing to create.');
    Logger.log('─────────────────────────────────────────────');
    return;
  }

  Logger.log('Creating ' + missing.length + ' missing labels...');
  Logger.log('─────────────────────────────────────────────');

  // For each missing label, ensure parent exists first
  const missingParents = new Set();
  for (const path of missing) {
    const parts = path.split('/');
    if (parts.length > 1) {
      const parent = parts[0].trim();
      if (!existingSet.has(parent)) {
        missingParents.add(parent);
      }
    }
  }

  // Create any missing parent labels first
  for (const parent of missingParents) {
    const colour = colourMap[parent] || { bg: '#999999', text: '#000000' };
    createLabel_(parent, colour.bg, colour.text);
    Utilities.sleep(300);
  }

  // Create missing child and single-level labels
  for (const labelPath of missing) {
    const parentName = labelPath.split('/')[0].trim();
    const colour     = colourMap[parentName] || { bg: '#999999', text: '#000000' };
    createLabel_(labelPath, colour.bg, colour.text);
    Utilities.sleep(300);
  }

  Logger.log('─────────────────────────────────────────────');
  Logger.log('Audit complete. ' + missing.length + ' labels created.');
}


/**
 * Sets up the monthly audit trigger.
 * Called automatically by setupPostroom() — no need to run manually.
 */
function setupMonthlyAuditTrigger() {
  // Remove any existing monthly audit triggers
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'auditLabels')
    .forEach(t => ScriptApp.deleteTrigger(t));

  // Create new trigger — runs on the 1st of every month at 8:00am
  ScriptApp.newTrigger('auditLabels')
    .timeBased()
    .onMonthDay(1)
    .atHour(8)
    .create();

  Logger.log('Monthly audit trigger set — runs on the 1st of every month at 8:00am.');
}


// ─── Internal helper (mirrors Labels.gs) ─────────────────────────────────────

function createLabel_(name, bgColor, textColor) {
  const token = ScriptApp.getOAuthToken();
  const response = UrlFetchApp.fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      name: name,
      color: { backgroundColor: bgColor, textColor: textColor },
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show'
    }),
    muteHttpExceptions: true
  });
  const result = JSON.parse(response.getContentText());
  if (result.id) Logger.log('Created: ' + name);
  else if (result.error && result.error.code === 409) Logger.log('Already exists: ' + name);
  else if (result.error) Logger.log('Error on ' + name + ': ' + result.error.message);
}
