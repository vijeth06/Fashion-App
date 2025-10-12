# Virtual Fashion Try-On App

A modern web application that allows users to virtually try on clothing items using their own photos or webcam. Built with React, Tailwind CSS, and the WebRTC API. The enhanced try-on experience uses an AI Pose pipeline (MediaPipe/TensorFlow.js) and a high-performance canvas overlay system.

## Features

- 📸 Upload your photo or use your device's camera
- 👗 Browse a catalog of clothing items
- 🎨 Try on items with real-time overlay
- 🔄 Adjust position, scale, and rotation of clothing items
- 💾 Save your favorite outfits
- 📥 Download your virtual try-on looks
- 📱 Fully responsive design

## Live Demo

[Coming Soon] Deploy your own instance or check out the live demo. Navigate to `/enhanced-tryon` for the latest experience.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or Yarn
- Modern web browser with camera access
- Firebase account (for authentication and database)

### Firebase Setup

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication:
   - Go to the Authentication section
   - Click on "Get started"
   - Enable "Email/Password" and "Google" sign-in methods
3. Set up Firestore Database:
   - Go to the Firestore Database section
   - Click "Create database"
   - Start in test mode for development
4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - If you don't have a web app, register one
   - Copy the Firebase configuration object

### Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the `.env` file with your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/virtual-fashion-tryon.git
   cd virtual-fashion-tryon
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Usage

1. **Home Page**:
   - Get started by clicking "Try It Now"
   - Learn how the app works with the step-by-step guide

2. **Catalog**:
   - Browse available clothing items
   - Filter by category
   - Click "Try It On" to select an item

3. **Virtual Try-On (Enhanced)**:
   - Open the Enhanced Try-On page at `/enhanced-tryon`
   - Choose Live Try-On (webcam) or Upload Photo
   - Click Start Try-On to begin pose detection
   - Add clothing items and download your composite image

4. **Favorites**:
   - View your saved outfits
   - Remove items you no longer want

## Built With

- [React](https://reactjs.org/) - Frontend library
- [React Router](https://reactrouter.com/) - Routing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Webcam](https://github.com/mozmorris/react-webcam) - Webcam integration
- [HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - Image manipulation

## Project Structure

```
src/
├── components/               # Reusable UI components
│   ├── VirtualTryOnComponent.jsx  # Main try-on orchestrator (webcam/upload + overlay + export)
│   └── ...
├── services/                 # Pose + overlay + export services
│   ├── PoseDetectionService.js
│   ├── ClothingOverlaySystem.js
│   └── ExportService.js
├── data/                     # Clothing catalog
│   └── clothingData.js
├── pages/                    # Page components
│   ├── EnhancedTryOn.jsx     # Enhanced try-on page using VirtualTryOnComponent
│   └── ...
├── App.js                    # Main application component
└── index.js                  # Application entry point
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Create React App](https://create-react-app.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Icons](https://react-icons.github.io/react-icons/)

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/vijeth06/Fashion-App](https://github.com/vijeth06/Fashion-App)

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
