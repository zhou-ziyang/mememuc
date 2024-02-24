// import { useState } from "react";
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
//
// const VideoGenerator = () => {
//   const [videoCreated, setVideoCreated] = useState(false);
//   const imagePaths = ['path/to/image1.jpg', 'path/to/image2.jpg', 'path/to/image3.jpg'];
//   const outputVideoPath = 'path/to/output.mp4';
//
//   const ffmpeg = createFFmpeg({ log: true });
//
//   const loadFfmpeg = async () => {
//     await ffmpeg.load();
//   }
//
//   const generateVideoFromImages = async (imagePaths, outputVideoPath) => {
//     await loadFfmpeg();
//
//     for(let i = 0; i < imagePaths.length; i++){
//       ffmpeg.FS('writeFile', `input${i}.jpg`, await fetchFile(imagePaths[i]));
//     }
//
//     await ffmpeg.run('-r', '24', '-i', 'input%d.jpg', '-vcodec', 'mpeg4', '-y', 'output.mp4');
//
//     const data = ffmpeg.FS('readFile', 'output.mp4');
//
//     return new Blob([data.buffer], { type: 'video/mp4' });
//   }
//
//   const handleButtonClick = () => {
//     generateVideoFromImages(imagePaths, outputVideoPath)
//         .then((blob) => {
//           console.log('Video created successfully');
//           const videoURL = URL.createObjectURL(blob);
//           setVideoURL(videoURL);
//           setVideoCreated(true);
//         })
//         .catch((error) => console.error('Error creating video:', error));
//   }
//
//   const [videoURL, setVideoURL] = useState('');
//
//   return (
//       <div>
//         <button onClick={handleButtonClick}>Generate Video</button>
//         {videoCreated && (
//             <video controls>
//               <source src={videoURL} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//         )}
//       </div>
//   );
// }
//
// export default VideoGenerator;