// Run against the local static server. No physical device is accessed.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const firmwareBase = 'https://raw.githubusercontent.com/HW-Lab-Hardware-Design-Agency/WebScreen-Software';
(async () => {
    const browser = await chromium.launch({channel: 'chrome', headless: true});
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'webscreen-flasher-tests-'));
    try {
        const page = await browser.newPage({acceptDownloads: true, viewport: {width: 1200, height: 1000}});
        const errors = [], downloads = [], requests = [];
        let failure = null, releaseSlow = null;
        page.on('pageerror', error => errors.push(error.message));
        page.on('download', download => downloads.push(download));
        await page.route('https://**/*', route => route.abort());
        // Keep the existing third-party installer out of deterministic download tests.
        await page.route('https://unpkg.com/**', route => route.fulfill({
            contentType: 'text/javascript', body: 'customElements.define("esp-web-install-button", class extends HTMLElement {});'
        }));
        const fixture = Buffer.from([0xe9, 0x04, 0x00, 0x20, 0x7f, 0xaa]);
        await page.route(`${firmwareBase}/**/webscreen.ino.merged.bin`, async route => {
            requests.push(route.request().url());
            if (failure === 'slow') {
                await new Promise(resolve => {releaseSlow = resolve;});
                await route.fulfill({body: fixture}).catch(() => {});
            } else if (failure === 'http') {
                await route.fulfill({status: 404, body: 'Not found'});
            } else if (failure === 'empty') {
                await route.fulfill({body: Buffer.alloc(0)});
            } else if (failure === 'html') {
                await route.fulfill({contentType: 'text/html', body: '<html>Unavailable</html>'});
            } else {
                await route.fulfill({contentType: 'application/octet-stream', body: fixture});
            }
        });
        await page.goto(process.env.FLASHER_URL || 'http://127.0.0.1:8783', {waitUntil: 'networkidle'});
        assert.equal(await page.locator('esp-web-install-button').isVisible(), false);
        assert.equal(await page.locator('#downloadFirmware').isVisible(), false);
        let previous = null;
        for (const [version, title] of [['main', 'Stable Release'], ['3.x', '3.x Development'], ['4.x', '4.x Development — LVGL 9.5']]) {
            await page.locator(`input[name=version][value="${version}"]`).check();
            const {manifest, url} = await page.evaluate(async () => {
                const url = document.querySelector('esp-web-install-button').manifest;
                return {url, manifest: await (await fetch(url)).json()};
            });
            assert.equal(manifest.name, `WebScreen (${title})`);
            assert.equal(manifest.version, version);
            assert.equal(manifest.builds.length, 1);
            assert.equal(manifest.builds[0].chipFamily, 'ESP32-S3');
            const binary = `${firmwareBase}/${version}/webscreen/build/esp32.esp32.esp32s3/webscreen.ino.merged.bin`;
            assert.deepEqual(manifest.builds[0].parts, [{path: binary, offset: 0}]);
            assert.deepEqual(manifest.allowedUsbIds, [{vendorId: 0x303a, productId: 0x1001}]);
            assert.equal(manifest.new_install_prompt_erase, true);
            if (previous) assert.equal(await page.evaluate(url => fetch(url).then(() => false, () => true), previous), true);
            previous = url;
            assert.equal(await page.locator('esp-web-install-button').isVisible(), true);
            const [download] = await Promise.all([
                page.waitForEvent('download'), page.locator('#downloadFirmware').click()
            ]);
            assert.equal(download.suggestedFilename(), `webscreen-${version}-merged.bin`);
            const saved = path.join(directory, download.suggestedFilename());
            await download.saveAs(saved);
            assert.deepEqual(await fs.readFile(saved), fixture);
            assert.equal(requests.at(-1), binary);
        }
        assert.match(await page.locator('#firmware4Note').textContent(), /development build/);
        for (const [kind, message] of [['http', 'HTTP 404'], ['empty', 'empty'], ['html', 'not an ESP firmware image']]) {
            failure = kind;
            await page.locator('#downloadFirmware').click();
            await page.waitForFunction(() => document.querySelector('#status').classList.contains('error'));
            assert.ok((await page.locator('#status').textContent()).includes(message));
            assert.equal(await page.locator('#downloadFirmware').isEnabled(), true);
            assert.equal(downloads.length, 3, 'bad responses must not create downloads');
        }
        failure = 'slow';
        const pending = page.waitForRequest(url => url.url().endsWith('/webscreen.ino.merged.bin'));
        await page.locator('#downloadFirmware').click();
        await pending;
        assert.equal(await page.locator('#downloadFirmware').isDisabled(), true);
        await page.locator('input[value=main]').check();
        assert.equal(await page.locator('#downloadFirmware').isEnabled(), true);
        releaseSlow();
        failure = null;
        const [recovered] = await Promise.all([
            page.waitForEvent('download'), page.locator('#downloadFirmware').click()
        ]);
        assert.equal(recovered.suggestedFilename(), 'webscreen-main-merged.bin');
        await recovered.saveAs(path.join(directory, 'recovered.bin'));
        assert.equal(downloads.length, 4, 'cancelled firmware must not be offered under another name');
        for (const scheme of ['light', 'dark']) {
            await page.emulateMedia({colorScheme: scheme});
            for (const width of [320, 600, 1200]) {
                await page.setViewportSize({width, height: 1100});
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${scheme} ${width}px overflow`);
            }
        }
        await page.locator('#firmware4').check();
        if (process.env.SCREENSHOT_PATH) await page.screenshot({path: process.env.SCREENSHOT_PATH});
        assert.deepEqual(errors, []);
        console.log('PASS: all firmware manifests, download bytes/names, errors, cancellation, retry, manifest cleanup, responsive layout');
    } finally {
        await browser.close();
        await fs.rm(directory, {recursive: true, force: true});
    }
})().catch(error => {console.error(error); process.exitCode = 1;});
