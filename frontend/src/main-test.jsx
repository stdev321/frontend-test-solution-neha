import React from 'react';
import ReactDOM from 'react-dom/client';

function TestApp() {
  return (
    <div style={{padding: '20px'}}>
      <h1>Test App - VirtualMD</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TestApp />);