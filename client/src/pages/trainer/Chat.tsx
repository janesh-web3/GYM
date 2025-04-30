import { useState } from 'react';
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Image as ImageIcon,
  File,
  Mic
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  memberId: string;
  memberName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar: string;
  online: boolean;
}

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      memberId: '1',
      memberName: 'Sarah Johnson',
      lastMessage: 'Thanks for the workout plan!',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      avatar: 'SJ',
      online: true
    },
    {
      id: '2',
      memberId: '2',
      memberName: 'Michael Brown',
      lastMessage: 'Can we reschedule our session?',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      avatar: 'MB',
      online: false
    },
    {
      id: '3',
      memberId: '3',
      memberName: 'Emily Davis',
      lastMessage: 'I completed the exercises you suggested',
      lastMessageTime: '2 days ago',
      unreadCount: 0,
      avatar: 'ED',
      online: true
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '1',
      senderName: 'Sarah Johnson',
      content: 'Hi, I have a question about my workout plan',
      timestamp: '10:00 AM',
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      senderId: 'trainer',
      senderName: 'You',
      content: 'Sure, what would you like to know?',
      timestamp: '10:05 AM',
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: '1',
      senderName: 'Sarah Johnson',
      content: 'How many sets should I do for the bench press?',
      timestamp: '10:10 AM',
      type: 'text',
      status: 'read'
    },
    {
      id: '4',
      senderId: 'trainer',
      senderName: 'You',
      content: 'Start with 3 sets of 8-10 reps with moderate weight',
      timestamp: '10:15 AM',
      type: 'text',
      status: 'read'
    },
    {
      id: '5',
      senderId: '1',
      senderName: 'Sarah Johnson',
      content: 'Thanks for the advice!',
      timestamp: '10:30 AM',
      type: 'text',
      status: 'read'
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: 'trainer',
        senderName: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        status: 'sent'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-7rem)]">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.id ? 'bg-primary-50' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">{conversation.avatar}</span>
                  </div>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{conversation.memberName}</h3>
                    <span className="text-sm text-gray-500">{conversation.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="ml-2 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {conversations.find(c => c.id === selectedConversation)?.avatar}
                    </span>
                  </div>
                  {conversations.find(c => c.id === selectedConversation)?.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">
                    {conversations.find(c => c.id === selectedConversation)?.memberName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {conversations.find(c => c.id === selectedConversation)?.online
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <Video className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === 'trainer' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === 'trainer'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-end mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp}
                        {message.senderId === 'trainer' && (
                          <span className="ml-1">
                            {message.status === 'read' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-gray-700">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <File className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="text-gray-500 hover:text-gray-700">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
              <p className="text-gray-500">Choose a member to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 