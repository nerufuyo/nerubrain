import { DOMUtils } from '../../src/utils/dom';

describe('DOMUtils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('waitForElement', () => {
    it('should resolve immediately if element exists', async () => {
      const div = document.createElement('div');
      div.id = 'test-element';
      document.body.appendChild(div);

      const result = await DOMUtils.waitForElement('#test-element');
      expect(result).toBe(div);
    });

    it('should wait for element to appear', async () => {
      const selector = '#delayed-element';
      const waitPromise = DOMUtils.waitForElement(selector, 200);
      
      setTimeout(() => {
        const div = document.createElement('div');
        div.id = 'delayed-element';
        document.body.appendChild(div);
      }, 50);

      const result = await waitPromise;
      expect(result).toBeTruthy();
      expect(result?.id).toBe('delayed-element');
    });

    it('should timeout if element never appears', async () => {
      const result = await DOMUtils.waitForElement('#nonexistent', 100);
      expect(result).toBeNull();
    });
  });

  describe('safeClick', () => {
    it('should successfully click a valid HTML element', async () => {
      const button = document.createElement('button');
      let clicked = false;
      button.addEventListener('click', () => {
        clicked = true;
      });
      document.body.appendChild(button);

      const result = await DOMUtils.safeClick(button);
      expect(result).toBe(true);
      expect(clicked).toBe(true);
    });

    it('should return false for non-HTML elements', async () => {
      const result = await DOMUtils.safeClick(null as any);
      expect(result).toBe(false);
    });
  });

  describe('getTextContent', () => {
    it('should return trimmed text content', () => {
      const div = document.createElement('div');
      div.textContent = '  Hello World  ';

      const result = DOMUtils.getTextContent(div);
      expect(result).toBe('Hello World');
    });

    it('should return empty string for null element', () => {
      const result = DOMUtils.getTextContent(null as any);
      expect(result).toBe('');
    });
  });

  describe('isVisible', () => {
    it('should return true for visible elements', () => {
      const div = document.createElement('div');
      div.style.display = 'block';
      div.style.visibility = 'visible';
      div.style.opacity = '1';
      
      // Mock offsetWidth and offsetHeight
      Object.defineProperty(div, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(div, 'offsetHeight', { value: 100, configurable: true });

      document.body.appendChild(div);
      const result = DOMUtils.isVisible(div);
      expect(result).toBe(true);
    });

    it('should return false for hidden elements', () => {
      const div = document.createElement('div');
      div.style.display = 'none';

      const result = DOMUtils.isVisible(div);
      expect(result).toBe(false);
    });
  });

  describe('delay', () => {
    it('should delay for specified milliseconds', async () => {
      const start = Date.now();
      await DOMUtils.delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('dispatchEvent', () => {
    it('should dispatch events on elements', () => {
      const button = document.createElement('button');
      let eventFired = false;
      button.addEventListener('click', () => {
        eventFired = true;
      });
      document.body.appendChild(button);

      DOMUtils.dispatchEvent(button, 'click');
      expect(eventFired).toBe(true);
    });
  });
});
