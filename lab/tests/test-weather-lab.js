const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

// Custom test function to replace console.assert
function runTest(condition, testName, errorMessage) {
    testResults.total++;
    
    if (condition) {
        testResults.passed++;
        testResults.details.push({
            name: testName,
            status: 'passed',
            message: `✅ ${testName}`
        });
        console.log(`✅ ${testName}`);
    } else {
        testResults.failed++;
        testResults.details.push({
            name: testName,
            status: 'failed',
            message: errorMessage
        });
        console.log(errorMessage);
    }
}

// Determine correct paths based on current working directory
const isRunFromRoot = process.cwd().endsWith('w2_css_w4_weather_app');
const htmlPath = isRunFromRoot ? 'lab/index.html' : '../index.html';
const cssPath = isRunFromRoot ? 'lab/style.css' : '../style.css';

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const $ = cheerio.load(html);

// ===== HTML TESTS ===== //

runTest($('h1').text().toLowerCase().includes('weather'), 'H1 Weather Title', '❌ Missing or incorrect <h1> with "Weather" in it.');

runTest($('input[type="text"]').length > 0, 'Text Input Field', '❌ Missing input field of type text.');
runTest($('input[placeholder]').length > 0, 'Input Placeholder', '❌ Input missing a placeholder.');

runTest($('button').filter((i, el) => $(el).text().toLowerCase().includes('weather')).length > 0, 'Weather Button', '❌ Missing button with "Weather" text.');

runTest($('ul').hasClass('suggestions') || $('ul#suggestions').length > 0, 'Suggestions List', '❌ Missing <ul> for suggestions.');

const weatherBox = $('#weatherInfo');
runTest(weatherBox.length > 0, 'Weather Info Container', '❌ Missing #weatherInfo container.');

const semanticTags = ['header', 'main', 'section'];
const semanticUsed = semanticTags.some(tag => $(tag).length > 0);
runTest(semanticUsed, 'Semantic HTML Elements', '❌ Missing semantic HTML elements like <header>, <main>, or <section>.');

runTest($('.container').length > 0 || $('main').length > 0, 'Main Layout Container', '❌ Main layout should be wrapped in a container or <main>.');

// ===== CSS TESTS ===== //

runTest(/body\s*{[^}]*background[^}]*}/.test(css), 'Body Background Style', '❌ Missing body background style.');
runTest(/body\s*{[^}]*font-family[^}]*}/.test(css), 'Body Font Family', '❌ Missing body font-family.');
runTest(/body\s*{[^}]*display:\s*flex[^}]*}/.test(css), 'Body Flex Layout', '❌ Body is not using flex layout.');

runTest(/input\s*{[^}]*border[^}]*}/.test(css), 'Input Border Styling', '❌ Input missing border styling.');
runTest(/input\s*{[^}]*padding[^}]*}/.test(css), 'Input Padding', '❌ Input missing padding.');
runTest(/input\s*{[^}]*border-radius[^}]*}/.test(css), 'Input Border Radius', '❌ Input missing border-radius.');

runTest(/button\s*{[^}]*background[^}]*}/.test(css), 'Button Background Color', '❌ Button missing background color.');
runTest(/button\s*{[^}]*color[^}]*}/.test(css), 'Button Text Color', '❌ Button missing text color.');
runTest(/button\s*{[^}]*border-radius[^}]*}/.test(css), 'Button Border Radius', '❌ Button missing border-radius.');
runTest(/button\s*{[^}]*cursor:\s*pointer[^}]*}/.test(css), 'Button Pointer Cursor', '❌ Button missing pointer cursor.');

runTest(/#suggestions\s*{[^}]*position:\s*absolute[^}]*}/.test(css), 'Suggestions Absolute Position', '❌ #suggestions missing absolute positioning.');
runTest(/#suggestions\s*{[^}]*z-index[^}]*}/.test(css), 'Suggestions Z-Index', '❌ #suggestions missing z-index.');
runTest(/#suggestions\s*{[^}]*overflow-y:\s*auto[^}]*}/.test(css), 'Suggestions Scroll Behavior', '❌ #suggestions missing scroll behavior.');

runTest(/\.weather\s*{[^}]*margin[^}]*}/.test(css), 'Weather Section Margin', '❌ .weather section missing margin.');
runTest(/\.container\s*{[^}]*box-shadow[^}]*}/.test(css), 'Container Box Shadow', '❌ .container missing box-shadow for card effect.');

// Generate test results
generateTestResults();

// Function to generate test results and create HTML report
function generateTestResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📝 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`🧪 Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
}
