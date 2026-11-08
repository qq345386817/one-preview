const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SITE = path.resolve(__dirname, '..');
const ORIGIN = 'https://one-preview.luopeike.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function buildPlan({ site = SITE, all = false, urls = [] } = {}) {
  if ((!all && !urls.length) || (all && urls.length)) throw Error('Choose --all or one or more --url values');
  const keys = fs.readdirSync(site).filter(name => /^[a-f0-9]{32}\.txt$/.test(name));
  if (keys.length !== 1) throw Error('Expected one public IndexNow verification file at the site root');
  const key = keys[0].slice(0, -4);
  if (fs.readFileSync(path.join(site, keys[0]), 'utf8').trim() !== key) throw Error('IndexNow verification file does not match its name');
  const canonical = [...fs.readFileSync(path.join(site, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (!canonical.length || new Set(canonical).size !== canonical.length) throw Error('Empty or duplicate sitemap URLs');
  const selected = [...new Set(all ? canonical : urls)];
  if (selected.length > 10000) throw Error('IndexNow accepts at most 10000 URLs per request');
  for (const value of [...canonical, ...selected]) {
    const url = new URL(value);
    if (url.origin !== ORIGIN || url.username || url.password || url.search || url.hash || url.href !== value) throw Error('Only canonical HTTPS URLs on the OnePreview host are allowed');
    if (!canonical.includes(value)) throw Error('URL is not in the canonical sitemap: ' + value);
  }
  return { host: new URL(ORIGIN).hostname, key, keyLocation: ORIGIN + '/' + keys[0], urlList: selected };
}

function requestViaCurl(url, { method = 'GET', body } = {}) {
  const args = ['--silent', '--show-error', '--connect-timeout', '15', '--max-time', '60',
    '--request', method, '--write-out', '\n%{http_code}'];
  if (body !== undefined) args.push('--header', 'Content-Type: application/json; charset=utf-8', '--data-binary', '@-');
  args.push(url);
  // curl preserves the caller's proxy environment; no system network settings are changed.
  const result = spawnSync('curl', args, { encoding: 'utf8', input: body === undefined ? undefined : JSON.stringify(body), maxBuffer: 1024 * 1024 });
  if (result.error || result.status !== 0) throw Error('IndexNow network request failed: ' + (result.error?.message || result.stderr.trim()));
  const split = result.stdout.lastIndexOf('\n');
  return { status: Number(result.stdout.slice(split + 1).trim()), body: result.stdout.slice(0, split) };
}

async function submitPlan(plan, { request = requestViaCurl } = {}) {
  const verification = await request(plan.keyLocation);
  if (verification.status !== 200 || verification.body.trim() !== plan.key) throw Error('The public verification file is not live; no URLs were submitted');
  const response = await request(ENDPOINT, { method: 'POST', body: plan });
  if (![200, 202].includes(response.status)) throw Error(`IndexNow returned HTTP ${response.status}; inspect the response before retrying: ${response.body.slice(0, 300)}`);
  return { statusCode: response.status, result: response.status === 200 ? 'received' : 'received-key-validation-pending', urlCount: plan.urlList.length };
}

function parseArgs(argv) {
  const result = { all: false, submit: false, urls: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--all') result.all = true;
    else if (argv[i] === '--submit') result.submit = true;
    else if (argv[i] === '--url') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error('--url requires a canonical URL');
      result.urls.push(argv[++i]);
    } else throw Error('Unknown option: ' + argv[i]);
  }
  if ((!result.all && !result.urls.length) || (result.all && result.urls.length)) throw Error('Choose --all or one or more --url values; add --submit only after deployment');
  return result;
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const plan = buildPlan(args);
  const result = args.submit ? await submitPlan(plan) : { mode: 'dry-run', host: plan.host, urlCount: plan.urlList.length, urls: plan.urlList };
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { buildPlan, submitPlan, parseArgs };
