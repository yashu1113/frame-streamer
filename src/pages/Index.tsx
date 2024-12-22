import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io("ws://localhost:3000");

    // Handle incoming frame data
    socketRef.current.on("frame", (frameData: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Create new image from frame data
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = frameData;
    });

    socketRef.current.on("connect", () => {
      toast.success("Connected to streaming server");
    });

    socketRef.current.on("connect_error", () => {
      toast.error("Failed to connect to streaming server");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startStreaming = () => {
    socketRef.current?.emit("start-stream");
    toast.info("Starting video stream...");
  };

  const stopStreaming = () => {
    socketRef.current?.emit("stop-stream");
    toast.info("Stopping video stream...");
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Video Frame Streamer</h1>
        
        <Card className="p-6">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full bg-black rounded-lg"
          />
          
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={startStreaming}>Start Streaming</Button>
            <Button 
              onClick={stopStreaming}
              variant="outline"
            >
              Stop Streaming
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;