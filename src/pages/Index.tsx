import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [fps, setFps] = useState([30]); // Default 30 FPS

  useEffect(() => {
    // Connect to WebSocket server only when component mounts
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
      setIsStreaming(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Update FPS on server when slider changes
  useEffect(() => {
    if (isStreaming) {
      socketRef.current?.emit("update-fps", { fps: fps[0] });
    }
  }, [fps, isStreaming]);

  const startStreaming = () => {
    socketRef.current?.emit("start-stream", { 
      videoPath: "/sample.mp4",
      fps: fps[0]
    });
    setIsStreaming(true);
    toast.info("Starting video stream...");
  };

  const stopStreaming = () => {
    socketRef.current?.emit("stop-stream");
    setIsStreaming(false);
    toast.info("Stopping video stream...");
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Video Frame Streamer</h1>
        
        <Card className="p-6">
          <div className="aspect-video relative">
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full h-full bg-black rounded-lg"
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <p className="text-white text-lg">Click Start Streaming to view sample video</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">FPS Control</label>
              <Slider
                value={fps}
                onValueChange={setFps}
                min={1}
                max={60}
                step={1}
                disabled={isStreaming}
              />
              <p className="text-sm text-gray-500 text-center">{fps[0]} FPS</p>
            </div>

            <div className="flex justify-center gap-4">
              {!isStreaming ? (
                <Button onClick={startStreaming}>Start Streaming</Button>
              ) : (
                <Button 
                  onClick={stopStreaming}
                  variant="outline"
                >
                  Stop Streaming
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Note: Make sure your Node.js server is running on localhost:3000</p>
          <p>Sample video will be streamed when you click Start Streaming</p>
        </div>
      </div>
    </div>
  );
};

export default Index;