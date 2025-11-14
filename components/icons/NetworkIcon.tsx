import React from 'react';

const NetworkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9 9 9 0 01-9 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6m-6 4h6m-1-8v8m-4-8v8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12.5h19M12.5 2.5v19" />
  </svg>
);

export default NetworkIcon;
