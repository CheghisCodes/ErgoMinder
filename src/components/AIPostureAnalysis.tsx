"use client";

import { AnalyzePostureOutput } from "@/ai/flows/analyze-posture";
import { analyzePostureAction } from "@/lib/actions";
import {
  Camera,
  Loader2,
  RefreshCcw,
  Sparkles,
  UserCheck,
  Wind,
  AlertTriangle
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function AIPostureAnalysis() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzePostureOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Could not access the camera. Please check your browser permissions."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL("image/jpeg");
        setImageData(dataUri);
      }
    }
    stopCamera();
  }, [stopCamera]);

  const handleAnalyze = async () => {
    if (!imageData) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzePostureAction({ photoDataUri: imageData });
      setAnalysisResult(result);
    } catch (err) {
      console.error("Error analyzing posture:", err);
      setError("An error occurred during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    stopCamera();
    setImageData(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setError(null);
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            {imageData && (
              <img
                src={imageData}
                alt="Captured posture"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <UserCheck className="h-5 w-5" /> Posture Analysis
              </h3>
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Wind className="h-5 w-5" /> Stretch Recommendations
              </h3>
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      );
    }
    if (analysisResult) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <img
            src={imageData!}
            alt="Captured posture"
            className="rounded-lg object-cover w-full aspect-video"
          />
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="h-5 w-5" /> Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.postureAnalysis}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wind className="h-5 w-5" /> Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.stretchRecommendations}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    if (stream) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-lg min-h-[250px]">
        <Camera className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Start your camera to capture your posture.
        </p>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Posture Analysis
        </CardTitle>
        <CardDescription>
          Get personalized stretch recommendations by analyzing your posture.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px] flex items-center justify-center">
        {renderContent()}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 flex justify-center gap-4">
        {!stream && !imageData && (
          <Button onClick={startCamera}>
            <Camera className="mr-2" /> Start Camera
          </Button>
        )}
        {stream && (
          <Button onClick={capturePhoto}>
            <Camera className="mr-2" /> Capture Photo
          </Button>
        )}
        {imageData && !analysisResult && (
          <>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <Sparkles className="mr-2" />
              )}
              {isLoading ? "Analyzing..." : "Analyze Posture"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              <RefreshCcw className="mr-2" /> Retake
            </Button>
          </>
        )}
        {analysisResult && (
          <Button variant="outline" onClick={handleReset}>
            <RefreshCcw className="mr-2" /> Start Over
          </Button>
        )}
         {error && (
          <Button variant="outline" onClick={handleReset}>
            <RefreshCcw className="mr-2" /> Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
