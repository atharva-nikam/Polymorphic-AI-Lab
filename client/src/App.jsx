// client/src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import UniversalLab from './components/UniversalLab';

function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    setLoading(true);
    
    // Add User Message locally
    const newChat = [...chat, { role: 'user', content: input }];
    setChat(newChat);
    
    try {
      const res = await axios.post('http://localhost:8000/chat', { message: input });
      
      // Add AI Response (Text or Widget)
      setChat([...newChat, { 
        role: 'ai', 
        type: res.data.type,
        payload: res.data.payload 
      }]);
    } catch (err) {
      console.error(err);
    }
    
    setLoading(false);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-4">
        {chat.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'SIMULATION' ? (
              <UniversalLab config={msg.payload} />
            ) : (
              <div className={`p-4 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white shadow-sm border'}`}>
                {msg.content || msg.payload}
              </div>
            )}
          </div>
        ))}
        
        {/* Input Area */}
        <div className="flex gap-2 mt-8">
          <input 
            className="flex-1 p-3 rounded-lg border border-slate-300 shadow-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask: 'Simulate kinetic energy' or 'calculate compound interest'"
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
