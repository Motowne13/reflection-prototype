import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import InsightCapture from './InsightCapture';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ReflectionInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState(1);
  const [finalInsight, setFinalInsight] = useState('');
  const [pendingInsight, setPendingInsight] = useState('');
  const [insightConfirmed, setInsightConfirmed] = useState(false);

  const stages = [
    { number: 1, label: 'Share a moment' },
    { number: 2, label: 'Explore what energized you' },
    { number: 3, label: 'Notice patterns' },
    { number: 4, label: 'Discover your impact' }
  ];

  const initialPrompt = "Think about a time in college when you felt truly energized and in your element. It could be anything - a project, a conversation, helping someone... What comes to mind?";

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError('');
    const newMessage: Message = { role: 'user', content };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setCurrentMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantContent = data.content || 'No response received';
      const assistantMessage: Message = { role: 'assistant', content: assistantContent };
      setMessages([...newMessages, assistantMessage]);
      
      // Handle insight confirmation flow
      if (stage === 3 && assistantContent.includes('create impact')) {
        console.log('Setting pending insight:', assistantContent);
        setPendingInsight(assistantContent);
        setStage(4);
      } else if (stage === 4) {
        console.log('Stage 4 response:', content.toLowerCase());
        if (content.toLowerCase().includes('yes')) {
          console.log('Setting final insight:', pendingInsight);
          setFinalInsight(pendingInsight);
          setInsightConfirmed(true);
        } else if (content.toLowerCase().includes('no')) {
          // Reset to stage 3 for a new attempt
          setStage(3);
          setPendingInsight('');
        }
      } else {
        // Normal stage progression
        setStage(prev => Math.min(prev + 1, 4));
      }

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (content: string) => {
    if (typeof content === 'string') {
      return content;
    }
    return 'Unable to display message';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center mb-4">
        {stages.map((s) => (
          <div 
            key={s.number} 
            className="flex flex-col items-center w-1/4"
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
                ${stage >= s.number ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              {s.number}
            </div>
            <span className={`text-xs text-center ${stage >= s.number ? 'text-purple-600' : 'text-gray-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="mb-4">
              <p className="text-lg text-gray-900">{initialPrompt}</p>
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {renderMessage(message.content)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              rows="3"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(currentMessage)}
              disabled={!currentMessage.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white self-end"
              aria-label={isLoading ? 'Sending...' : 'Send message'}
            >
              {isLoading ? 'Sending...' : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Show InsightCapture at the bottom of the chat */}
      {insightConfirmed && (
        <InsightCapture 
          insight={finalInsight} 
          visible={true} 
        />
      )}
    </div>
  );
}