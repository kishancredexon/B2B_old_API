// Session storage implementation using in-memory object
module.exports =class SessionStore {
    constructor() {
      this.sessions = {};
    }
  
    // Method to create a new session
    createSession(sessionId, data) {
      this.sessions[sessionId] = data;
    }
  
    // Method to retrieve session data
    getSession(sessionId) {
      return this.sessions[sessionId];
    }
  
    // Method to update session data
    updateSession(sessionId, newData) {
      if (this.sessions[sessionId]) {
        this.sessions[sessionId] = { ...this.sessions[sessionId], ...newData };
      }
    }
  
    // Method to delete session
    deleteSession(sessionId) {
      delete this.sessions[sessionId];
    }
  }
  
//   // Example usage:
//   const sessionStore = new SessionStore();
  
//   // Create a new session
//   const sessionId = 'unique-session-id';
//   sessionStore.createSession(sessionId, { userId: '123', username: 'example_user' });
  
//   // Retrieve session data
//   const sessionData = sessionStore.getSession(sessionId);
//   console.log(sessionData); // { userId: '123', username: 'example_user' }
  
//   // Update session data
//   sessionStore.updateSession(sessionId, { loggedIn: true });
  
//   // Retrieve updated session data
//   const updatedSessionData = sessionStore.getSession(sessionId);
//   console.log(updatedSessionData); // { userId: '123', username: 'example_user', loggedIn: true }
  
//   // Delete session
//   sessionStore.deleteSession(sessionId);
//   console.log(sessionStore.getSession(sessionId)); // undefined
  