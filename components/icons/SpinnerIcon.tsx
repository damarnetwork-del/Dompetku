import React from 'react';

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <style>
      {`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .spinner-path {
          animation: spin 1s linear infinite;
          transform-origin: center;
        }
      `}
    </style>
    <path
      className="spinner-path"
      clipRule="evenodd"
      d="M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zM1 .5A11.5 11.5 0 0112 0C18.351 0 23.5 5.149 23.5 11.5S18.351 23 12 23 1 18.351 1 11.5V.5z"
      fill="currentColor"
      fillRule="evenodd"
      opacity=".2"
    />
    <path
      className="spinner-path"
      d="M12 0C5.373 0 0 5.373 0 12h2.5C2.5 6.753 6.753 2.5 12 2.5V0z"
      fill="currentColor"
    />
  </svg>
);

export default SpinnerIcon;
