# AI Chatbot

A full-stack AI chatbot application built with Flask and React, using GPT-2 for natural language processing.

## Features

- Real-time chat interface
- Local GPT-2 model integration
- Server connection status monitoring
- Error handling and user feedback
- Responsive design

## Tech Stack

### Backend
- Flask
- Flask-CORS
- Transformers (Hugging Face)
- PyTorch

### Frontend
- React
- Axios
- Modern UI/UX

## Setup

### Backend Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-chatbot
```

2. Install Python dependencies:
```bash
pip install flask flask-cors torch transformers
```

3. Start the Flask server:
```bash
python app.py
```
The server will run on http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ai-chatbot
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```
The application will be available at http://localhost:3000

## Usage

1. Ensure both backend and frontend servers are running
2. Open http://localhost:3000 in your browser
3. Start chatting with the AI!

## Development

- Backend code is in `app.py`
- Frontend code is in the `ai-chatbot` directory
- Main React component is in `ai-chatbot/src/App.js`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
