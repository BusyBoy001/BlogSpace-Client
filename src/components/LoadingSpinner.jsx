import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className={`animate-spin rounded-full border-b-2 border-lightaccent dark:border-darkaccent ${sizeClasses[size]}`}></div>
            {text && (
                <p className="text-lightsecondary dark:text-darksecondary text-sm mt-2">{text}</p>
            )}
        </div>
    );
};

export default LoadingSpinner; 