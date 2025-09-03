import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import Auth from './Auth';
import './App.css';

// Declare chrome for TypeScript
declare const chrome: any;

interface Bookmark {
  id: number; url: string; title: string;
  timestamp: number; note: string; user_id: string;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [titleText, setTitleText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadBookmarks = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error loading bookmarks:', JSON.stringify(error, null, 2));
    else setBookmarks(data as Bookmark[]);
  };

  useEffect(() => {
    if (session) {
      loadBookmarks();
    }
  }, [session]);

  const handleSaveBookmarkClick = () => {
    chrome.runtime.sendMessage({ action: "saveBookmark" }, async (response: any) => {
      if (response.bookmark && session) {
        const { error } = await supabase.from('bookmarks').insert({
          url: response.bookmark.url,
          title: response.bookmark.title,
          timestamp: response.bookmark.timestamp,
          note: response.bookmark.note,
          user_id: session.user.id
        });
        
        if (error) console.error('Error saving bookmark:', error);
        else loadBookmarks();
      }
    });
  };

  const handleDeleteClick = async (id: number) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (error) console.error('Error deleting:', error);
    else loadBookmarks();
  };
  
  const handleEditClick = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setNoteText(bookmark.note);
    setTitleText(bookmark.title);
  };

  const handleSaveClick = async (id: number) => {
    const { error } = await supabase.from('bookmarks').update({ 
      note: noteText,
      title: titleText 
    }).eq('id', id);

    if (error) console.error('Error saving changes:', error);
    else {
      loadBookmarks();
      setEditingId(null);
    }
  };

  const formatTime = (seconds: number) => new Date(seconds * 1000).toISOString().substr(14, 5);

  const handleExportPdf = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    doc.setFontSize(18);
    doc.text("My ClipNotes", 10, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    filteredBookmarks.forEach((bookmark) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      const titleText = `Title: ${bookmark.title}`;
      const timeText = `Timestamp: ${formatTime(bookmark.timestamp)}`;
      const noteText = `Note: ${bookmark.note}`;
      
      doc.text(titleText, 10, yPosition, { maxWidth: 180 });
      yPosition += 7;
      doc.text(timeText, 10, yPosition);
      yPosition += 7;
      doc.text(noteText, 10, yPosition, { maxWidth: 180 });
      
      yPosition += 20;
    });

    doc.save('clipnotes-export.pdf');
  };

  const openBookmark = (url: string, timestamp: number) => {
    const timeUrl = `${url.split('&t=')[0]}&t=${Math.floor(timestamp)}s`;
    chrome.tabs.create({ url: timeUrl });
  };
  
  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session) {
    return <Auth />;
  } 
  
  return (
    <main className="container">
      <div className="header-actions">
        <h1>ClipNotes</h1>
        <div>
          <button onClick={handleExportPdf} className="export-button" title="Export to PDF">Export</button>
          <button onClick={() => supabase.auth.signOut()} className="auth-button">Sign Out</button>
        </div>
      </div>
      <button onClick={handleSaveBookmarkClick} className="save-bookmark-button">
        Save Current Time
      </button>
      <input
        type="text"
        placeholder="Search notes..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="bookmark-list">
        {filteredBookmarks.length > 0 ? (
          filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bookmark-card">
              {editingId === bookmark.id ? (
                <div className="editing-view">
                  <input 
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    className="title-input"
                  />
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="note-textarea"
                  />
                  <button onClick={() => handleSaveClick(bookmark.id)} className="action-button save-button">Save</button>
                </div>
              ) : (
                <div className="default-view">
                  <div className="bookmark-info">
                    <div 
                      className="bookmark-title" 
                      onClick={() => openBookmark(bookmark.url, bookmark.timestamp)}
                      title="Click to open video at this timestamp"
                    >
                      {bookmark.title}
                    </div>
                    <p className="bookmark-note">{bookmark.note}</p>
                    <div className="bookmark-timestamp">{formatTime(bookmark.timestamp)}</div>
                  </div>
                  <div className="button-group">
                    <button onClick={() => handleEditClick(bookmark)} className="action-button edit-button">Edit</button>
                    <button onClick={() => handleDeleteClick(bookmark.id)} className="action-button delete-button">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="empty-message">No bookmarks found.</p>
        )}
      </div>
    </main>
  );
}

export default App;