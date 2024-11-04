import React from 'react';

const loaderContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
};

const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: '6px solid #f3f3f3',
    borderTop: '6px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px'
};

const textStyle = {
    fontSize: '1.2rem',
    color: '#555'
};

const Loader = () => {
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