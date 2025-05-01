import { useState, useEffect, useRef } from 'react';
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
  Mic,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError } from '../../utils/toast';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations for the trainer
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        if (!user) return;

        const response = await fetch(`/api/messages/conversations?trainerId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Map API response to our Conversation interface
          const formattedConversations = data.data.map((conv: any) => {
            const memberData = conv.member || { _id: 'unknown', name: 'Unknown Member' };
            
            return {
              id: conv._id,
              memberId: memberData._id,
              memberName: memberData.name,
              lastMessage: conv.lastMessage?.content || 'Start a conversation',
              lastMessageTime: conv.lastMessage?.timestamp 
                ? formatMessageTime(new Date(conv.lastMessage.timestamp))
                : 'New',
              unreadCount: conv.unreadCount || 0,
              avatar: memberData.image 
                ? memberData.image 
                : memberData.name.split(' ').map((n: string) => n[0]).join(''),
              online: conv.online || false
            };
          });
          
          setConversations(formattedConversations);
          
          // If there are conversations, select the first one by default
          if (formattedConversations.length > 0 && !selectedConversation) {
            setSelectedConversation(formattedConversations[0].id);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        showError('Failed to load conversations');
        setLoading(false);
      }
    };
    
    if (user) {
      fetchConversations();
    }
  }, [user, selectedConversation]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!selectedConversation || !user) return;
        
        const response = await fetch(`/api/messages?conversationId=${selectedConversation}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Map API response to our Message interface
          const formattedMessages = data.data.map((msg: any) => ({
            id: msg._id,
            senderId: msg.senderId,
            senderName: msg.senderName || (msg.senderId === user.id ? 'You' : 'Member'),
            content: msg.content,
            timestamp: formatMessageTime(new Date(msg.timestamp)),
            type: msg.type || 'text',
            status: msg.status || 'sent'
          }));
          
          setMessages(formattedMessages);
          
          // Mark messages as read
          if (formattedMessages.some((m: { senderId: string; status: string; }) => m.senderId !== user.id && m.status !== 'read')) {
            markMessagesAsRead(selectedConversation);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        showError('Failed to load messages');
      }
    };
    
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    conv.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format timestamp for messages
  const formatMessageTime = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      if (!user) return;
      
      await fetch(`/api/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          conversationId, 
          userId: user.id 
        }),
      });
      
      // Update local conversations to clear unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation && user) {
      setSendingMessage(true);
      
      try {
        // Find the current conversation to get member ID
        const conversation = conversations.find(c => c.id === selectedConversation);
        if (!conversation) {
          throw new Error('Conversation not found');
        }
        
        // Prepare message data
        const messageData = {
          conversationId: selectedConversation,
          senderId: user.id,
          receiverId: conversation.memberId,
          content: newMessage,
          type: 'text'
        };
        
        // Optimistically add message to UI
        const optimisticMsg: Message = {
          id: `temp-${Date.now()}`,
          senderId: user.id,
          senderName: 'You',
          content: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          status: 'sent'
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        
        // Call API to send message
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Replace optimistic message with actual message from server
          setMessages(prev => 
            prev.map(msg => 
              msg.id === optimisticMsg.id 
                ? {
                    id: data.data._id,
                    senderId: data.data.senderId,
                    senderName: 'You',
                    content: data.data.content,
                    timestamp: formatMessageTime(new Date(data.data.timestamp)),
                    type: data.data.type || 'text',
                    status: data.data.status || 'sent'
                  } 
                : msg
            )
          );
          
          // Update conversation with new last message
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversation 
                ? {
                    ...conv,
                    lastMessage: newMessage,
                    lastMessageTime: formatMessageTime(new Date())
                  } 
                : conv
            )
          );
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        showError('Failed to send message');
        
        // Remove optimistic message if it failed
        setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      } finally {
        setSendingMessage(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

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
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'bg-primary-50' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center">
                  <div className="relative">
                    {typeof conversation.avatar === 'string' && conversation.avatar.startsWith('http') ? (
                      <img 
                        src={conversation.avatar} 
                        alt={conversation.memberName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">{conversation.avatar}</span>
                      </div>
                    )}
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
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversations</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No members match your search criteria.' : 'You have no conversations yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center">
                {conversations.find(c => c.id === selectedConversation)?.avatar && (
                  <>
                    {typeof conversations.find(c => c.id === selectedConversation)?.avatar === 'string' && 
                     conversations.find(c => c.id === selectedConversation)?.avatar.startsWith('http') ? (
                      <img 
                        src={conversations.find(c => c.id === selectedConversation)?.avatar} 
                        alt={conversations.find(c => c.id === selectedConversation)?.memberName}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold">
                          {conversations.find(c => c.id === selectedConversation)?.avatar}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {conversations.find(c => c.id === selectedConversation)?.memberName}
                  </h3>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${
                      conversations.find(c => c.id === selectedConversation)?.online
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                    }`} />
                    {conversations.find(c => c.id === selectedConversation)?.online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.senderId === user?.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.senderId === user?.id ? 'text-primary-200' : 'text-gray-500'
                          } flex items-center justify-end`}
                        >
                          {message.timestamp}
                          {message.senderId === user?.id && (
                            <span className="ml-1">
                              {message.status === 'read' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No messages yet. Start a conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className={`p-2 rounded-full ${
                    newMessage.trim() && !sendingMessage
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversation Selected</h3>
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom message icon component
const MessageIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default Chat; 