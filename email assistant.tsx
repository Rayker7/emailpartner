import React, { useState, useRef } from 'react';
import { Mail, Star, BookOpen, Copy, Check, Edit2, Send, Settings, FileText, Upload, Trash2, Plus, LogIn, LogOut, Menu, X, FolderOpen, ExternalLink, RefreshCw, HardDrive, Cloud } from 'lucide-react';

// Mock data
const mockEmail = {
  id: "mail1",
  sender: "jan.kowalski@firma.pl",
  subject: "Pytanie o procedurę zwrotu produktu",
  content: "Witam,\n\nZakupiłem produkt XYZ w zeszłym tygodniu, ale niestety nie spełnia on moich oczekiwań. Chciałbym dowiedzieć się, jaka jest procedura zwrotu i czy mogę liczyć na pełny zwrot kosztów?\n\nZ góry dziękuję za informację.\n\nPozdrawiam,\nJan Kowalski",
  date: "2025-04-10T09:24:00",
  status: "pending" // 'pending', 'answered', 'draft'
};

const mockEmails = [
  {
    id: "mail1",
    sender: "jan.kowalski@firma.pl",
    subject: "Pytanie o procedurę zwrotu produktu",
    preview: "Zakupiłem produkt XYZ w zeszłym tygodniu, ale niestety nie spełnia on moich oczekiwań...",
    date: "2025-04-10T09:24:00",
    status: "pending", // 'pending', 'answered', 'draft'
    unread: true
  },
  {
    id: "mail2",
    sender: "maria.nowak@example.com",
    subject: "Dostępność produktu ABC",
    preview: "Dzień dobry, chciałabym zapytać o dostępność produktu ABC w Państwa magazynie...",
    date: "2025-04-09T14:12:00",
    status: "answered",
    unread: false
  },
  {
    id: "mail3",
    sender: "tomasz.wilk@corp.pl",
    subject: "Pytanie o gwarancję",
    preview: "Dzień dobry, zakupiłem u Państwa produkt DEF i mam pytanie dotyczące gwarancji...",
    date: "2025-04-09T08:45:00",
    status: "draft",
    unread: false
  },
  {
    id: "mail4",
    sender: "support@partnercompany.com",
    subject: "Zapytanie o współpracę",
    preview: "Witam, reprezentuję firmę PartnerCompany i chciałbym nawiązać współpracę w zakresie...",
    date: "2025-04-08T11:20:00",
    status: "pending",
    unread: true
  },
  {
    id: "mail5",
    sender: "anna.kowalczyk@gmail.com",
    subject: "Problem z fakturą",
    preview: "Dzień dobry, otrzymałam fakturę za ostatnie zamówienie, ale kwota nie zgadza się z...",
    date: "2025-04-07T16:30:00",
    status: "answered",
    unread: false
  }
];

const mockAIResponse = "Dzień dobry Panie Janie,\n\nDziękuję za wiadomość. Oczywiście, w naszej firmie oferujemy 30-dniowy okres na zwrot zakupionych produktów. Aby dokonać zwrotu produktu XYZ, proszę postępować zgodnie z poniższą procedurą:\n\n1. Wypełnić formularz zwrotu dostępny na naszej stronie internetowej w sekcji 'Zwroty i reklamacje'\n2. Zapakować produkt w oryginalne opakowanie, jeśli to możliwe\n3. Dołączyć dowód zakupu (paragon lub fakturę)\n4. Wysłać paczkę na adres naszego magazynu zwrotów\n\nPo otrzymaniu przesyłki i weryfikacji stanu produktu, zwrot środków nastąpi w ciągu 14 dni roboczych na konto, z którego dokonano płatności.\n\nW przypadku jakichkolwiek pytań, pozostaję do dyspozycji.\n\nZ poważaniem,\nDział Obsługi Klienta";

const mockSources = [
  {
    id: 1,
    title: "Polityka zwrotów i reklamacji",
    snippet: "Firma oferuje 30-dniowy okres na zwrot zakupionych produktów. Aby dokonać zwrotu, klient powinien wypełnić formularz zwrotu dostępny na stronie internetowej w sekcji 'Zwroty i reklamacje'.",
    confidence: 0.92
  },
  {
    id: 2, 
    title: "Procedury magazynowe - zwroty produktów",
    snippet: "Po otrzymaniu przesyłki zwrotnej i weryfikacji stanu produktu, zwrot środków następuje w ciągu 14 dni roboczych na konto, z którego dokonano płatności.",
    confidence: 0.87
  },
  {
    id: 3,
    title: "Instrukcja pakowania zwrotów",
    snippet: "Klient powinien zapakować produkt w oryginalne opakowanie, jeśli to możliwe. Do przesyłki należy dołączyć dowód zakupu (paragon lub fakturę).",
    confidence: 0.81
  }
];

const EmailAssistantApp = () => {
  // Main app state
  const [activeView, setActiveView] = useState('inbox'); // inbox, settings, documents
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Email list state
  const [emails, setEmails] = useState(mockEmails);
  const [selectedEmailId, setSelectedEmailId] = useState("mail1");
  const [selectedEmail, setSelectedEmail] = useState(mockEmail);
  
  // Email response state
  const [response, setResponse] = useState(mockAIResponse);
  const [originalResponse, setOriginalResponse] = useState(mockAIResponse);
  const [rating, setRating] = useState(0);
  const [activeTab, setActiveTab] = useState('response');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState(null); // { user: "nazwa_użytkownika", date: Date object }
  
  // Settings state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    email: '',
    refreshInterval: 5,
    signatureText: 'Z poważaniem,\nDział Obsługi Klienta'
  });
  
  // Documents state
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Polityka zwrotów i reklamacji.md', size: '24KB', date: '2025-03-15', source: 'local' },
    { id: 2, name: 'Procedury magazynowe - zwroty produktów.md', size: '56KB', date: '2025-02-28', source: 'local' },
    { id: 3, name: 'Instrukcja pakowania zwrotów.md', size: '12KB', date: '2025-01-10', source: 'local' }
  ]);
  
  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSource, setUploadSource] = useState(''); // 'local' or 'drive'
  const [isGDriveConnected, setIsGDriveConnected] = useState(false);
  const [gDriveFolders, setGDriveFolders] = useState([
    { id: 'folder1', name: 'Dokumentacja firmowa' },
    { id: 'folder2', name: 'Procedury' },
    { id: 'folder3', name: 'Regulaminy' }
  ]);
  const [selectedGDriveFolder, setSelectedGDriveFolder] = useState('');
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  
  // Ref for file input
  const fileInputRef = useRef(null);

  // ALL helper functions in one place to avoid duplications
  const handleLogin = () => {
    // Simulate Google OAuth login
    setIsLoggedIn(true);
    setEmailConfig(prev => ({...prev, email: 'user@gmail.com'}));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmailConfig(prev => ({...prev, email: ''}));
    setIsGDriveConnected(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApproveResponse = () => {
    setIsSending(true);
    
    // Simulate sending email and updating status
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      
      // Update email status in the list
      const updatedEmails = emails.map(email => 
        email.id === selectedEmailId ? {...email, status: 'answered', unread: false} : email
      );
      setEmails(updatedEmails);
      
      // Add approval information
      setApprovalInfo({
        user: isLoggedIn ? emailConfig.email : "Użytkownik lokalny",
        date: new Date()
      });
      
      setTimeout(() => setIsSent(false), 3000);
    }, 1500);
  };
  
  const selectEmail = (id) => {
    setSelectedEmailId(id);
    const email = emails.find(email => email.id === id);
    
    // Update unread status
    if (email && email.unread) {
      const updatedEmails = emails.map(email => 
        email.id === id ? {...email, unread: false} : email
      );
      setEmails(updatedEmails);
    }
    
    // For now, we'll just use the mock email content
    // In a real app, you would load the full email content here
    setSelectedEmail(mockEmail);
    
    // Reset response state for the new email
    if (email && email.status === 'pending') {
      setResponse(mockAIResponse);
      setOriginalResponse(mockAIResponse);
      setApprovalInfo(null);
    } else if (email && email.status === 'draft') {
      // For drafts, load a partial response
      setResponse("Częściowa odpowiedź...");
      setOriginalResponse("Częściowa odpowiedź...");
      setApprovalInfo(null);
    } else if (email && email.status === 'answered') {
      // For answered emails, load the sent response
      setResponse(mockAIResponse);
      setOriginalResponse(mockAIResponse);
      
      // Mock approval info for answered emails
      if (!approvalInfo) {
        setApprovalInfo({
          user: "anna.nowak@firma.pl",
          date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // yesterday
        });
      }
    }
    
    setRating(0);
    setCopied(false);
    setIsSent(false);
    setIsSending(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadSource('');
  };
  
  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadSource('');
    setSelectedGDriveFolder('');
  };
  
  const handleLocalFileUpload = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Simulate file upload
      const newDocs = [...documents];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newDoc = { 
          id: Date.now() + i, 
          name: file.name, 
          size: formatFileSize(file.size), 
          date: new Date().toISOString().split('T')[0],
          source: 'local'
        };
        newDocs.push(newDoc);
      }
      
      setDocuments(newDocs);
      closeUploadModal();
      
      // Reset the file input for future uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const connectToGDrive = () => {
    // Simulate connecting to Google Drive
    setIsLoadingDrive(true);
    
    setTimeout(() => {
      setIsGDriveConnected(true);
      setIsLoadingDrive(false);
    }, 1500);
  };
  
  const importFromGDrive = () => {
    if (!selectedGDriveFolder) return;
    
    // Simulate fetching documents from the selected folder
    setIsLoadingDrive(true);
    
    setTimeout(() => {
      // Find the selected folder name
      const folder = gDriveFolders.find(f => f.id === selectedGDriveFolder);
      
      // Simulate adding 2-3 documents from that folder
      const newDocs = [
        { 
          id: Date.now(), 
          name: `${folder.name} - Dokument 1.md`, 
          size: '32KB', 
          date: new Date().toISOString().split('T')[0],
          source: 'drive'
        },
        { 
          id: Date.now() + 1, 
          name: `${folder.name} - Dokument 2.md`, 
          size: '28KB', 
          date: new Date().toISOString().split('T')[0],
          source: 'drive'
        }
      ];
      
      setDocuments([...documents, ...newDocs]);
      setIsLoadingDrive(false);
      closeUploadModal();
    }, 2000);
  };
  
  const handleDeleteDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + 'B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
    else return (bytes / 1048576).toFixed(1) + 'MB';
  };
  
  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <Mail className="mr-2" size={24} /> Email Assistant
          </h1>
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button 
              className={`px-3 py-1 rounded-md ${activeView === 'inbox' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
              onClick={() => setActiveView('inbox')}
            >
              <Mail size={18} className="inline mr-1" /> Skrzynka
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${activeView === 'documents' ? 'bg-blue-700' : 'hover:bg-blue-700'}`} 
              onClick={() => setActiveView('documents')}
            >
              <FileText size={18} className="inline mr-1" /> Dokumenty
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${activeView === 'settings' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
              onClick={() => setActiveView('settings')}
            >
              <Settings size={18} className="inline mr-1" /> Ustawienia
            </button>
            {isLoggedIn && (
              <button 
                className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white"
                onClick={handleLogout}
              >
                <LogOut size={18} className="inline mr-1" /> Wyloguj
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-500 text-white">
          <div className="flex flex-col">
            <button 
              className={`p-4 text-left ${activeView === 'inbox' ? 'bg-blue-600' : ''}`}
              onClick={() => {
                setActiveView('inbox');
                setMobileMenuOpen(false);
              }}
            >
              <Mail size={18} className="inline mr-2" /> Skrzynka
            </button>
            <button 
              className={`p-4 text-left ${activeView === 'documents' ? 'bg-blue-600' : ''}`}
              onClick={() => {
                setActiveView('documents');
                setMobileMenuOpen(false);
              }}
            >
              <FileText size={18} className="inline mr-2" /> Dokumenty
            </button>
            <button 
              className={`p-4 text-left ${activeView === 'settings' ? 'bg-blue-600' : ''}`}
              onClick={() => {
                setActiveView('settings');
                setMobileMenuOpen(false);
              }}
            >
              <Settings size={18} className="inline mr-2" /> Ustawienia
            </button>
            {isLoggedIn && (
              <button 
                className="p-4 text-left bg-red-500"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut size={18} className="inline mr-2" /> Wyloguj
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      {activeView === 'inbox' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Email list */}
          <div className="w-1/4 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold">Wiadomości</h2>
            </div>
            <div className="divide-y">
              {emails.map(email => (
                <div 
                  key={email.id} 
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedEmailId === email.id ? 'bg-blue-50' : email.unread ? 'bg-gray-100' : ''
                  } hover:bg-gray-50`}
                  onClick={() => selectEmail(email.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium truncate mr-2 ${email.unread ? 'font-semibold' : ''}`}>
                      {email.sender.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(email.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-medium text-sm mb-1 truncate">
                    {email.subject}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {email.preview}
                  </div>
                  <div className="mt-1 flex justify-between items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      email.status === 'answered' 
                        ? 'bg-green-100 text-green-800' 
                        : email.status === 'draft' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {email.status === 'answered' 
                        ? 'Odpowiedziano' 
                        : email.status === 'draft' 
                          ? 'Szkic' 
                          : 'Oczekuje'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center panel - Original Email */}
          <div className="w-1/3 p-4 border-r border-gray-200 overflow-y-auto bg-white">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Oryginalna wiadomość</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-2">
                  <span className="font-semibold">Od:</span> {selectedEmail.sender}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Temat:</span> {selectedEmail.subject}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Data:</span> {new Date(selectedEmail.date).toLocaleString()}
                </div>
                <div className="mt-4 whitespace-pre-line">{selectedEmail.content}</div>
              </div>
            </div>
          </div>

          {/* Right panel - Response */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="mb-4 flex space-x-4">
              <button 
                className={`px-4 py-2 rounded-t-md ${activeTab === 'response' ? 'bg-white border-t border-l border-r border-gray-200 font-semibold' : 'bg-gray-100'}`}
                onClick={() => setActiveTab('response')}
              >
                Odpowiedź
              </button>
              <button 
                className={`px-4 py-2 rounded-t-md ${activeTab === 'sources' ? 'bg-white border-t border-l border-r border-gray-200 font-semibold' : 'bg-gray-100'}`}
                onClick={() => setActiveTab('sources')}
              >
                Źródła ({mockSources.length})
              </button>
              <button 
                className={`px-4 py-2 rounded-t-md ${activeTab === 'approval' ? 'bg-white border-t border-l border-r border-gray-200 font-semibold' : 'bg-gray-100'}`}
                onClick={() => setActiveTab('approval')}
              >
                Akceptacja
              </button>
            </div>

            <div className="flex-1 bg-white rounded-md border border-gray-200 overflow-hidden flex flex-col">
              {activeTab === 'response' ? (
                <>
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <div className="text-gray-500 text-sm">Ocena odpowiedzi:</div>
                        {[1, 2, 3].map((star) => (
                          <button 
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              size={20} 
                              className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                            />
                          </button>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                          onClick={() => setResponse(originalResponse)}
                          title="Przywróć oryginalną odpowiedź"
                        >
                          <Edit2 size={18} className="text-gray-500" />
                        </button>
                        <button 
                          className={`p-2 rounded-md transition-colors flex items-center ${copied ? 'bg-green-100' : 'hover:bg-gray-100'}`}
                          onClick={handleCopy}
                          title="Kopiuj do schowka"
                        >
                          {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-500" />}
                        </button>
                        <button 
                          className={`p-2 rounded-md transition-colors flex items-center ${
                            isSent ? 'bg-green-100 text-green-600' : isSending ? 'bg-blue-100 text-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                          onClick={handleApproveResponse}
                          disabled={isSending || isSent || approvalInfo !== null}
                          title={approvalInfo !== null ? "Odpowiedź już zaakceptowana" : "Zatwierdź odpowiedź"}
                        >
                          {isSent ? (
                            <Check size={18} />
                          ) : (
                            <Check size={18} className={isSending ? 'animate-pulse' : ''} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <textarea
                      className="w-full h-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      readOnly={approvalInfo !== null}
                    />
                  </div>
                </>
              ) : activeTab === 'sources' ? (
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">Źródła informacji</h3>
                  <div className="space-y-4">
                    {mockSources.map((source) => (
                      <div key={source.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-blue-600 flex items-center">
                            <BookOpen size={16} className="mr-1" />
                            {source.title}
                          </h4>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Trafność: {Math.round(source.confidence * 100)}%
                          </span>
                        </div>
                        <div className="text-gray-700 border-l-2 border-blue-300 pl-3 py-1">
                          {source.snippet}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">Informacje o akceptacji</h3>
                  
                  {approvalInfo ? (
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <Check size={20} className="text-green-600 mr-2" />
                          <h4 className="text-green-800 font-medium">Odpowiedź została zaakceptowana</h4>
                        </div>
                        
                        <div className="ml-7 space-y-2">
                          <div className="flex">
                            <span className="text-gray-600 font-medium w-32">Zaakceptowana przez:</span>
                            <span className="text-gray-800">{approvalInfo.user}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-600 font-medium w-32">Data akceptacji:</span>
                            <span className="text-gray-800">{approvalInfo.date.toLocaleString()}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-600 font-medium w-32">Status:</span>
                            <span className="text-green-600 font-medium">Wysłana</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-lg mb-3">Oryginalna odpowiedź AI</h4>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-line text-gray-700 max-h-48 overflow-y-auto">
                          {originalResponse}
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-lg mb-3">Finalna odpowiedź po edycji</h4>
                        <div className="bg-blue-50 p-4 rounded border border-blue-200 whitespace-pre-line text-gray-800 max-h-48 overflow-y-auto">
                          {response}
                        </div>
                        {response !== originalResponse && (
                          <div className="mt-2 text-sm text-blue-600 flex items-center">
                            <Edit2 size={14} className="mr-1" /> 
                            Odpowiedź została zmodyfikowana przed wysłaniem
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-gray-500 mb-3">
                        Odpowiedź nie została jeszcze zaakceptowana
                      </div>
                      <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center mx-auto"
                        onClick={() => {
                          setActiveTab('response');
                          setTimeout(() => {
                            const approveButton = document.querySelector('[title="Zatwierdź odpowiedź"]');
                            if (approveButton) {
                              approveButton.classList.add('animate-pulse');
                              setTimeout(() => {
                                approveButton.classList.remove('animate-pulse');
                              }, 1500);
                            }
                          }, 300);
                        }}
                      >
                        <Check size={18} className="mr-2" />
                        Przejdź do zatwierdzenia
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings View */}
      {activeView === 'settings' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Ustawienia konta</h2>
            
            {!isLoggedIn ? (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Logowanie do Gmail</h3>
                <p className="mb-4 text-gray-600">
                  Połącz swoje konto Gmail, aby aplikacja mogła automatycznie odbierać i wysyłać wiadomości.
                </p>
                <div className="mb-6">
                  <button 
                    onClick={handleLogin}
                    className="flex items-center justify-center bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50 w-full md:w-auto"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Zaloguj przez Google
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Konto email</h3>
                    <span className="bg-green-100 text-green-600 py-1 px-3 rounded-full text-sm">Połączono</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-600">Zalogowano jako: <strong>{emailConfig.email}</strong></p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Ustawienia email</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="refreshInterval">
                      Sprawdzaj nowe wiadomości co (minuty):
                    </label>
                    <input 
                      type="number" 
                      id="refreshInterval"
                      className="w-full p-2 border rounded-md"
                      value={emailConfig.refreshInterval}
                      onChange={e => setEmailConfig({...emailConfig, refreshInterval: parseInt(e.target.value) || 5})}
                      min="1"
                      max="60"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="signature">
                      Podpis wiadomości:
                    </label>
                    <textarea 
                      id="signature"
                      className="w-full p-2 border rounded-md h-32"
                      value={emailConfig.signatureText}
                      onChange={e => setEmailConfig({...emailConfig, signatureText: e.target.value})}
                    />
                  </div>
                  
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Zapisz ustawienia
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents View */}
      {activeView === 'documents' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Dokumenty kontekstowe</h2>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                onClick={openUploadModal}
              >
                <Upload size={18} className="mr-2" /> Dodaj dokument
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex items-center text-gray-600">
                <div className="font-semibold w-1/2">Nazwa dokumentu</div>
                <div className="font-semibold w-1/6 text-center">Rozmiar</div>
                <div className="font-semibold w-1/4 text-center">Data dodania</div>
                <div className="font-semibold w-1/12 text-right">Akcje</div>
              </div>
              
              <div className="divide-y">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center p-4 hover:bg-gray-50">
                    <div className="w-1/2 flex items-center">
                      <FileText size={18} className="mr-2 text-blue-500" />
                      <span className="truncate">{doc.name}</span>
                      {doc.source === 'drive' && (
                        <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <Cloud size={12} className="mr-1" /> Drive
                        </span>
                      )}
                      {doc.source === 'local' && (
                        <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <HardDrive size={12} className="mr-1" /> Lokalny
                        </span>
                      )}
                    </div>
                    <div className="w-1/6 text-center text-gray-600">{doc.size}</div>
                    <div className="w-1/4 text-center text-gray-600">{doc.date}</div>
                    <div className="w-1/12 text-right">
                      <button 
                        className="text-red-500 hover:text-red-700" 
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Usuń dokument"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {documents.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <div className="mb-2">Brak dokumentów kontekstowych</div>
                    <button 
                      className="text-blue-500 flex items-center mx-auto"
                      onClick={openUploadModal}
                    >
                      <Plus size={18} className="mr-1" /> Dodaj pierwszy dokument
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
              <p className="text-sm">
                <strong>Wskazówka:</strong> Dodawaj dokumenty w formacie Markdown. System automatycznie zindeksuje ich zawartość i użyje jako kontekst podczas generowania odpowiedzi.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Dodaj dokument</h3>
                <button 
                  onClick={closeUploadModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              {!uploadSource ? (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 p-6 rounded-lg text-center"
                    onClick={() => setUploadSource('local')}
                  >
                    <HardDrive size={40} className="text-gray-700 mx-auto mb-2" />
                    <div className="text-lg font-medium">Z dysku lokalnego</div>
                    <p className="text-gray-500 text-sm mt-1">Wgraj pliki z komputera</p>
                  </button>
                  
                  <button 
                    className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg text-center"
                    onClick={() => {
                      setUploadSource('drive');
                      if (!isGDriveConnected && isLoggedIn) {
                        connectToGDrive();
                      }
                    }}
                    disabled={!isLoggedIn}
                  >
                    <Cloud size={40} className={`mx-auto mb-2 ${isLoggedIn ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className={`text-lg font-medium ${isLoggedIn ? '' : 'text-gray-400'}`}>Z Google Drive</div>
                    <p className={`text-sm mt-1 ${isLoggedIn ? 'text-gray-500' : 'text-gray-400'}`}>
                      {isLoggedIn ? 'Wybierz pliki z Google Drive' : 'Zaloguj się by połączyć z Google Drive'}
                    </p>
                  </button>
                </div>
              ) : uploadSource === 'local' ? (
                <div className="mt-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors"
                    onClick={handleLocalFileUpload}
                  >
                    <Upload size={40} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Przeciągnij pliki tutaj lub kliknij, aby wybrać</p>
                    <p className="text-gray-500 text-sm">Wspierane formaty: .md, .txt, .pdf</p>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      onChange={handleFileChange}
                      multiple
                      accept=".md,.txt,.pdf"
                    />
                  </div>
                  
                  <div className="flex justify-end mt-6 space-x-3">
                    <button 
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                      onClick={closeUploadModal}
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  {isLoadingDrive ? (
                    <div className="text-center py-8">
                      <RefreshCw size={40} className="text-blue-500 mx-auto mb-3 animate-spin" />
                      <p className="text-gray-600">Łączenie z Google Drive...</p>
                    </div>
                  ) : !isGDriveConnected ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Połącz się z Google Drive aby importować dokumenty</p>
                      <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        onClick={connectToGDrive}
                      >
                        Połącz z Google Drive
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="folder">
                          Wybierz folder
                        </label>
                        <select 
                          id="folder"
                          className="w-full p-2 border rounded-md"
                          value={selectedGDriveFolder}
                          onChange={(e) => setSelectedGDriveFolder(e.target.value)}
                        >
                          <option value="">-- Wybierz folder --</option>
                          {gDriveFolders.map(folder => (
                            <option key={folder.id} value={folder.id}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex justify-end mt-6 space-x-3">
                        <button 
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                          onClick={closeUploadModal}
                        >
                          Anuluj
                        </button>
                        <button 
                          className={`px-4 py-2 bg-blue-500 text-white rounded-md ${selectedGDriveFolder ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}`}
                          onClick={importFromGDrive}
                          disabled={!selectedGDriveFolder}
                        >
                          Importuj
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <footer className="bg-gray-100 border-t border-gray-200 px-4 py-2 text-sm text-gray-500">
        <div className="flex justify-between items-center">
          <div>Ostatnia aktualizacja: {new Date().toLocaleString()}</div>
          <div>
            {isLoggedIn 
              ? `Status: ${activeView === 'inbox' 
                  ? (isSending ? "Wysyłanie..." : isSent ? "Wysłano!" : "Gotowy") 
                  : "Connected"}`
              : "Status: Disconnected"
            }
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmailAssistantApp;