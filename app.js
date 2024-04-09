const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// Create a directory to store downloaded videos if it doesn't exist
const downloadDirectory = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDirectory)) {
  fs.mkdirSync(downloadDirectory);
}

app.get('/download', async (req, res) => {
  const videoURL = req.query.url;
  if (!videoURL || !ytdl.validateURL(videoURL)) {
    return res.status(400).send('Invalid URL');
  }

  try {
    let title = 'video';
    const info = await ytdl.getInfo(videoURL);
    title = info.videoDetails.title;

    const videoPath = path.join(downloadDirectory, `${title}.mp4`);
    ytdl(videoURL, {
      format: 'mp4',
    }).pipe(fs.createWriteStream(videoPath))
      .on('finish', () => {
        res.send(`Video downloaded successfully: ${title}`);
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).send('Error downloading video');
      });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error downloading video');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
