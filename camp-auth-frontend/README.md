# CAMP Auth Frontend

A standalone authentication frontend demo for the Cloud Asset Management Platform (CAMP). This project provides a fully functional login page with local credential validation, built with HTML, custom CSS (matching main app theme), and vanilla JavaScript.

## Features

- **Modern UI Design**: Clean, responsive login interface matching CAMP design system
- **Local Validation**: Validates credentials against hardcoded demo values
- **User Feedback**: Success and error messages with smooth animations
- **Loading States**: Visual feedback during authentication process
- **Session Management**: Basic localStorage-based session handling
- **Theme Consistency**: Perfectly matches main CAMP frontend dark theme
- **Redirection**: Automatically redirects to main app after successful login
- **Fully Functional**: Works completely offline without any backend dependencies

## Demo Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
camp-auth-frontend/
├── index.html          # Main login page with form
├── styles.css          # Custom CSS styles and animations
├── app.js              # JavaScript validation and logic
└── README.md           # This file
```

## How to Run Locally

### Method 1: Direct File Opening (Easiest)

1. Navigate to the `camp-auth-frontend` folder
2. Double-click on `index.html` to open it in your default web browser
3. The login page will load and be fully functional

### Method 2: Local HTTP Server (Recommended)

For the best experience, especially if you plan to make modifications:

#### Using Python (if installed):

```bash
# Navigate to the project directory
cd camp-auth-frontend

# Start a local HTTP server
python -m http.server 8080

# Or for Python 2.x
python -m SimpleHTTPServer 8080
```

#### Using Node.js (if installed):

```bash
# Install http-server globally (if not already installed)
npm install -g http-server

# Navigate to the project directory
cd camp-auth-frontend

# Start the server
http-server -p 8080
```

#### Using VS Code Live Server:

1. Open the `camp-auth-frontend` folder in VS Code
2. Install the "Live Server" extension from the marketplace
3. Right-click on `index.html` and select "Open with Live Server"

Once the server is running, open your browser and navigate to:
- `http://localhost:8080` (or whatever port you chose)

## Usage

1. Open the login page in your web browser
2. Enter the demo credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Sign in" to authenticate
4. You'll see a success message followed by a confirmation screen
5. Try incorrect credentials to see error handling in action

## Technical Implementation

### Authentication Flow

1. **Form Submission**: The login form captures username and password
2. **Client-side Validation**: Inputs are validated for presence and format
3. **Credential Verification**: Hardcoded credentials are compared against input
4. **Response Handling**: Success/error messages are displayed with animations
5. **Session Storage**: Successful login stores user data in localStorage
6. **State Management**: Loading states and visual feedback throughout

### Key Features

- **Input Validation**: Checks for empty fields and provides immediate feedback
- **Security Considerations**: Password field is cleared after failed attempts
- **Visual Feedback**: Loading spinners, shake animations for errors, fade transitions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Proper form labels, semantic HTML, and keyboard navigation

### Browser Compatibility

This project works on all modern browsers:
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Opera

## Future Enhancements

This demo is designed to be easily extended for production use:

1. **Backend Integration**: Replace local validation with API calls to your authentication service
2. **Token Management**: Implement JWT or OAuth token handling
3. **Multi-factor Authentication**: Add 2FA support
4. **User Registration**: Extend to include user signup functionality
5. **Password Recovery**: Add forgot password functionality
6. **Role-based Access**: Implement different user roles and permissions

## Integration with CAMP Backend

To connect this frontend with the actual CAMP backend:

1. Update the `validateCredentials` method in `app.js` to make API calls:
```javascript
async validateCredentials(username, password) {
    try {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}
```

2. Handle JWT tokens in the response
3. Update the redirect logic to navigate to the actual dashboard

## Development

To modify or extend this project:

1. **Styling**: Edit `styles.css` for custom animations and styles
2. **Logic**: Modify `app.js` for authentication behavior
3. **Structure**: Update `index.html` for form changes or new elements
4. **Configuration**: Adjust Tailwind CSS classes directly in the HTML

## Security Notes

- This is a demo application with hardcoded credentials
- Never use hardcoded credentials in production
- Always use HTTPS for authentication in production
- Implement proper password hashing and secure token management
- Consider CSRF protection and other security measures

## License

This project is part of the Cloud Asset Management Platform and follows the same licensing terms.
