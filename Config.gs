/**
 * POSTROOM — Default Label Configuration (Public Release)
 *
 * This is the generic taxonomy shipped with Postroom on GitHub.
 * It works for most people out of the box and is designed to be
 * edited before running setupPostroom().
 *
 * ─────────────────────────────────────────────────────────────────
 * HOW TO CUSTOMISE:
 *
 * Option A — Edit manually:
 *   Update getLabelTaxonomy() below with your own labels.
 *   Format: 'PARENT/Child' for nested, 'PARENT' for top-level only.
 *   Then run setupPostroom().
 *
 * Option B — Run the inbox audit:
 *   Run auditInbox() first. It scans your last 90 days of email
 *   and logs sender patterns to help you decide your label structure.
 *   Edit this file based on what you see, then run setupPostroom().
 *
 * Option C — Claude Assisted (recommended):
 *   Connect Claude to your Gmail, let it audit your inbox, suggest
 *   a personalised label structure, and write a custom Config.gs
 *   tailored to your life. Full guide at ramynaj.substack.com
 * ─────────────────────────────────────────────────────────────────
 *
 * PACKAGING NOTE (for Ramy):
 * When pushing to GitHub, rename this file to Config.gs.
 * Your personal Config.gs stays local only.
 */


function getLabelTaxonomy() {
  return [
    // ── Work ────────────────────────────────────────────
    'WORK/Colleagues',
    'WORK/Clients',
    'WORK/HR & Payroll',
    'WORK/Recruitment',

    // ── Finance ─────────────────────────────────────────
    'FINANCE/Bills & Utilities',
    'FINANCE/Receipts & Payments',
    'FINANCE/Insurance',
    'FINANCE/Loans',
    'FINANCE/Tax & Accounting',
    'FINANCE/Investments',

    // ── Family ──────────────────────────────────────────
    'FAMILY/Household',
    'FAMILY/Kids - School',
    'FAMILY/Medical',

    // ── Health ──────────────────────────────────────────
    'HEALTH/Appointments',
    'HEALTH/Insurance & Claims',

    // ── Shopping & Orders ───────────────────────────────
    'SHOPPING & ORDERS/Purchases',
    'SHOPPING & ORDERS/Returns & Refunds',

    // ── Home & Property ─────────────────────────────────
    'HOME & PROPERTY/Utilities',
    'HOME & PROPERTY/Maintenance',

    // ── Education ───────────────────────────────────────
    'EDUCATION/Courses & Study',
    'EDUCATION/Research',

    // ── Tech & Software ─────────────────────────────────
    'TECH & SOFTWARE/Subscriptions',
    'TECH & SOFTWARE/Support & Accounts',

    // ── Government & Legal ──────────────────────────────
    'GOVERNMENT & LEGAL/Official Correspondence',
    'GOVERNMENT & LEGAL/Tax & Registration',

    // ── Job Search ──────────────────────────────────────
    'JOB SEARCH/Applications & Confirmations',
    'JOB SEARCH/Interview Bookings',
    'JOB SEARCH/Recruiters',

    // ── Travel ──────────────────────────────────────────
    'TRAVEL',

    // ── Newsletters ─────────────────────────────────────
    'NEWSLETTERS/Work & Industry',
    'NEWSLETTERS/Promotions',
    'NEWSLETTERS/Updates',

    // ── Fallback ────────────────────────────────────────
    // Do not remove REVIEW — Postroom uses it for unmatched emails
    'REVIEW'
  ];
}


function getLabelColours() {
  return [
    { name: 'WORK',               bg: '#285bac', text: '#ffffff' },
    { name: 'FINANCE',            bg: '#822111', text: '#ffffff' },
    { name: 'FAMILY',             bg: '#cf8933', text: '#000000' },
    { name: 'HEALTH',             bg: '#b65775', text: '#ffffff' },
    { name: 'SHOPPING & ORDERS',  bg: '#4986e7', text: '#ffffff' },
    { name: 'HOME & PROPERTY',    bg: '#a46a21', text: '#ffffff' },
    { name: 'EDUCATION',          bg: '#3c78d8', text: '#ffffff' },
    { name: 'TECH & SOFTWARE',    bg: '#434343', text: '#ffffff' },
    { name: 'GOVERNMENT & LEGAL', bg: '#666666', text: '#ffffff' },
    { name: 'JOB SEARCH',         bg: '#149e60', text: '#ffffff' },
    { name: 'TRAVEL',             bg: '#1c4587', text: '#ffffff' },
    { name: 'NEWSLETTERS',        bg: '#999999', text: '#000000' },
    { name: 'REVIEW',             bg: '#fb4c2f', text: '#ffffff' }
  ];
}
