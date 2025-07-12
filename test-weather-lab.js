const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const $ = cheerio.load(html);

// ===== HTML TESTS ===== //


console.assert($('h1').text().toLowerCase().includes('weather'), '❌ Missing or incorrect <h1> with "Weather" in it.');


console.assert($('input[type="text"]').length > 0, '❌ Missing input field of type text.');
console.assert($('input[placeholder]').length > 0, '❌ Input missing a placeholder.');

console.assert($('button').filter((i, el) => $(el).text().toLowerCase().includes('weather')).length > 0, '❌ Missing button with "Weather" text.');

console.assert($('ul').hasClass('suggestions') || $('ul#suggestions').length > 0, '❌ Missing <ul> for suggestions.');


const weatherBox = $('#weatherInfo');
console.assert(weatherBox.length > 0, '❌ Missing #weatherInfo container.');


const semanticTags = ['header', 'main', 'section'];
const semanticUsed = semanticTags.some(tag => $(tag).length > 0);
console.assert(semanticUsed, '❌ Missing semantic HTML elements like <header>, <main>, or <section>.');


console.assert($('.container').length > 0 || $('main').length > 0, '❌ Main layout should be wrapped in a container or <main>.');

// ===== CSS TESTS ===== //

console.assert(/body\s*{[^}]*background[^}]*}/.test(css), '❌ Missing body background style.');
console.assert(/body\s*{[^}]*font-family[^}]*}/.test(css), '❌ Missing body font-family.');
console.assert(/body\s*{[^}]*display:\s*flex[^}]*}/.test(css), '❌ Body is not using flex layout.');

console.assert(/input\s*{[^}]*border[^}]*}/.test(css), '❌ Input missing border styling.');
console.assert(/input\s*{[^}]*padding[^}]*}/.test(css), '❌ Input missing padding.');
console.assert(/input\s*{[^}]*border-radius[^}]*}/.test(css), '❌ Input missing border-radius.');

console.assert(/button\s*{[^}]*background[^}]*}/.test(css), '❌ Button missing background color.');
console.assert(/button\s*{[^}]*color[^}]*}/.test(css), '❌ Button missing text color.');
console.assert(/button\s*{[^}]*border-radius[^}]*}/.test(css), '❌ Button missing border-radius.');
console.assert(/button\s*{[^}]*cursor:\s*pointer[^}]*}/.test(css), '❌ Button missing pointer cursor.');

console.assert(/#suggestions\s*{[^}]*position:\s*absolute[^}]*}/.test(css), '❌ #suggestions missing absolute positioning.');
console.assert(/#suggestions\s*{[^}]*z-index[^}]*}/.test(css), '❌ #suggestions missing z-index.');
console.assert(/#suggestions\s*{[^}]*overflow-y:\s*auto[^}]*}/.test(css), '❌ #suggestions missing scroll behavior.');

console.assert(/\.weather\s*{[^}]*margin[^}]*}/.test(css), '❌ .weather section missing margin.');
console.assert(/\.container\s*{[^}]*box-shadow[^}]*}/.test(css), '❌ .container missing box-shadow for card effect.');

console.log('✅ All checks completed.');
