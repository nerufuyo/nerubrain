class ComponentDetector {
    constructor() {
        this.isActive = false;
        this.components = new Set();
        this.questions = new Set();
        this.observer = null;
        this.serverUrl = 'http://127.0.0.1:8000';
        this.processedQuestions = new Map(); // Track processed questions with timestamps
        this.questionCooldown = 10000; // 10 seconds cooldown between same questions
        this.initialized = false;
        this.initializeDetection();
    }

    initializeDetection() {
        this.setupMutationObserver();
        this.scanExistingContent();
        this.setupMessageListener();
        
        // Mark as initialized after a short delay to avoid processing initial content
        setTimeout(() => {
            this.initialized = true;
            console.log('nerubrain: Component detection initialized');
        }, 1000);
    }

    setupMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            if (!this.isActive) return;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.analyzeElement(node);
                    }
                });
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true
        });
    }

    scanExistingContent() {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => this.analyzeElement(element));
        this.updateStats();
    }

    analyzeElement(element) {
        if (!element.tagName) return;

        // Detect component types
        const componentType = this.identifyComponent(element);
        if (componentType) {
            this.components.add({
                type: componentType,
                element: element,
                text: element.textContent?.trim() || '',
                html: element.outerHTML,
                timestamp: Date.now()
            });
        }

        // Detect questions
        const text = element.textContent?.trim() || '';
        if (this.isQuestion(text)) {
            this.questions.add({
                question: text,
                element: element,
                context: this.getElementContext(element),
                timestamp: Date.now()
            });
            
            // Check cooldown before automatically answering (only if active and initialized)
            if (this.isActive && this.initialized && this.shouldProcessQuestion(text)) {
                this.handleQuestion(text, element);
            } else if (!this.isActive) {
                console.log('nerubrain: Question detected but extension is inactive');
            } else if (!this.initialized) {
                console.log('nerubrain: Question detected but extension is not initialized yet');
            }
        }
    }

    identifyComponent(element) {
        const tag = element.tagName.toLowerCase();
        const className = element.className || '';
        const id = element.id || '';
        const text = element.textContent?.trim() || '';

        // Button detection
        if (tag === 'button' || 
            className.includes('btn') || 
            className.includes('button') ||
            element.type === 'button') {
            return 'button';
        }

        // Form detection
        if (tag === 'form' || 
            tag === 'input' || 
            tag === 'textarea' || 
            tag === 'select') {
            return 'form';
        }

        // Navigation detection
        if (tag === 'nav' || 
            className.includes('nav') || 
            className.includes('menu')) {
            return 'navigation';
        }

        // Modal detection
        if (className.includes('modal') || 
            className.includes('dialog') || 
            className.includes('popup')) {
            return 'modal';
        }

        // Card detection
        if (className.includes('card') || 
            className.includes('panel')) {
            return 'card';
        }

        // Question container detection
        if (text.includes('?') && text.length > 10) {
            return 'question-container';
        }

        return null;
    }

    isQuestion(text) {
        if (!text || text.length < 10 || text.length > 300) return false;
        
        // Filter out code, scripts, and common non-question content
        if (text.includes('function') || 
            text.includes('var ') || 
            text.includes('window.') ||
            text.includes('document.') ||
            text.includes('{') ||
            text.includes('javascript') ||
            text.includes('StackExchange') ||
            text.includes('addEventListener') ||
            text.includes('console.') ||
            text.includes('return ') ||
            text.includes('const ') ||
            text.includes('let ') ||
            text.includes('<div') ||
            text.includes('</div>') ||
            text.includes('class=') ||
            text.includes('id=')) {
            return false;
        }
        
        // Filter out common UI text that ends with ?
        if (text.match(/^(Search|Filter|Sort|View|Edit|Delete|Save|Cancel|Close|Open|Submit)\s*\?/i)) {
            return false;
        }
        
        // Must end with question mark OR start with clear question words
        const endsWithQuestion = /\?$/;
        const startsWithQuestion = /^(what|how|why|when|where|who|which|can|could|would|should|do|does|did|is|are|was|were)\s+/i;
        
        // Additional question indicators (but must be meaningful content)
        const hasQuestionWords = /\b(question|ask|answer|solve|explain|help|problem)\b/i;
        
        // Must either end with ? OR start with question word + have reasonable length
        if (endsWithQuestion.test(text)) {
            return true;
        }
        
        if (startsWithQuestion.test(text) && text.length > 20) {
            return true;
        }
        
        // For question indicator words, be more strict
        if (hasQuestionWords.test(text) && text.length > 30 && /\?/.test(text)) {
            return true;
        }
        
        return false;
    }

    getElementContext(element) {
        const context = {
            parentText: element.parentElement?.textContent?.trim() || '',
            siblings: Array.from(element.parentElement?.children || [])
                .map(el => el.textContent?.trim())
                .filter(text => text && text.length > 0),
            url: window.location.href,
            title: document.title
        };
        return context;
    }

    async handleQuestion(question, element) {
        try {
            const context = this.getElementContext(element);
            const response = await this.sendToAI(question, context);
            
            if (response && response.answer) {
                this.displayAnswer(response.answer, element);
            }
        } catch (error) {
            console.error('Error handling question:', error);
        }
    }

    async sendToAI(question, context) {
        try {
            const response = await fetch(`${this.serverUrl}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question,
                    context: context,
                    url: window.location.href
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending to AI:', error);
            return null;
        }
    }

    displayAnswer(answer, questionElement) {
        // Create answer bubble
        const answerBubble = document.createElement('div');
        answerBubble.className = 'neuralbrain-answer';
        answerBubble.innerHTML = `
            <div class="neuralbrain-answer-header">
                nerubrain Answer
                <button class="neuralbrain-close">×</button>
            </div>
            <div class="neuralbrain-answer-content">${answer}</div>
        `;

        // Position near the question
        const rect = questionElement.getBoundingClientRect();
        answerBubble.style.position = 'fixed';
        answerBubble.style.top = `${rect.bottom + 10}px`;
        answerBubble.style.left = `${rect.left}px`;
        answerBubble.style.zIndex = '10000';

        document.body.appendChild(answerBubble);

        // Add close functionality
        answerBubble.querySelector('.neuralbrain-close').addEventListener('click', () => {
            answerBubble.remove();
        });

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (answerBubble.parentNode) {
                answerBubble.remove();
            }
        }, 30000);
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'toggle':
                    this.isActive = !this.isActive;
                    sendResponse({ active: this.isActive });
                    break;
                case 'getStats':
                    sendResponse({
                        components: this.components.size,
                        questions: this.questions.size,
                        active: this.isActive
                    });
                    break;
                case 'analyze':
                    this.scanExistingContent();
                    sendResponse({ success: true });
                    break;
            }
        });
    }

    updateStats() {
        chrome.runtime.sendMessage({
            action: 'updateStats',
            stats: {
                components: this.components.size,
                questions: this.questions.size,
                active: this.isActive
            }
        });
    }

    start() {
        this.isActive = true;
        this.updateStats();
    }

    stop() {
        this.isActive = false;
        this.updateStats();
    }

    shouldProcessQuestion(question) {
        const now = Date.now();
        const questionKey = question.toLowerCase().trim();
        
        // Check if we've processed this question recently
        if (this.processedQuestions.has(questionKey)) {
            const lastProcessed = this.processedQuestions.get(questionKey);
            if (now - lastProcessed < this.questionCooldown) {
                console.log('nerubrain: Question skipped (cooldown active):', questionKey.substring(0, 50) + '...');
                return false;
            }
        }
        
        // Clean up old entries (older than 1 hour)
        const oneHourAgo = now - (60 * 60 * 1000);
        for (const [key, timestamp] of this.processedQuestions.entries()) {
            if (timestamp < oneHourAgo) {
                this.processedQuestions.delete(key);
            }
        }
        
        // Mark this question as processed
        this.processedQuestions.set(questionKey, now);
        console.log('nerubrain: Processing question:', questionKey.substring(0, 50) + '...');
        return true;
    }
}

// Initialize detector but don't start automatically
const detector = new ComponentDetector();

// Only start when extension is explicitly activated
// The popup will send a toggle message to activate

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    detector.stop();
});
