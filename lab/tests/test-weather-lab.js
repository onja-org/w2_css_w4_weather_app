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
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));

    // Generate HTML test results page
    const htmlContent = generateTestResultsHTML();
    const resultsPath = isRunFromRoot ? 'lab/tests/test-results.html' : './test-results.html';
    
    try {
        fs.writeFileSync(resultsPath, htmlContent);
        console.log(`\n📊 Test results page generated: ${resultsPath}`);
        console.log('Open test-results.html in your browser to view detailed results.');
    } catch (error) {
        console.error('Error generating test results page:', error.message);
    }
}

// Function to generate HTML content for test results
function generateTestResultsHTML() {
    const timestamp = new Date().toLocaleString();
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather App Test Results</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-label {
            font-size: 1.1em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .total .stat-number { color: #6c757d; }
        .passed .stat-number { color: #28a745; }
        .failed .stat-number { color: #dc3545; }
        .rate .stat-number { color: #007bff; }
        
        .results-section {
            padding: 30px;
        }
        
        .section-title {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        
        .test-item {
            display: flex;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            background: #f8f9fa;
        }
        
        .test-item.passed {
            background: #d4edda;
            border-left: 4px solid #28a745;
        }
        
        .test-item.failed {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
        }
        
        .test-status {
            margin-right: 15px;
            font-size: 1.2em;
        }
        
        .test-name {
            font-weight: bold;
            margin-right: 10px;
        }
        
        .test-message {
            color: #666;
            flex-grow: 1;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #eee;
            border-radius: 4px;
            overflow: hidden;
            margin: 20px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
            width: ${successRate}%;
            transition: width 0.5s ease;
        }
        
        .celebration {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            margin: 20px 0;
            border-radius: 10px;
        }
        
        .celebration h2 {
            font-size: 2em;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌤️ Weather App Test Results</h1>
            <p>Automated test execution completed on ${timestamp}</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
        
        ${testResults.failed === 0 ? `
        <div class="celebration">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>All tests are passing! Your weather app is perfectly implemented!</p>
        </div>
        ` : ''}
        
        <div class="stats-grid">
            <div class="stat-card total">
                <div class="stat-number">${testResults.total}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-number">${testResults.passed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-number">${testResults.failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card rate">
                <div class="stat-number">${successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>
        
        <div class="results-section">
            <h2 class="section-title">📋 Detailed Test Results</h2>
            ${testResults.details.map(test => `
                <div class="test-item ${test.status}">
                    <span class="test-status">${test.status === 'passed' ? '✅' : '❌'}</span>
                    <span class="test-name">${test.name}</span>
                    <span class="test-message">${test.message}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated by Weather App Test Suite | ${timestamp}</p>
        </div>
    </div>
</body>
</html>`;
}
