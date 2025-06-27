class NxtWaveChatbot {
    constructor() {
        this.currentStep = 0;
        this.leadData = {};
        this.chatMessages = document.getElementById('chatMessages');
        this.inputContainer = document.getElementById('inputContainer');
        this.inputField = document.getElementById('inputField');
        this.submitButton = document.getElementById('submitButton');
        this.progressFill = document.getElementById('progressFill');
        
        this.steps = [
            { 
                message: "Hi there! 👋 Welcome to NxtWave's Free Career Kickstarter Webinar! I'm here to help you discover the perfect tech career path. Let's get started!",
                type: 'welcome'
            },
            {
                message: "First, could you please tell me your name?",
                type: 'input',
                field: 'name'
            },
            {
                message: "Great to meet you, {name}! 📱 What's your phone number?",
                type: 'input',
                field: 'phone'
            },
            {
                message: "Perfect! 📧 And your email address?",
                type: 'input',
                field: 'email'
            },
            {
                message: "Now let's learn about your background. Are you currently a student or working professional?",
                type: 'options',
                field: 'status',
                options: ['Student', 'Working Professional']
            },
            {
                message: "What's your educational/professional background?",
                type: 'options',
                field: 'background',
                options: ['Tech', 'Non-Tech']
            },
            {
                message: "Excellent! 🎯 Which career path interests you the most?",
                type: 'options',
                field: 'careerPath',
                options: ['Full Stack Development', 'Data Science', 'AI-ML', 'Cybersecurity']
            },
            {
                message: "Are you ready to start your tech journey in the next 30 days?",
                type: 'options',
                field: 'readyToStart',
                options: ['Yes, absolutely!', 'Maybe in 2-3 months', 'Not sure yet', 'Not interested']
            }
        ];
        
        this.init();
    }

    init() {
        this.submitButton.addEventListener('click', () => this.handleInput());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleInput();
        });
        
        setTimeout(() => this.showNextStep(), 1000);
    }

    updateProgress() {
        const progress = ((this.currentStep) / this.steps.length) * 100;
        this.progressFill.style.width = progress + '%';
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        return new Promise(resolve => {
            setTimeout(() => {
                typingDiv.remove();
                resolve();
            }, 1500);
        });
    }

    async addBotMessage(message) {
        await this.showTypingIndicator();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.textContent = message;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = message;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showOptions(options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options-container';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.addEventListener('click', () => this.handleOptionClick(option));
            optionsDiv.appendChild(button);
        });
        
        this.chatMessages.appendChild(optionsDiv);
        this.scrollToBottom();
    }

    showInputField() {
        this.inputContainer.style.display = 'block';
        this.inputField.focus();
    }

    hideInputField() {
        this.inputContainer.style.display = 'none';
        this.inputField.value = '';
    }

    handleInput() {
        const value = this.inputField.value.trim();
        if (!value) return;

        const currentStepData = this.steps[this.currentStep];
        
        // Validate input based on field type
        if (currentStepData.field === 'email' && !this.isValidEmail(value)) {
            this.addBotMessage("Please enter a valid email address.");
            return;
        }
        
        if (currentStepData.field === 'phone' && !this.isValidPhone(value)) {
            this.addBotMessage("Please enter a valid phone number (10 digits).");
            return;
        }

        this.addUserMessage(value);
        this.leadData[currentStepData.field] = value;
        this.hideInputField();
        
        this.currentStep++;
        setTimeout(() => this.showNextStep(), 1000);
    }

    handleOptionClick(option) {
        const currentStepData = this.steps[this.currentStep];
        
        // Handle exit conditions
        if (option === 'Not interested' || option === 'Maybe later') {
            this.addUserMessage(option);
            setTimeout(() => {
                this.addBotMessage("Thank you for your time! If you change your mind, feel free to reach out. Have a great day! 👋");
            }, 1000);
            return;
        }

        this.addUserMessage(option);
        this.leadData[currentStepData.field] = option;
        
        // Remove options buttons
        const optionsContainer = document.querySelector('.options-container');
        if (optionsContainer) {
            optionsContainer.remove();
        }
        
        this.currentStep++;
        setTimeout(() => this.showNextStep(), 1000);
    }

    async showNextStep() {
        this.updateProgress();
        
        if (this.currentStep >= this.steps.length) {
            await this.processQualifiedLead();
            return;
        }

        const step = this.steps[this.currentStep];
        let message = step.message;
        
        // Replace placeholders with actual data
        Object.keys(this.leadData).forEach(key => {
            message = message.replace(`{${key}}`, this.leadData[key]);
        });

        await this.addBotMessage(message);

        if (step.type === 'options') {
            this.showOptions(step.options);
        } else if (step.type === 'input') {
            this.showInputField();
        } else if (step.type === 'welcome') {
            this.currentStep++;
            setTimeout(() => this.showNextStep(), 2000);
        }
    }

    async processQualifiedLead() {
        // Generate conditional message based on responses
        const conditionalMessage = this.generateConditionalMessage();
        await this.addBotMessage(conditionalMessage);
        
        // Determine if lead is qualified
        const isQualified = this.isLeadQualified();
        
        if (isQualified) {
            this.leadData.status = "Hot Lead";
            this.leadData.source = "Webinar Bot";
            
            await this.sendEmailNotification();
            
            setTimeout(async () => {
                await this.addBotMessage("🎉 Congratulations! You're qualified for our program. You'll receive detailed information about the webinar via email shortly. Our team will also contact you within 24 hours!");
                this.showSuccessMessage();
            }, 2000);
        } else {
            setTimeout(async () => {
                await this.addBotMessage("Thank you for your interest! While you may not be ready right now, we encourage you to explore our free resources and consider joining us when you're ready. 📚");
            }, 2000);
        }
    }

    generateConditionalMessage() {
        const { status, background, careerPath } = this.leadData;
        
        if (status === 'Student' && background === 'Tech') {
            return `Great! You're a tech student interested in ${careerPath}. You're eligible for our accelerated learning track! 🚀`;
        } else if (status === 'Working Professional' && background === 'Non-Tech') {
            return `Awesome! Many professionals like you have successfully transitioned to ${careerPath}. Our program is designed specifically for career changers! 💼`;
        } else if (status === 'Student' && background === 'Non-Tech') {
            return `Perfect timing! As a student, you have the flexibility to dive deep into ${careerPath}. We'll help you build a strong foundation! 🎓`;
        } else {
            return `Excellent! With your tech background, you're well-positioned to excel in ${careerPath}. Let's take your skills to the next level! 🔥`;
        }
    }

    isLeadQualified() {
        const { readyToStart } = this.leadData;
        return readyToStart === 'Yes, absolutely!' || readyToStart === 'Maybe in 2-3 months';
    }

    async sendEmailNotification() {
        // Simulate email sending with a visual notification
        const notification = document.createElement('div');
        notification.className = 'email-notification';
        notification.innerHTML = `
            <strong>📧 Lead Data Sent!</strong><br>
            <pre>${JSON.stringify(this.leadData, null, 2)}</pre>
        `;
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Log the data that would be sent via email
        console.log('Qualified Lead Data:', JSON.stringify(this.leadData, null, 2));
        
        // Here you would typically make an API call to your backend
        // Example:
        // try {
        //     const response = await fetch('/api/send-lead-email', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(this.leadData)
        //     });
        //     
        //     if (response.ok) {
        //         console.log('Email sent successfully');
        //     } else {
        //         console.error('Failed to send email');
        //     }
        // } catch (error) {
        //     console.error('Error sending email:', error);
        // }
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <h3>🎉 Registration Successful!</h3>
            <p>Welcome to NxtWave, ${this.leadData.name}!</p>
            <p>Check your email for webinar details.</p>
        `;
        this.chatMessages.appendChild(successDiv);
        this.scrollToBottom();
        this.progressFill.style.width = '100%';
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^\d{10}$/.test(phone.replace(/\D/g, ''));
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Configuration object for easy customization
const ChatbotConfig = {
    // Email API endpoint (replace with your actual endpoint)
    emailApiEndpoint: '/api/send-lead-email',
    
    // Timing configurations
    typingDelay: 1500,
    messageDelay: 1000,
    welcomeDelay: 2000,
    
    // Validation patterns
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phonePattern: /^\d{10}$/,
    
    // Lead qualification criteria
    qualifyingAnswers: ['Yes, absolutely!', 'Maybe in 2-3 months'],
    
    // Exit keywords
    exitKeywords: ['Not interested', 'Maybe later']
};

// Utility functions
const ChatbotUtils = {
    // Format phone number
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    
    // Generate unique lead ID
    generateLeadId: () => {
        return 'LEAD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Get current timestamp
    getTimestamp: () => {
        return new Date().toISOString();
    },
    
    // Local storage helpers (for development/testing)
    saveLeadLocally: (leadData) => {
        const leads = JSON.parse(localStorage.getItem('nxtwave_leads') || '[]');
        leads.push({
            ...leadData,
            id: ChatbotUtils.generateLeadId(),
            timestamp: ChatbotUtils.getTimestamp()
        });
        localStorage.setItem('nxtwave_leads', JSON.stringify(leads));
    },
    
    getLocalLeads: () => {
        return JSON.parse(localStorage.getItem('nxtwave_leads') || '[]');
    }
};

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NxtWaveChatbot();
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NxtWaveChatbot, ChatbotConfig, ChatbotUtils };
}