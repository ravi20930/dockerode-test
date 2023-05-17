require('dotenv').config();
const Docker = require('dockerode');
const docker = new Docker();
const fs = require('fs');
const axios = require('axios');

// Authenticate with the Docker registry
const authConfig = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};

const imageName = process.env.IMAGE_NAME;

// docker.pull(imageName, {'authconfig': authConfig}, (err, stream) => {
//   if (err) {
//     console.error('Failed to authenticate and pull the image:', err);
//     return;
//   }

//   // Monitor the pull progress
//   docker.modem.followProgress(stream, onFinished, onProgress);

//   function onProgress(event) {
//     // console.log('Pull progress:', event);
//   }

//   function onFinished(err, output) {
//     if (err) {
//       console.error('Failed to pull the image:', err);
//       return;
//     }

//     console.log('Image pulled successfully:', output);
//   }
// });
const image = docker.getImage(imageName);

image.inspect((err, data) => {
  if (err) {
    console.error('Failed to fetch image details:', err);
    return;
  }

  const {
    Id,
    RepoTags,
    Created,
    Size,
    VirtualSize,
    Architecture,
    Os,
  } = data;

  console.log('Image ID:', Id);
  console.log('Tags:', RepoTags);
  console.log('Created:', Created);
  console.log('Size:', Size);
  console.log('Virtual Size:', VirtualSize);
  console.log('Architecture:', Architecture);
  console.log('Operating System:', Os);
});
image.history((err, history) => {
  if (err) {
    console.error('Failed to fetch image build history:', err);
    return;
  }

  // Iterate over the build history
  history.forEach((item, index) => {
    console.log(`Layer ${index + 1}:`);
    console.log('Created:', new Date(item.Created * 1000).toLocaleString());
    console.log('Author:', item.Author);
    console.log('Size:', item.Size);
    console.log('Comment:', item.Comment);
    console.log('Command:', item.CreatedBy);
    console.log('---');
  });
});
image.history((err, history) => {
  if (err) {
    console.error('Failed to fetch image build history:', err);
    return;
  }

  // Map the history items to a simplified object format
  const buildHistory = history.map((item, index) => ({
    layer: index + 1,
    created: new Date(item.Created * 1000).toLocaleString(),
    author: item.Author,
    size: item.Size,
    comment: item.Comment,
    command: item.CreatedBy,
  }));

  const json = JSON.stringify(buildHistory, null, 2);

  fs.writeFile('build-history.json', json, (err) => {
    if (err) {
      console.error('Failed to save build history:', err);
      return;
    }
    console.log('Build history saved successfully');
  });
});
