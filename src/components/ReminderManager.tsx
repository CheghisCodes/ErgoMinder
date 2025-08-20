"use client";

import { useToast } from "@/hooks/use-toast";
import { textToSpeechAction } from "@/lib/actions";
import { motivationalQuotes } from "@/lib/constants";
import {
  Clock,
  Eye,
  GlassWater,
  Grape,
  Pause,
  PersonStanding,
  Play,
  RotateCcw,
  Volume2,
  Voicemail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

type Reminder = {
  id: "eye" | "micro" | "hydration" | "snack";
  title: string;
  description: string;
  icon: LucideIcon;
  toastTitle: string;
  toastDescription: string;
  spokenPhrase: string;
  enabled: boolean;
  frequency: number; // in minutes
  frequencies: number[];
  progress: number;
  lastTriggered: number;
};

const initialReminders: Reminder[] = [
  {
    id: "eye",
    title: "Eye Break",
    description: "Follow the 20-20-20 rule to reduce eye strain.",
    icon: Eye,
    toastTitle: "Time for an eye break! 👀",
    toastDescription: "Look at something 20 feet away for 20 seconds.",
    spokenPhrase: "Time for an eye break. Look away from your screen.",
    enabled: true,
    frequency: 20,
    frequencies: [15, 20, 25, 30],
    progress: 0,
    lastTriggered: Date.now(),
  },
  {
    id: "micro",
    title: "Micro-Break",
    description: "Stand up, stretch, and move around for a minute.",
    icon: PersonStanding,
    toastTitle: "Move your body! 🏃",
    toastDescription: "Take a short micro-break to stretch and recharge.",
    spokenPhrase: "Time for a micro-break. Stand up and stretch.",
    enabled: true,
    frequency: 30,
    frequencies: [30, 45, 60],
    progress: 0,
    lastTriggered: Date.now(),
  },
  {
    id: "hydration",
    title: "Hydration",
    description: "Drink some water to stay hydrated and focused.",
    icon: GlassWater,
    toastTitle: "Stay hydrated! 💧",
    toastDescription: "Time to drink some water.",
    spokenPhrase: "Stay hydrated. Time to drink some water.",
    enabled: true,
    frequency: 60,
    frequencies: [45, 60, 90],
    progress: 0,
    lastTriggered: Date.now(),
  },
  {
    id: "snack",
    title: "Snack Break",
    description: "Grab a healthy snack to keep your energy levels up.",
    icon: Grape,
    toastTitle: "Snack time! 🍎",
    toastDescription: "A healthy snack can boost your productivity.",
    spokenPhrase: "It's snack time. Grab a healthy snack.",
    enabled: false,
    frequency: 120,
    frequencies: [90, 120, 180],
    progress: 0,
    lastTriggered: Date.now(),
  },
];

const POMODORO_WORK_MINS = 25;
const POMODORO_BREAK_MINS = 5;

type PomodoroState = "idle" | "work" | "break";

export default function ReminderManager() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>("idle");
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(
    POMODORO_WORK_MINS * 60
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spokenAlertsEnabled, setSpokenAlertsEnabled] = useState(false);

  const { toast } = useToast();
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const spokenAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      notificationAudioRef.current = new Audio(
        "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
      );
      notificationAudioRef.current.volume = 0.5;
      spokenAudioRef.current = new Audio();
      spokenAudioRef.current.volume = 1.0;
    }
  }, []);

  const playSound = () => {
    if (soundEnabled && notificationAudioRef.current) {
      notificationAudioRef.current.currentTime = 0;
      notificationAudioRef.current.play().catch((e) => console.error("Error playing sound:", e));
    }
  };

  const playSpokenAlert = async (text: string) => {
    if (spokenAlertsEnabled && spokenAudioRef.current) {
      try {
        const { audioDataUri } = await textToSpeechAction({ text });
        spokenAudioRef.current.src = audioDataUri;
        spokenAudioRef.current.play().catch((e) => console.error("Error playing spoken alert:", e));
      } catch (error) {
        console.error("Failed to generate or play spoken alert:", error);
        playSound(); // Fallback to normal sound
      }
    } else {
      playSound();
    }
  };

  const triggerReminder = useCallback(
    (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (reminder && reminder.enabled) {
        playSpokenAlert(reminder.spokenPhrase);
        toast({
          title: reminder.toastTitle,
          description: reminder.toastDescription,
        });
        setReminders((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, lastTriggered: Date.now(), progress: 0 } : r
          )
        );
      }
    },
    [reminders, toast, playSpokenAlert]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setReminders((prevReminders) =>
        prevReminders.map((r) => {
          if (!r.enabled) return { ...r, progress: 0 };

          const now = Date.now();
          const frequencyMs = r.frequency * 60 * 1000;
          const elapsedTime = now - r.lastTriggered;
          const progress = Math.min(100, (elapsedTime / frequencyMs) * 100);

          if (elapsedTime >= frequencyMs) {
            triggerReminder(r.id);
            return { ...r, progress: 100 };
          }

          return { ...r, progress };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, triggerReminder]);

  const getRandomQuote = () => {
    return motivationalQuotes[
      Math.floor(Math.random() * motivationalQuotes.length)
    ];
  };

  useEffect(() => {
    if (pomodoroState === "idle") return;

    const timer = setInterval(() => {
      setPomodoroTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (pomodoroState === "work") {
            const toastTitle = "Pomodoro: Break Time! 🎉";
            const phrase = "Pomodoro complete. Time for a break.";
            playSpokenAlert(phrase);
            toast({ title: toastTitle, description: getRandomQuote() });
            setPomodoroState("break");
            return POMODORO_BREAK_MINS * 60;
          } else {
            const toastTitle = "Pomodoro: Focus Time! 🚀";
            const phrase = "Break's over. Time to focus.";
            playSpokenAlert(phrase);
            toast({ title: toastTitle, description: getRandomQuote() });
            setPomodoroState("work");
            return POMODORO_WORK_MINS * 60;
          }
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pomodoroState, toast, playSpokenAlert]);

  const handleToggle = (id: string, checked: boolean) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, enabled: checked, lastTriggered: Date.now(), progress: 0 }
          : r
      )
    );
  };

  const handleFrequencyChange = (id: string, value: string) => {
    const newFrequency = parseInt(value, 10);
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              frequency: newFrequency,
              lastTriggered: Date.now(),
              progress: 0,
            }
          : r
      )
    );
  };

  const handlePomodoroToggle = () => {
    if (pomodoroState === "idle") {
      const toastTitle = "Pomodoro: Focus Time! 🚀";
      const phrase = "Pomodoro started. Time to focus.";
      playSpokenAlert(phrase);
      toast({ title: toastTitle, description: getRandomQuote() });
      setPomodoroState("work");
      setPomodoroTimeLeft(POMODORO_WORK_MINS * 60);
    } else {
      setPomodoroState("idle");
      setPomodoroTimeLeft(POMODORO_WORK_MINS * 60);
    }
  };

  const handlePomodoroReset = () => {
    setPomodoroState("idle");
    setPomodoroTimeLeft(POMODORO_WORK_MINS * 60);
  };

  const handleResetAllReminders = () => {
    setReminders((prev) =>
      prev.map((r) => ({ ...r, lastTriggered: Date.now(), progress: 0 }))
    );
    toast({
      title: "Timers Reset ✨",
      description: "All wellness reminder timers have been reset.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getPomodoroProgress = () => {
    const totalDuration =
      (pomodoroState === "work"
        ? POMODORO_WORK_MINS
        : POMODORO_BREAK_MINS) * 60;
    return ((totalDuration - pomodoroTimeLeft) / totalDuration) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Clock className="h-5 w-5 text-primary" />
          Wellness Reminders
        </CardTitle>
        <CardDescription>
          Customize your reminders to stay healthy and productive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 p-4 rounded-lg bg-muted/50">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <Label htmlFor="pomodoro-toggle" className="font-bold text-lg">
                Pomodoro Timer
              </Label>
              <p className="text-sm text-muted-foreground">
                {POMODORO_WORK_MINS} min work, {POMODORO_BREAK_MINS} min break
                sessions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handlePomodoroToggle}
              >
                {pomodoroState === "idle" ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Button size="icon" variant="ghost" onClick={handlePomodoroReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {pomodoroState !== "idle" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-primary">
                  {pomodoroState === "work" ? "Work" : "Break"}
                </span>
                <span>{formatTime(pomodoroTimeLeft)}</span>
              </div>
              <Progress value={getPomodoroProgress()} className="h-2" />
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-toggle" className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              <span className="font-bold">Enable Alert Sound</span>
            </Label>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="spoken-alerts-toggle" className="flex items-center gap-2">
              <Voicemail className="h-5 w-5" />
              <span className="font-bold">Enable Spoken Alerts</span>
            </Label>
            <Switch
              id="spoken-alerts-toggle"
              checked={spokenAlertsEnabled}
              onCheckedChange={setSpokenAlertsEnabled}
            />
          </div>
        </div>
        
        <Separator />
        
        <div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleResetAllReminders}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset All Timers
          </Button>
        </div>

        <Separator />

        <div className="space-y-8">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="space-y-4">
              <div className="flex items-start gap-4">
                <reminder.icon className="h-6 w-6 text-accent mt-1" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor={`switch-${reminder.id}`}
                      className="font-bold text-lg"
                    >
                      {reminder.title}
                    </Label>
                    <Switch
                      id={`switch-${reminder.id}`}
                      checked={reminder.enabled}
                      onCheckedChange={(checked) =>
                        handleToggle(reminder.id, checked)
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reminder.description}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <Label
                      htmlFor={`select-${reminder.id}`}
                      className="text-sm"
                    >
                      Frequency:
                    </Label>
                    <Select
                      value={String(reminder.frequency)}
                      onValueChange={(value) =>
                        handleFrequencyChange(reminder.id, value)
                      }
                      disabled={!reminder.enabled}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Set frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {reminder.frequencies.map((freq) => (
                          <SelectItem key={freq} value={String(freq)}>
                            Every {freq} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Progress
                value={reminder.enabled ? reminder.progress : 0}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
