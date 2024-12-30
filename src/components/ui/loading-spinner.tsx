import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center w-screen md:w-[75vw] min-h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
    );
};

export default LoadingSpinner;