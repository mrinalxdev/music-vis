import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
} from "lucide-react";
import { Visualizer } from "./Visualizer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AudioVisualizerProps {
  audioFile: File | null;
  quality: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioFile,
  quality,
}) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [visualizationType, setVisualizationType] = useState<
    "bars" | "wave" | "circular"
  >("bars");
  const [bassBoost, setBassBoost] = useState(0);
  const [trebleBoost, setTrebleBoost] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [eq, setEq] = useState<number[]>([0, 0, 0, 0, 0]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const bassBoostRef = useRef<BiquadFilterNode | null>(null);
  const trebleBoostRef = useRef<BiquadFilterNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);

  const setupAudio = useCallback(async () => {
    if (!audioFile) return;

    const context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const gainNode = context.createGain();
    const analyserNode = context.createAnalyser();
    const bassBoost = context.createBiquadFilter();
    const trebleBoost = context.createBiquadFilter();

    let fftSize = 2048;
    if (quality === "low") fftSize = 1024;
    if (quality === "high") fftSize = 4096;
    analyserNode.fftSize = fftSize;

    bassBoost.type = "lowshelf";
    bassBoost.frequency.value = 200;
    trebleBoost.type = "highshelf";
    trebleBoost.frequency.value = 2000;

    const eqFilters = [60, 170, 350, 1000, 3500].map((freq, i) => {
      const filter = context.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      return filter;
    });

    gainNode.connect(bassBoost);
    bassBoost.connect(trebleBoost);
    trebleBoost.connect(eqFilters[0]);
    eqFilters.reduce((prev, curr) => {
      prev.connect(curr);
      return curr;
    });
    eqFilters[eqFilters.length - 1].connect(analyserNode);
    analyserNode.connect(context.destination);

    setAudioContext(context);
    setAnalyser(analyserNode);
    setGainNode(gainNode);
    bassBoostRef.current = bassBoost;
    trebleBoostRef.current = trebleBoost;
    eqFiltersRef.current = eqFilters;

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    audioBufferRef.current = audioBuffer;
    setDuration(audioBuffer.duration);

    createAndStartSource();
  }, [audioFile, quality]);

  useEffect(() => {
    if (audioFile) {
      setupAudio();
    }
  }, [audioFile, setupAudio]);

  const createAndStartSource = useCallback(() => {
    if (!audioContext || !gainNode || !audioBufferRef.current) return;

    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(gainNode);
    sourceRef.current = source;

    source.playbackRate.value = playbackRate;
    source.loop = isLooping;
    source.start(
      0,
      isReversed ? audioBufferRef.current.duration - currentTime : currentTime
    );
    setIsPlaying(true);

    source.onended = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
  }, [
    audioContext,
    gainNode,
    playbackRate,
    isReversed,
    currentTime,
    isLooping,
  ]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
    } else {
      createAndStartSource();
    }
  }, [isPlaying, createAndStartSource]);

  const handleTimeUpdate = useCallback(() => {
    if (isPlaying) {
      setCurrentTime((prev) => {
        const newTime = isReversed ? prev - 0.1 : prev + 0.1;
        if (newTime >= duration || newTime <= 0) {
          if (isLooping) {
            return isReversed ? duration : 0;
          } else {
            setIsPlaying(false);
            return 0;
          }
        }
        return newTime;
      });
    }
  }, [isPlaying, isReversed, duration, isLooping]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying) {
      intervalId = setInterval(handleTimeUpdate, 100);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, handleTimeUpdate]);

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (isPlaying) {
      createAndStartSource();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (gainNode) {
      gainNode.gain.setValueAtTime(newVolume, audioContext?.currentTime || 0);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNode) {
      gainNode.gain.setValueAtTime(
        isMuted ? volume : 0,
        audioContext?.currentTime || 0
      );
    }
  };

  const toggleReverse = () => {
    setIsReversed(!isReversed);
    if (isPlaying) {
      createAndStartSource();
    }
  };

  const handlePlaybackRateChange = (value: number[]) => {
    const newRate = value[0];
    setPlaybackRate(newRate);
    if (sourceRef.current) {
      sourceRef.current.playbackRate.setValueAtTime(
        newRate,
        audioContext?.currentTime || 0
      );
    }
  };

  const handleBassBoostChange = (value: number[]) => {
    const boost = value[0];
    setBassBoost(boost);
    if (bassBoostRef.current) {
      bassBoostRef.current.gain.setValueAtTime(
        boost,
        audioContext?.currentTime || 0
      );
    }
  };

  const handleTrebleBoostChange = (value: number[]) => {
    const boost = value[0];
    setTrebleBoost(boost);
    if (trebleBoostRef.current) {
      trebleBoostRef.current.gain.setValueAtTime(
        boost,
        audioContext?.currentTime || 0
      );
    }
  };

  const handleEqChange = (index: number, value: number) => {
    setEq((prev) => {
      const newEq = [...prev];
      newEq[index] = value;
      return newEq;
    });
    if (eqFiltersRef.current[index]) {
      eqFiltersRef.current[index].gain.setValueAtTime(
        value,
        audioContext?.currentTime || 0
      );
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (sourceRef.current) {
      sourceRef.current.loop = !isLooping;
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
    // todo : Implement shuffle logic here when we have multiple tracks
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-full flex flex-col border rounded-md">
      <div className="flex-1 bg-background">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
          <Visualizer
            analyser={analyser}
            type={visualizationType}
            quality={quality}
          />
        </Canvas>
      </div>
      <div className="bg-card p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full mx-4"
          />
          <span className="text-foreground">{formatTime(duration)}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={togglePlayPause}>
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
            <Button variant="outline" size="icon" onClick={toggleLoop}>
              <Repeat
                className={`h-4 w-4 ${isLooping ? "text-primary" : ""}`}
              />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleShuffle}>
              <Shuffle
                className={`h-4 w-4 ${isShuffle ? "text-primary" : ""}`}
              />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="reverse"
                checked={isReversed}
                onCheckedChange={toggleReverse}
              />
              <Label htmlFor="reverse" className="text-foreground">
                Reverse
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="playbackRate" className="text-foreground">
                Speed
              </Label>
              <Slider
                id="playbackRate"
                value={[playbackRate]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={handlePlaybackRateChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="equalizer">Equalizer</TabsTrigger>
          </TabsList>
          <TabsContent value="visualization">
            <div className="flex items-center space-x-4">
              <Label htmlFor="visualizationType" className="text-foreground">
                Type
              </Label>
              <Select
                value={visualizationType}
                onValueChange={(value: "bars" | "wave" | "circular") =>
                  setVisualizationType(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select visualization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bars">Bars</SelectItem>
                  <SelectItem value="wave">Wave</SelectItem>
                  <SelectItem value="circular">Circular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          <TabsContent value="effects">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="bassBoost" className="text-foreground">
                  Bass
                </Label>
                <Slider
                  id="bassBoost"
                  value={[bassBoost]}
                  min={-10}
                  max={10}
                  step={0.1}
                  onValueChange={handleBassBoostChange}
                  className="w-24"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="trebleBoost" className="text-foreground">
                  Treble
                </Label>
                <Slider
                  id="trebleBoost"
                  value={[trebleBoost]}
                  min={-10}
                  max={10}
                  step={0.1}
                  onValueChange={handleTrebleBoostChange}
                  className="w-24"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="equalizer">
            <div className="flex items-center space-x-4">
              {eq.map((value, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Slider
                    orientation="vertical"
                    value={[value]}
                    min={-12}
                    max={12}
                    step={0.1}
                    onValueChange={(value) => handleEqChange(index, value[0])}
                    className="h-24"
                  />
                  <Label className="text-foreground">
                    {["60Hz", "170Hz", "350Hz", "1kHz", "3.5kHz"][index]}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AudioVisualizer;
