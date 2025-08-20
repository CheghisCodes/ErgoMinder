"use client";

import { useToast } from "@/hooks/use-toast";
import { Clock, Eye, GlassWater, PersonStanding } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

type Reminder = {
  id: "eye" | "micro" | "hydration";
  title: string;
  description: string;
  icon: LucideIcon;
  toastTitle: string;
  toastDescription: string;
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
    enabled: true,
    frequency: 60,
    frequencies: [45, 60, 90],
    progress: 0,
    lastTriggered: Date.now(),
  },
];

export default function ReminderManager() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const { toast } = useToast();

  const triggerReminder = useCallback(
    (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (reminder && reminder.enabled) {
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
    [reminders, toast]
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
            // This will be updated inside triggerReminder's setReminders call
            return { ...r, progress: 100 };
          }

          return { ...r, progress };
        })
      );
    }, 1000); // Update progress every second

    return () => clearInterval(interval);
  }, [reminders, triggerReminder]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Clock className="h-5 w-5 text-primary" />
          Customizable Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="space-y-4">
            <div className="flex items-start gap-4">
              <reminder.icon className="h-6 w-6 text-accent mt-1" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`switch-${reminder.id}`} className="font-bold text-lg">
                    {reminder.title}
                  </Label>
                  <Switch
                    id={`switch-${reminder.id}`}
                    checked={reminder.enabled}
                    onCheckedChange={(checked) => handleToggle(reminder.id, checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {reminder.description}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Label htmlFor={`select-${reminder.id}`} className="text-sm">Frequency:</Label>
                  <Select
                    value={String(reminder.frequency)}
                    onValueChange={(value) => handleFrequencyChange(reminder.id, value)}
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
            <Progress value={reminder.enabled ? reminder.progress : 0} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
