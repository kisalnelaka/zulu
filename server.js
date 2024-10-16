const express = require('express');
const SFTPClient = require('ssh2-sftp-client');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON requests
app.use(express.static('public')); // Serve static files from 'public' folder

// Function to connect to the SFTP server with dynamic credentials
const connectSFTP = async (config) => {
  const sftp = new SFTPClient();
  await sftp.connect(config);
  return sftp;
};

// List files in a directory
app.post('/list', async (req, res) => {
  const { host, port, username, password, path = '/' } = req.body;
  try {
    const sftp = await connectSFTP({ host, port, username, password });
    const files = await sftp.list(path);
    res.json(files);
    sftp.end();
  } catch (error) {
    res.status(500).send('Error listing files: ' + error.message);
  }
});

// Upload a file
app.post('/upload', async (req, res) => {
  const { host, port, username, password, filename, content, path = '/' } = req.body;
  try {
    const sftp = await connectSFTP({ host, port, username, password });
    await sftp.put(Buffer.from(content, 'base64'), `${path}/${filename}`);
    res.send('File uploaded successfully');
    sftp.end();
  } catch (error) {
    res.status(500).send('Error uploading file: ' + error.message);
  }
});

// Download a file
app.post('/download', async (req, res) => {
  const { host, port, username, password, filename, path = '/' } = req.body;
  try {
    const sftp = await connectSFTP({ host, port, username, password });
    const fileContent = await sftp.get(`${path}/${filename}`);
    res.send(fileContent.toString('base64'));
    sftp.end();
  } catch (error) {
    res.status(500).send('Error downloading file: ' + error.message);
  }
});

// Delete a file
app.post('/delete', async (req, res) => {
  const { host, port, username, password, filename, path = '/' } = req.body;
  try {
    const sftp = await connectSFTP({ host, port, username, password });
    await sftp.delete(`${path}/${filename}`);
    res.send('File deleted successfully');
    sftp.end();
  } catch (error) {
    res.status(500).send('Error deleting file: ' + error.message);
  }
});

// Rename a file
app.post('/rename', async (req, res) => {
  const { host, port, username, password, oldPath, newPath } = req.body;
  try {
    const sftp = await connectSFTP({ host, port, username, password });
    await sftp.rename(oldPath, newPath);
    res.send('File renamed successfully');
    sftp.end();
  } catch (error) {
    res.status(500).send('Error renaming file: ' + error.message);
  }
});

// Move a file
app.post('/move', async (req, res) => {
  const { host, port, username, password, oldPath, newPath } = req.body;
  try {
    const sftp = await connectSFTP({ host, port, username, password });
    await sftp.rename(oldPath, newPath); // SFTP move operation
    res.send('File moved successfully');
    sftp.end();
  } catch (error) {
    res.status(500).send('Error moving file: ' + error.message);
  }
});

// Edit a file (save changes)
app.post('/edit', async (req, res) => {
  const { host, port, username, password, filename, content, path = '/' } = req.body;
  try {
    const sftp = await connectSFTP({ host, port, username, password });
    await sftp.put(Buffer.from(content, 'utf-8'), `${path}/${filename}`);
    res.send('File edited successfully');
    sftp.end();
  } catch (error) {
    res.status(500).send('Error editing file: ' + error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});