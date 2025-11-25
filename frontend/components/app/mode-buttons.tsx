'use client';

import { useChat } from '@livekit/components-react';
import { Button } from '@/components/livekit/button';

export default function ModeButtons() {
  const { send } = useChat();

  const sendMode = (mode: string) => {
    console.log("Sending mode:", mode); // Debug log
    send(JSON.stringify({ command: "switch_mode", mode }));
  };

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-lg">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button 
            onClick={() => sendMode("learn")}
            variant="secondary"
            className="flex-1 font-medium"
            size="sm"
          >
            📚 Learn
          </Button>
          <Button 
            onClick={() => sendMode("quiz")}
            variant="secondary"
            className="flex-1 font-medium"
            size="sm"
          >
            ❓ Quiz
          </Button>
          <Button 
            onClick={() => sendMode("teach_back")}
            variant="secondary"
            className="flex-1 font-medium"
            size="sm"
          >
            🎓 Teach Back
          </Button>
        </div>
        <Button 
          onClick={() => sendMode("test")}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          🔧 Test Connection
        </Button>
      </div>
    </div>
  );
}