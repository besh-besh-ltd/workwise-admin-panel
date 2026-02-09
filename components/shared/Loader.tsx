import React, { CSSProperties } from 'react';

const loaderContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
};

const spinnerStyle: CSSProperties = {
    width: '50px',
    height: '50px',
    border: '6px solid #f3f3f3',
    borderTop: '6px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px'
};

const textStyle: CSSProperties = {
    fontSize: '1.2rem',
    color: '#555'
};

const Loader: React.FC = () => {
    return (
        <div style={loaderContainerStyle}>
            <div style={spinnerStyle}></div>
            <p style={textStyle}>Loading...</p>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default Loader;
