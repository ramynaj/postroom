/**
 * POSTROOM — Haiku Classification Client
 *
 * Sends sender address + subject line to Claude Haiku 4.5.
 * Returns the matching label from the taxonomy, or 'REVIEW' if no confident match.
 *
 * Privacy: email body is never read or sent to the API.
 */


function classifyEmail(sender, subject, apiKey) {
  const labelList = getLabelTaxonomy().join('\n');

  const prompt =
    'You are an email classifier for a personal Gmail inbox.\n\n' +
    'Given the sender and subject line of an email, return the single most appropriate ' +
    'label from the list below.\n\n' +
    'LABEL LIST:\n' + labelList + '\n\n' +
    'EMAIL:\n' +
    'From: ' + sender + '\n' +
    'Subject: ' + subject + '\n\n' +
    'Rules:\n' +
    '- Return ONLY the exact label name as it appears in the list above.\n' +
    '- For nested labels use the full path with a forward slash, e.g. FINANCE/Bills & Utilities\n' +
    '- For single-level labels like TRAVEL or REVIEW, return just that word.\n' +
    '- If no label is a confident match, return: REVIEW\n' +
    '- Do not explain. Do not add punctuation. Return one label name only.';

  try {
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 30,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }]
      }),
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();
    if (code !== 200) {
      Logger.log('Haiku API error ' + code + ': ' + response.getContentText());
      return null;
    }

    const json  = JSON.parse(response.getContentText());
    const label = json.content[0].text.trim();

    return label;

  } catch (e) {
    Logger.log('Haiku error: ' + e.message);
    return null;
  }
}
