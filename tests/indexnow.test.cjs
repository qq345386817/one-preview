const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { buildPlan, submitPlan, parseArgs } = require('../script/submit-indexnow.cjs');
const ORIGIN = 'https://one-preview.luopeike.com';
const KEY = 'a'.repeat(32);

function fixture(run) {
  const site = fs.mkdtempSync(path.join(os.tmpdir(), 'onepreview-indexnow-test-'));
  try {
    fs.writeFileSync(path.join(site, KEY + '.txt'), KEY + '\n');
    fs.writeFileSync(path.join(site, 'sitemap.xml'), `<urlset><url><loc>${ORIGIN}/</loc></url><url><loc>${ORIGIN}/zh-Hans/help</loc></url></urlset>`);
    return run(site);
  } finally { fs.rmSync(site, { recursive: true, force: true }); }
}

test('repository verification file and canonical sitemap cover exactly 55 public pages', () => {
  const plan = buildPlan({ all: true });
  assert.equal(plan.host, 'one-preview.luopeike.com');
  assert.equal(plan.urlList.length, 55);
  assert.ok(plan.urlList.every(url => !url.includes(plan.key)));
  const headers = fs.readFileSync(path.join(__dirname, '../_headers'), 'utf8');
  assert.ok(headers.includes('/' + plan.key + '.txt\n  X-Robots-Tag: noindex'));
});

test('explicit canonical URL selection is deduplicated', () => fixture(site => {
  const plan = buildPlan({ site, urls: [ORIGIN + '/', ORIGIN + '/'] });
  assert.deepEqual(plan.urlList, [ORIGIN + '/']);
  assert.equal(plan.keyLocation, ORIGIN + '/' + KEY + '.txt');
}));

test('foreign hosts, HTTP, user info, query strings, fragments and aliases are rejected', () => fixture(site => {
  for (const url of ['https://example.com/', 'http://one-preview.luopeike.com/',
    'https://user@one-preview.luopeike.com/', ORIGIN + '/?source=ad', ORIGIN + '/#main', ORIGIN + '/zh-Hans/help.html']) {
    assert.throws(() => buildPlan({ site, urls: [url] }), /canonical|sitemap/);
  }
}));

test('unverified or ambiguous key files cannot produce a submission plan', () => fixture(site => {
  fs.writeFileSync(path.join(site, KEY + '.txt'), 'wrong');
  assert.throws(() => buildPlan({ site, all: true }), /does not match/);
  fs.writeFileSync(path.join(site, KEY + '.txt'), KEY);
  fs.writeFileSync(path.join(site, 'b'.repeat(32) + '.txt'), 'b'.repeat(32));
  assert.throws(() => buildPlan({ site, all: true }), /Expected one/);
  fs.rmSync(path.join(site, KEY + '.txt'));
  fs.rmSync(path.join(site, 'b'.repeat(32) + '.txt'));
  assert.throws(() => buildPlan({ site, all: true }), /Expected one/);
}));

test('invalid sitemap and protocol limits fail before networking', () => fixture(site => {
  fs.writeFileSync(path.join(site, 'sitemap.xml'), `<urlset><loc>${ORIGIN}/</loc><loc>${ORIGIN}/</loc></urlset>`);
  assert.throws(() => buildPlan({ site, all: true }), /duplicate/);
  fs.writeFileSync(path.join(site, 'sitemap.xml'), '<urlset/>');
  assert.throws(() => buildPlan({ site, all: true }), /Empty/);
  fs.writeFileSync(path.join(site, 'sitemap.xml'), `<urlset><loc>https://example.com/</loc></urlset>`);
  assert.throws(() => buildPlan({ site, all: true }), /canonical/);
  fs.writeFileSync(path.join(site, 'sitemap.xml'), `<urlset>${Array.from({length:10001},(_,i)=>`<loc>${ORIGIN}/page-${i}</loc>`).join('')}</urlset>`);
  assert.throws(() => buildPlan({ site, all: true }), /10000/);
}));

test('CLI requires explicit scope and defaults to an offline dry run', () => {
  assert.deepEqual(parseArgs(['--all']), { all: true, submit: false, urls: [] });
  assert.deepEqual(parseArgs(['--url', ORIGIN + '/', '--submit']), { all: false, submit: true, urls: [ORIGIN + '/'] });
  for (const args of [[], ['--submit'], ['--url'], ['--all','--url',ORIGIN+'/'], ['--unknown']]) assert.throws(() => parseArgs(args));
  const result = spawnSync(process.execPath, [path.join(__dirname, '../script/submit-indexnow.cjs'), '--all'],
    {encoding:'utf8',env:{...process.env,https_proxy:'http://127.0.0.1:1',HTTPS_PROXY:'http://127.0.0.1:1'}});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).mode, 'dry-run');
});

test('a live matching verification file is required before any POST', async () => {
  const plan = buildPlan({ all: true });
  for (const response of [{status:404,body:''}, {status:200,body:'wrong'}, {status:301,body:plan.key}]) {
    let calls=0;
    await assert.rejects(submitPlan(plan,{request:async()=>{calls++;return response;}}), /not live/);
    assert.equal(calls,1);
  }
});

test('successful submission sends only the canonical plan, with 200 and 202 kept distinct', async () => {
  const plan = buildPlan({ all: true });
  for (const status of [200,202]) {
    const calls=[];
    const result=await submitPlan(plan,{request:async(url,options)=>{calls.push({url,options});return calls.length===1?{status:200,body:plan.key+'\n'}:{status,body:''};}});
    assert.equal(calls.length,2);
    assert.equal(calls[0].url,plan.keyLocation);
    assert.equal(calls[1].url,'https://api.indexnow.org/indexnow');
    assert.deepEqual(calls[1].options,{method:'POST',body:plan});
    assert.equal(result.statusCode,status);
    assert.equal(result.result,status===200?'received':'received-key-validation-pending');
    assert.equal(result.urlCount,55);
  }
});

test('failed or throttled POST is not blindly repeated', async () => {
  const plan=buildPlan({all:true});
  for(const status of [400,403,422,429,500]){
    let calls=0;
    await assert.rejects(submitPlan(plan,{request:async()=>{calls++;return calls===1?{status:200,body:plan.key}:{status,body:'error'};}}),new RegExp('HTTP '+status));
    assert.equal(calls,2);
  }
});
