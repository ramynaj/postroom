/**
 * POSTROOM — Label Creator
 *
 * Creates all labels from the taxonomy with their assigned colours.
 * Parents are created first so children nest correctly in Gmail.
 * Called automatically by setupPostroom() — you do not need to run this manually.
 */


function createAllLabels() {
  const taxonomy  = getLabelTaxonomy();
  const colours   = getLabelColours();

  // Build colour lookup by parent name
  const colourMap = {};
  for (const c of colours) {
    colourMap[c.name] = { bg: c.bg, text: c.text };
  }

  // ── Pass 1: create all parent labels first ───────────────────────
  // Gmail needs the parent to exist before children can nest under it
  const parents = new Set();
  for (const path of taxonomy) {
    const parts = path.split('/');
    if (parts.length > 1) {
      parents.add(parts[0].trim());
    }
  }

  Logger.log('Pass 1: Creating ' + parents.size + ' parent labels...');
  for (const parent of parents) {
    const colour = colourMap[parent] || { bg: '#999999', text: '#000000' };
    createLabel_(parent, colour.bg, colour.text);
    Utilities.sleep(200);
  }

  // ── Pass 2: create child labels and top-level single labels ──────
  Logger.log('Pass 2: Creating child labels...');
  for (const labelPath of taxonomy) {
    const colour = colourMap[labelPath.split('/')[0].trim()] || { bg: '#999999', text: '#000000' };
    createLabel_(labelPath, colour.bg, colour.text);
    Utilities.sleep(200);
  }

  Logger.log('All labels created.');
}


/** Internal: creates a single label via the Gmail REST API */
function createLabel_(name, bgColor, textColor) {
  const token = ScriptApp.getOAuthToken();

  const payload = JSON.stringify({
    name: name,
    color: {
      backgroundColor: bgColor,
      textColor: textColor
    },
    labelListVisibility: 'labelShow',
    messageListVisibility: 'show'
  });

  const options = {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    payload: payload,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/labels',
    options
  );

  const result = JSON.parse(response.getContentText());

  if (result.id) {
    Logger.log('Created: ' + name);
  } else if (result.error) {
    if (result.error.code === 409) {
      Logger.log('Already exists: ' + name);
    } else {
      Logger.log('Error on ' + name + ': ' + result.error.message);
    }
  }
}
