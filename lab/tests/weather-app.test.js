const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

// Setup test data
let html, css, $;

beforeAll(() => {
  // Determine correct paths based on current working directory
  const isRunFromRoot = process.cwd().endsWith('w2_css_w4_weather_app');
  const htmlPath = isRunFromRoot ? 'lab/index.html' : '../index.html';
  const cssPath = isRunFromRoot ? 'lab/style.css' : '../style.css';

  // Read files
  html = fs.readFileSync(htmlPath, 'utf8');
  css = fs.readFileSync(cssPath, 'utf8');
  $ = cheerio.load(html);
});

describe('Weather App HTML Structure', () => {
  describe('Basic HTML Elements', () => {
    test('should have an h1 element containing "Weather"', () => {
      const h1Text = $('h1').text().toLowerCase();
      expect(h1Text).toMatch(/weather/);
    });

    test('should have a text input field', () => {
      const textInputs = $('input[type="text"]');
      expect(textInputs.length).toBeGreaterThan(0);
    });

    test('should have an input with a placeholder', () => {
      const inputsWithPlaceholder = $('input[placeholder]');
      expect(inputsWithPlaceholder.length).toBeGreaterThan(0);
    });

    test('should have a button containing "Weather" text', () => {
      const weatherButton = $('button').filter((i, el) => 
        $(el).text().toLowerCase().includes('weather')
      );
      expect(weatherButton.length).toBeGreaterThan(0);
    });

    test('should have a ul element for suggestions', () => {
      const suggestionsList = $('ul').hasClass('suggestions') || $('ul#suggestions').length > 0;
      expect(suggestionsList).toBe(true);
    });

    test('should have a weatherInfo container', () => {
      const weatherBox = $('#weatherInfo');
      expect(weatherBox.length).toBeGreaterThan(0);
    });
  });

  describe('Semantic HTML', () => {
    test('should use semantic HTML elements', () => {
      const semanticTags = ['header', 'main', 'section'];
      const semanticUsed = semanticTags.some(tag => $(tag).length > 0);
      expect(semanticUsed).toBe(true);
    });

    test('should have main layout wrapped in container or main', () => {
      const hasContainer = $('.container').length > 0 || $('main').length > 0;
      expect(hasContainer).toBe(true);
    });
  });
});

describe('Weather App CSS Styling', () => {


  describe('Input Styles', () => {
    test('should have input border styling', () => {
      expect(css).toMatch(/input\s*{[^}]*border[^}]*}/);
    });

    test('should have input padding', () => {
      expect(css).toMatch(/input\s*{[^}]*padding[^}]*}/);
    });

    test('should have input border-radius', () => {
      expect(css).toMatch(/input\s*{[^}]*border-radius[^}]*}/);
    });
  });

  describe('Button Styles', () => {
    test('should have button background color', () => {
      expect(css).toMatch(/button\s*{[^}]*background[^}]*}/);
    });

    test('should have button text color', () => {
      expect(css).toMatch(/button\s*{[^}]*color[^}]*}/);
    });

    test('should have button border-radius', () => {
      expect(css).toMatch(/button\s*{[^}]*border-radius[^}]*}/);
    });

    test('should have button pointer cursor', () => {
      expect(css).toMatch(/button\s*{[^}]*cursor:\s*pointer[^}]*}/);
    });
  });

  describe('Suggestions Dropdown Styles', () => {
    // Note: Basic dropdown functionality is pre-implemented
    // Students focus on other styling aspects
  });

  describe('Layout Styles', () => {
    // Note: Basic layout structure is pre-implemented
    // Students focus on input and button styling
  });
});

describe('Weather App Integration', () => {
  test('should have all required elements for a functional weather app', () => {
    // Check that all main components are present
    const hasTitle = $('h1').text().toLowerCase().includes('weather');
    const hasInput = $('input[type="text"]').length > 0;
    const hasButton = $('button').filter((i, el) => 
      $(el).text().toLowerCase().includes('weather')
    ).length > 0;
    const hasWeatherContainer = $('#weatherInfo').length > 0;
    const hasSuggestions = $('ul').hasClass('suggestions') || $('ul#suggestions').length > 0;

    expect(hasTitle && hasInput && hasButton && hasWeatherContainer && hasSuggestions).toBe(true);
  });

  test('should have proper styling for user interaction', () => {
    // Check that interactive elements have proper styling
    const hasInputStyling = /input\s*{[^}]*border[^}]*}/.test(css) && 
                           /input\s*{[^}]*padding[^}]*}/.test(css);
    const hasButtonStyling = /button\s*{[^}]*background[^}]*}/.test(css) && 
                            /button\s*{[^}]*cursor:\s*pointer[^}]*}/.test(css);

    expect(hasInputStyling && hasButtonStyling).toBe(true);
  });
});