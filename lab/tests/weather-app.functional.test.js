const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

// Unlike weather-app.test.js (which only checks HTML/CSS text with cheerio),
// this file actually runs the student's HTML + the provided app.js in a DOM
// and simulates real user actions, so a page that "looks right" but doesn't
// respond to clicks/typing gets caught.

function loadApp() {
  const labDir = path.join(__dirname, '..');
  let html = fs.readFileSync(path.join(labDir, 'index.html'), 'utf8');
  html = html.replace(/<script[^>]*src=["']weatherData\.js["'][^>]*><\/script>/, '');
  html = html.replace(/<script[^>]*src=["']app\.js["'][^>]*><\/script>/, '');

  // jsdom reports exceptions thrown inside event listeners asynchronously
  // (matching real browser behavior — dispatchEvent() itself never throws),
  // so we capture them via the virtual console instead of try/catch.
  const jsdomErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => jsdomErrors.push(e));

  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', virtualConsole });
  // Evaluate both scripts in a single call so `const weatherData` (declared in
  // weatherData.js) is visible to app.js's functions — jsdom's window.eval does
  // not reliably share top-level let/const bindings across separate calls.
  const scripts = [
    fs.readFileSync(path.join(labDir, 'weatherData.js'), 'utf8'),
    fs.readFileSync(path.join(labDir, 'app.js'), 'utf8'),
  ].join('\n');
  dom.window.eval(scripts);
  return { dom, jsdomErrors };
}

describe('Weather App Functional Behavior', () => {
  test('clicking anywhere on the page does not raise an error (requires a .dropdown wrapper)', () => {
    const { dom, jsdomErrors } = loadApp();
    const { document, window } = dom.window;
    document.body.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(jsdomErrors).toEqual([]);
  });

  test('typing a known city into #cityInput shows it in the suggestions list', () => {
    const { dom } = loadApp();
    const { document, window } = dom.window;
    const input = document.getElementById('cityInput');
    expect(input).not.toBeNull();

    input.value = 'anta';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));

    const suggestions = document.getElementById('suggestions');
    expect(suggestions).not.toBeNull();
    expect(suggestions.textContent.toLowerCase()).toContain('antananarivo');
  });

  test('clicking "Get Weather" for a known city renders the result in #weatherInfo', () => {
    const { dom } = loadApp();
    const { document, window } = dom.window;
    const input = document.getElementById('cityInput');
    const button = document.getElementById('getWeather');
    expect(button).not.toBeNull();

    input.value = 'Antananarivo';
    button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const weatherInfo = document.getElementById('weatherInfo');
    expect(weatherInfo.textContent).toMatch(/Antananarivo/);
    expect(weatherInfo.textContent).toMatch(/Sunny/);
  });
});
