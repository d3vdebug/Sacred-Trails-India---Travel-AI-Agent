Sacred Trails India - AI Travel Voice Agent
Welcome to Sacred Trails India, an intelligent voice AI agent that revolutionizes travel planning and booking for destinations across India. Built with cutting-edge AI technology including Murf Falcon TTS for the TechFest IIT Bombay Murf AI Voice Agent Hackathon.

🎯 Project Overview
Sacred Trails India is your personal AI travel concierge that enables users to plan and book complete trips through natural voice conversations. Simply speak about your travel preferences, and our AI handles everything from destination selection to booking confirmations.

Key Features
🎤 Natural Voice Conversations: Speak normally about destinations, dates, and preferences
🏨 Smart Hotel Recommendations: AI suggests hotels based on your budget and preferences
🚗 Travel Mode Selection: Choose from bus, train, plane, or private car with real-time cost calculations
📧 Automated Confirmations: Instant booking confirmations with detailed email receipts
💾 Persistent Booking Management: View, modify, or cancel bookings using unique booking IDs
🌍 India-Focused: Specialized for travel within India with local knowledge
🚀 Technology Stack
Backend
Python with LiveKit Agents framework
Murf Falcon TTS - Ultra-fast, high-quality text-to-speech
Google Gemini LLM - Intelligent conversation processing
Deepgram STT - Accurate speech-to-text conversion
MongoDB - Robust booking and user data storage
SMTP Integration - Automated email confirmations
Frontend
React with Next.js for modern web interface
LiveKit for real-time voice interaction
TypeScript for type safety
Tailwind CSS for responsive design
📁 Project Structure
Sacred-Trails-India/
├── backend/                 # LiveKit Agents backend with Murf Falcon TTS
│   ├── src/
│   │   ├── agent.py         # Main AI travel agent logic
│   │   ├── mongodb_utils.py # Database utilities
│   │   └── hotels.json      # Hotel database for destinations
│   ├── start_mongodb.bat    # MongoDB startup (Windows)
│   ├── start_mongodb.sh     # MongoDB startup (Unix/Linux)
│   ├── docker-compose.yml   # MongoDB container setup
│   └── requirements...
├── frontend/                # React/Next.js voice interface
│   ├── components/
│   │   ├── app/            # Main application components
│   │   └── livekit/        # LiveKit integration components
│   ├── app/                # Next.js app directory
│   └── public/             # Static assets and destination images
├── start_app.sh            # Convenience script to start all services
└── README.md               # This file
🛠️ Quick Start Guide
Prerequisites
Ensure you have the following installed:

Python 3.9+ with uv package manager
Node.js 18+ with pnpm
Docker (for MongoDB)
Git
1. Clone the Repository
git clone <your-repository-url>
cd Sacred-Trails-India
2. Backend Setup
cd backend

# Install Python dependencies
uv sync

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your API keys:
# - LIVEKIT_URL
# - LIVEKIT_API_KEY  
# - LIVEKIT_API_SECRET
# - MURF_API_KEY (for Falcon TTS)
# - GOOGLE_API_KEY (for Gemini LLM)
# - DEEPGRAM_API_KEY (for Deepgram STT)
# - SMTP_EMAIL (for booking confirmations)
# - SMTP_PASSWORD (for booking confirmations)

# Download required AI models
uv run python src/agent.py download-files
3. Database Setup
Start MongoDB (Windows):

# Double-click or run in Command Prompt
start_mongodb.bat
Start MongoDB (Unix/Linux):

chmod +x start_mongodb.sh
./start_mongodb.sh
This will start MongoDB and MongoDB Express (web interface at http://localhost:8081).

4. Frontend Setup
cd frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with the same LiveKit credentials
5. Run the Application
Option A: One-Command Startup
# From root directory
chmod +x start_app.sh
./start_app.sh
Option B: Manual Startup
Terminal 1 - Start all services:

# Start MongoDB
cd backend
./start_mongodb.sh  # or start_mongodb.bat on Windows

# Terminal 2 - Start AI Agent
cd backend
uv run python src/agent.py dev

# Terminal 3 - Start Frontend  
cd frontend
pnpm dev
6. Access the Application
Open your browser and navigate to:

Frontend: http://localhost:3000
MongoDB Express: http://localhost:8081 (admin/admin)
🎮 How to Use Sacred Trails India
Sample Conversation Flow
Greeting: The AI agent introduces itself as "Nikhil" from Sacred Trails India
Destination Selection: "I want to plan a trip to Goa"
Travel Details: Provide dates, number of travelers, origin city
Preferences: Specify budget range and desired amenities
Travel Mode: Choose from available transport options with cost calculations
Hotel Selection: Review and select from AI-recommended hotels
Contact Details: Provide name, mobile number, and email
Booking Confirmation: Receive booking ID and email confirmation
Example Commands
"I want to travel to Mumbai from Delhi"
"My budget is medium, and I prefer hotels with Wi-Fi and breakfast"
"Show me travel options to Goa"
"What's my booking status for booking ID ABC12345?"
"Cancel my booking ABC12345"
🔧 Configuration
Environment Variables
Create a .env.local file in both backend and frontend directories:

# LiveKit Configuration
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# AI Services
MURF_API_KEY=your_murf_api_key
GOOGLE_API_KEY=your_google_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Email Configuration
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
Available Destinations
The system currently supports bookings for:

Mumbai, Delhi, Goa, Jaipur, Bangalore
Kerala, Kolkata, Hyderabad, Chennai
Shimla, Manali, Udaipur, Agra
📊 Features & Capabilities
🎯 Core Functionality
Destination Management: 12+ major Indian destinations
Hotel Database: Curated hotels with ratings, prices, and amenities
Travel Calculations: Real-time cost and duration estimates
Booking Persistence: MongoDB-powered data storage
Email Integration: Automated confirmation emails
🛡️ Technical Features
Murf Falcon TTS: Ultra-fast voice synthesis (200ms response time)
Context-Aware Conversations: Maintains conversation state throughout booking
Error Handling: Graceful handling of invalid inputs and system errors
Logging: Comprehensive logging for debugging and monitoring
Docker Support: Containerized MongoDB for easy deployment
🧪 Testing
Backend Tests
cd backend
uv run pytest
Email Testing
cd backend
uv run python test_email.py
MongoDB Connection Test
cd backend
uv run python test_mongodb.py
🐛 Troubleshooting
Common Issues
MongoDB Connection Failed

# Check if Docker is running
docker --version

# Check MongoDB container status
docker ps

# View MongoDB logs
docker-compose logs mongodb
TTS Not Working

Verify MURF_API_KEY in .env.local
Check Murf Falcon TTS service status
Review agent logs for TTS errors
Frontend Connection Issues

Ensure LiveKit credentials match between backend and frontend
Check browser console for WebRTC errors
Verify LIVEKIT_URL is accessible
🚀 Deployment
Production Deployment
Build Docker Images:

docker-compose -f docker-compose.prod.yml build
Deploy to Cloud:

Upload to Docker Hub or cloud registry
Configure environment variables on production server
Set up reverse proxy (nginx) for frontend
LiveKit Cloud Deployment
For production, consider deploying to LiveKit Cloud:

Managed LiveKit infrastructure
Built-in scaling and monitoring
Simplified credential management
🤝 Contributing
This project was created for the Murf AI Voice Agent Hackathon. To contribute:

Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Create a Pull Request
📄 License
This project is licensed under the MIT License. See individual LICENSE files in backend and frontend directories for details.

🙏 Acknowledgments
Murf.ai for providing Falcon TTS API for this hackathon
LiveKit for the excellent Agents framework
TechFest IIT Bombay for organizing the hackathon
Google for Gemini LLM and Deepgram for STT services
📞 Support
For issues and support:

Check the troubleshooting section above
Review logs in backend/agent_debug.log
Consult LiveKit and Murf documentation
Open an issue in this repository
Built with ❤️ for the TechFest IIT Bombay Murf AI Voice Agent Hackathon

Experience the future of travel planning with Sacred Trails India - where AI meets wanderlust!
