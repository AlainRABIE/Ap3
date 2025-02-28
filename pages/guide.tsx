import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import MenubarRe from "../components/ui/MenuBarRe";

const Guide = () => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pdfUrl = '/guide.pdf'; 

  return (
    <div className="flex flex-col min-h-screen">
      <MenubarRe /> 

      <div className="flex-grow p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6">Guide d&apos;utilisation</h1>

        <div className="flex gap-4 mb-4">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Ouvrir le guide
          </a>
          <a
            href={pdfUrl}
            download="gide.pdf"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Télécharger
          </a>
        </div>

        <div className="pdf-container border shadow-lg rounded-lg" style={{ height: 'calc(100vh - 250px)' }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        </div>
      </div>
    </div>
  );
};

export default Guide;
