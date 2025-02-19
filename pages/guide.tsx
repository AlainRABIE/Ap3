// import React from 'react';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// const Guide = () => {
//   const defaultLayoutPluginInstance = defaultLayoutPlugin();

//   return (
//     <div className="relative p-8">
//       <h1 className="text-4xl font-bold mb-6">Guide d'utilisation</h1>
//       <div className="absolute top-4 right-4">
//         <a
//           href="/guide"
//           className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
//         >
//           Afficher le guide
//         </a>
//       </div>
//       <div className="pdf-container" style={{ height: '750px' }}>
//         <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js`}>
//           <Viewer
//             fileUrl="/path/to/your/guide.pdf"
//             plugins={[defaultLayoutPluginInstance]}
//           />
//         </Worker>
//       </div>
//     </div>
//   );
// };

// export default Guide;