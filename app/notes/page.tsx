"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export default function NotesPage() {
  const [isClient, setIsClient] = useState(false);
  const notes = useQuery(api.notes.list);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a' }}>Tu80EI Site Notes</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Live feed from Telegram Bridge</p>
      <hr style={{ border: '0', borderTop: '1px solid #eee', marginBottom: '30px' }} />
      
      {notes === undefined ? (
        <p>Loading site data...</p>
      ) : notes.length === 0 ? (
        <p>No notes found. Send a voice note to your bot!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notes.map((note: any) => (
            <div key={note._id} style={{ border: '1px solid #e0e0e0', padding: '20px', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.5' }}>"{note.text}"</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px', fontWeight: 'bold' }}>
                🕒 {new Date(note._creationTime).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}