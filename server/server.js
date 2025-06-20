const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active polls and history
const activePolls = {};
const pollHistory = {};

app.use(cors());
app.use(express.json());

// Teacher login endpoint
app.post('/teacher-login', (req, res) => {
  const username = `teacher_${Date.now()}`;
  pollHistory[username] = []; // Initialize history for this teacher
  res.json({ username });
});

// Get poll history
app.get('/polls/:username', (req, res) => {
  const { username } = req.params;
  res.json({ data: pollHistory[username] || [] });
});

io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle poll creation
  socket.on('createPoll', (pollData) => {
    try {
      const pollId = `poll_${Date.now()}`;
      
      // Format options with votes
      const optionsWithVotes = pollData.options.map(opt => ({
        ...opt,
        votes: 0,
        _id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      const newPoll = {
        ...pollData,
        _id: pollId,
        options: optionsWithVotes,
        createdAt: new Date(),
        totalVotes: 0
      };

      // Store in active polls and history
      activePolls[pollId] = newPoll;
      
      if (!pollHistory[pollData.teacherUsername]) {
        pollHistory[pollData.teacherUsername] = [];
      }
      pollHistory[pollData.teacherUsername].push(newPoll);

      // Broadcast to all clients
      io.emit('pollCreated', newPoll);
      console.log('Poll created and broadcasted:', pollId);
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  });

  // Handle vote submission
  socket.on('submitVote', ({ pollId, optionId }) => {
    const poll = activePolls[pollId];
    if (poll) {
      const option = poll.options.find(opt => opt._id === optionId);
      if (option) {
        option.votes += 1;
        poll.totalVotes += 1;
        
        // Calculate percentages - FIXED THIS SECTION
        const results = poll.options.reduce((acc, opt) => {
          acc[opt._id] = {
            text: opt.text,
            votes: opt.votes,
            percentage: poll.totalVotes > 0 
              ? Math.round((opt.votes / poll.totalVotes) * 100)
              : 0
          };
          return acc;
        }, {});

        io.emit('pollResults', {
          pollId,
          results,
          totalVotes: poll.totalVotes
        });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});