import React, { useState } from 'react';
import { Send, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { studyService } from '../../services/api';

export function SocraticMentorView({ session }) {
  const topic = session?.topic || 'Calvin Cycle';
  const notes = session?.notes || '';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome. Let's work through your understanding of ${topic}. What aspect would you like to examine first, or shall I pose a foundational question?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    const updatedMessages = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await studyService.sendMentorMessage({
        topic,
        notes,
        conversation: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        message: userText
      });

      if (res.data?.success && res.data?.data) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.data.reply || res.data.data }
        ]);
      } else if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.reply }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "Let's break this down further. What do you think happens in the next step of this reaction?" }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Let's focus on the core principles. How would you state the primary condition required for this process?" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto flex flex-col h-[640px]">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#172B3A]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
            SOCRATIC MENTOR
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#172B3A] font-display mt-0.5">
          Guided Dialogue: {topic}
        </h2>
        <p className="text-xs text-[#172B3A]/70 mt-0.5">
          "I'll guide you step-by-step toward deep conceptual reasoning."
        </p>
      </div>

      {/* Message History Viewport */}
      <div className="flex-1 overflow-y-auto p-4 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#172B3A]/50">
                {m.role === 'user' ? 'You' : 'StudyPilot Mentor'}
              </span>
            </div>
            <div
              className={`p-4 rounded-md text-sm leading-relaxed max-w-[85%] border ${
                m.role === 'user'
                  ? 'bg-[#172B3A] text-[#F5F1E8] border-[#172B3A]'
                  : 'bg-[#F5F1E8] text-[#172B3A] border-[#172B3A]/20'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#172B3A]/50 mb-1">
              StudyPilot Mentor
            </span>
            <div className="p-4 rounded-md text-xs italic bg-[#F5F1E8] border border-[#172B3A]/20 text-[#172B3A]/70">
              Formulating guided question...
            </div>
          </div>
        )}
      </div>

      {/* Text Input Box */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Respond or ask a question about this topic..."
          className="flex-1 px-4 py-3 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] text-sm text-[#172B3A] focus:outline-none focus:bg-[#F5F1E8]"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !inputMessage.trim()}
          className="px-6"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

export default SocraticMentorView;
